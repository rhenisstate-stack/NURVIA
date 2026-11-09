using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Questions;
using Nurvia.Application.Services;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class PostgreSqlIntegrationTests : IAsyncLifetime
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!;Include Error Detail=true";
    private readonly List<Guid> _createdQuestionIds = new();
    private readonly List<Guid> _createdExamIds = new();

    private NurviaDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(ConnectionString)
            .EnableSensitiveDataLogging()
            .Options;

        return new NurviaDbContext(options);
    }

    public async Task InitializeAsync()
    {
        await using var context = CreateDbContext();
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await using var context = CreateDbContext();
        if (_createdExamIds.Any())
        {
            var exams = await context.Exams.Where(e => _createdExamIds.Contains(e.Id)).ToListAsync();
            context.Exams.RemoveRange(exams);
        }

        if (_createdQuestionIds.Any())
        {
            var questions = await context.Questions.Where(q => _createdQuestionIds.Contains(q.Id)).ToListAsync();
            context.Questions.RemoveRange(questions);
        }

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task Database_AllExpectedTables_ExistInSchema()
    {
        await using var context = CreateDbContext();

        var tables = await context.Database.SqlQueryRaw<string>(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        ).ToListAsync();

        Assert.Contains("__EFMigrationsHistory", tables);
        Assert.Contains("Questions", tables);
        Assert.Contains("QuestionVersions", tables);
        Assert.Contains("QuestionOptions", tables);
        Assert.Contains("QuestionExhibits", tables);
        Assert.Contains("QuestionReviews", tables);
        Assert.Contains("Exams", tables);
        Assert.Contains("ExamVersions", tables);
        Assert.Contains("ExamQuestions", tables);
        Assert.Contains("ExamBlueprints", tables);
        Assert.Contains("AuditLogs", tables);
    }

    [Fact]
    public async Task QuestionAndOptions_PersistenceAndRetrieval_PreservesIntegrity()
    {
        await using var context = CreateDbContext();
        var uniqueCode = $"Q-TEST-{Guid.NewGuid():N}".Substring(0, 20);

        var question = new Question(uniqueCode, NursingPathway.RN, ExamCategory.ATI, "Pharmacology", "Beta Blockers", DifficultyLevel.Intermediate, "Dr. Test");
        var version = new QuestionVersion(question.Id, 1, "Which clinical parameter is priority before Metoprolol administration?", QuestionType.MultipleChoice, "Dr. Test")
        {
            GeneralRationale = "Metoprolol reduces heart rate and blood pressure; hold if heart rate < 60 bpm.",
            Status = ContentStatus.Draft
        };

        version.Options.Add(new QuestionOption(1, "Blood glucose level", false, "Not affected", 1));
        version.Options.Add(new QuestionOption(2, "Apical pulse rate", true, "Hold if < 60 bpm", 2));
        question.Versions.Add(version);

        context.Questions.Add(question);
        await context.SaveChangesAsync();
        _createdQuestionIds.Add(question.Id);

        // Query fresh from DB without tracking
        var retrieved = await context.Questions
            .Include(q => q.Versions)
                .ThenInclude(v => v.Options)
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == question.Id);

        Assert.NotNull(retrieved);
        Assert.Equal(uniqueCode, retrieved.Code);
        Assert.Single(retrieved.Versions);
        var retVersion = retrieved.Versions.First();
        Assert.Equal(2, retVersion.Options.Count);
        Assert.Contains(retVersion.Options, o => o.IsCorrect && o.OptionText.Contains("Apical pulse"));
    }

    [Fact]
    public async Task ExamBlueprintAndVersion_Publication_EnforcesImmutability()
    {
        await using var context = CreateDbContext();
        var audit = new AuditService(context);
        var questionService = new QuestionService(context, audit);
        var examService = new ExamService(context, audit);

        var uniqueCode = $"EXAM-{Guid.NewGuid():N}".Substring(0, 16);
        var qCode = $"Q-PUB-{Guid.NewGuid():N}".Substring(0, 20);

        // 1. Create and publish a question using QuestionService
        var qDto = await questionService.CreateDraftAsync(new CreateQuestionRequest
        {
            Code = qCode,
            Pathway = NursingPathway.RN,
            Category = ExamCategory.ATI,
            Subject = "Fundamentals",
            Topic = "Patient Safety",
            Difficulty = DifficultyLevel.Foundational,
            QuestionType = QuestionType.MultipleChoice,
            Stem = "Which nursing action prevents accidental falls in an elderly confused patient?",
            GeneralRationale = "Placing the bed in its lowest position with the call light in reach preserves safety.",
            Options = new List<CreateOptionRequest>
            {
                new() { OptionIndex = 1, OptionText = "Place bed in lowest position with call light in reach", IsCorrect = true },
                new() { OptionIndex = 2, OptionText = "Raise all four side rails against patient wishes", IsCorrect = false }
            }
        }, "Lead Educator Elena Vance");
        _createdQuestionIds.Add(qDto.Id);

        await questionService.SubmitForReviewAsync(qDto.Id, "Lead Educator Elena Vance");
        context.ChangeTracker.Clear();

        await questionService.ReviewQuestionAsync(qDto.Id, new QuestionReviewRequest
        {
            Decision = ReviewDecision.Approved,
            Comments = "Excellent safety item"
        }, "rev-101", "Dr. Reviewer");
        context.ChangeTracker.Clear();

        await questionService.PublishQuestionAsync(qDto.Id, "Publisher Admin");
        context.ChangeTracker.Clear();

        // 2. Create exam using ExamService with InitialQuestionIds
        var examDto = await examService.CreateExamAsync(new CreateExamRequest
        {
            Code = uniqueCode,
            Title = "NCLEX Comprehensive Readiness Benchmark",
            Description = "Predictive readiness exam for RN candidates",
            Pathway = NursingPathway.RN,
            Category = ExamCategory.ATI,
            TargetQuestionCount = 50,
            TimeLimitMinutes = 90,
            PassingScorePercentage = 75,
            InitialQuestionIds = new List<Guid> { qDto.Id }
        }, "Director Sarah Hayes");
        _createdExamIds.Add(examDto.Id);
        context.ChangeTracker.Clear();

        // 3. Workflow transitions simulating separate administrative requests
        await examService.SubmitForReviewAsync(examDto.Id, "Director Sarah Hayes");
        context.ChangeTracker.Clear();

        await examService.ApproveExamAsync(examDto.Id, "Dean of Nursing", "Approved blueprint");
        context.ChangeTracker.Clear();

        var publishedExam = await examService.PublishExamAsync(examDto.Id, "Chief Academic Officer");
        context.ChangeTracker.Clear();

        Assert.Equal(ExamStatus.Published, publishedExam.Status);
        Assert.NotNull(publishedExam.CurrentVersion);
        Assert.Equal(ExamStatus.Published, publishedExam.CurrentVersion.Status);

        // 4. Immutability: Attempting to submit or publish already published exam throws DomainException
        await Assert.ThrowsAsync<DomainException>(() =>
            examService.SubmitForReviewAsync(examDto.Id, "Editor"));
    }

    [Fact]
    public async Task TransactionRollback_OnFailure_LeavesDatabaseUnchanged()
    {
        await using var context = CreateDbContext();
        var uniqueCode = $"Q-TX-{Guid.NewGuid():N}".Substring(0, 20);

        await using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var question = new Question(uniqueCode, NursingPathway.RN, ExamCategory.HESI, "Pediatrics", "Asthma", DifficultyLevel.Foundational, "Author");
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            // Simulate business logic error requiring rollback
            throw new InvalidOperationException("Simulated mid-operation transaction failure");
        }
        catch (InvalidOperationException)
        {
            await transaction.RollbackAsync();
        }

        // Verify question was NOT persisted
        var persisted = await context.Questions.AsNoTracking().FirstOrDefaultAsync(q => q.Code == uniqueCode);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DatabaseSeeder_IsIdempotent_DoesNotDuplicateSeedData()
    {
        await using var context = CreateDbContext();

        // DatabaseSeeder checks context.Questions.AnyAsync() and returns if already seeded
        var countBefore = await context.Questions.CountAsync();
        await DatabaseSeeder.SeedAsync(context);
        var countAfter = await context.Questions.CountAsync();

        Assert.Equal(countBefore, countAfter);
    }

    [Fact]
    public async Task ReferentialIntegrity_DeletingQuestion_CascadesVersionsAndOptions()
    {
        await using var context = CreateDbContext();
        var uniqueCode = $"Q-REF-{Guid.NewGuid():N}".Substring(0, 20);

        var question = new Question(uniqueCode, NursingPathway.RN, ExamCategory.ATI, "Ethics", "Autonomy", DifficultyLevel.Foundational, "Author");
        var version = new QuestionVersion(question.Id, 1, "Which scenario demonstrates respecting client autonomy?", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "Autonomy refers to the right of clients to make their own healthcare decisions."
        };
        version.Options.Add(new QuestionOption(1, "Informing client about risks and accepting refusal", true));
        version.Options.Add(new QuestionOption(2, "Sedating client against expressed wishes", false));
        question.Versions.Add(version);

        context.Questions.Add(question);
        await context.SaveChangesAsync();

        var qId = question.Id;
        var vId = version.Id;

        // Delete question
        context.Questions.Remove(question);
        await context.SaveChangesAsync();

        // Verify cascade deletion
        var qCheck = await context.Questions.FindAsync(qId);
        var vCheck = await context.QuestionVersions.FindAsync(vId);
        var oCheck = await context.QuestionOptions.Where(o => o.QuestionVersionId == vId).ToListAsync();

        Assert.Null(qCheck);
        Assert.Null(vCheck);
        Assert.Empty(oCheck);
    }
}
