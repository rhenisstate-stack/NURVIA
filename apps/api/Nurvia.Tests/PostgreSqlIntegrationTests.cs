using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class PostgreSqlIntegrationTests
{
    private const string BaseConnectionString = "Host=localhost;Port=5432;Username=nurvia_user;Password=nurvia_secure_password_dev2026!";
    private const string TestDbName = "nurvia_assurance_test_db";
    private readonly string _testConnectionString = $"{BaseConnectionString};Database={TestDbName}";

    private async Task<NurviaDbContext> CreateTestDbContextAsync()
    {
        // Connect to default db to ensure test db exists
        var adminOptions = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql($"{BaseConnectionString};Database=nurvia_db")
            .Options;

        await using (var adminContext = new NurviaDbContext(adminOptions))
        {
            var exists = await adminContext.Database.SqlQueryRaw<int>(
                $"SELECT 1 FROM pg_database WHERE datname = '{TestDbName}'").ToListAsync();

            if (!exists.Any())
            {
                await adminContext.Database.ExecuteSqlRawAsync($"CREATE DATABASE {TestDbName};");
            }
        }

        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(_testConnectionString)
            .Options;

        var context = new NurviaDbContext(options);
        await context.Database.MigrateAsync();
        return context;
    }

    [Fact]
    public async Task EmptyDatabase_MigrateAsync_SucceedsAndCreatesAllExpectedTables()
    {
        await using var context = await CreateTestDbContextAsync();

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
        await using var context = await CreateTestDbContextAsync();
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
        await using var context = await CreateTestDbContextAsync();
        var uniqueCode = $"EXAM-{Guid.NewGuid():N}".Substring(0, 16);

        // First create a published question to be part of the exam
        var qCode = $"Q-PUB-{Guid.NewGuid():N}".Substring(0, 20);
        var question = new Question(qCode, NursingPathway.RN, ExamCategory.ATI, "Fundamentals", "Safety", DifficultyLevel.Foundational, "Author");
        var qv = new QuestionVersion(question.Id, 1, "Which action prevents falls in an elderly confused client?", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "Placing bed in lowest position with call light within reach prevents falls.",
            Status = ContentStatus.Draft
        };
        qv.Options.Add(new QuestionOption(1, "Place bed in lowest position with call light in reach", true));
        qv.Options.Add(new QuestionOption(2, "Raise all 4 side rails to prevent exit", false));
        question.Versions.Add(qv);
        question.CurrentVersion = qv;
        question.SubmitForReview("Author");
        question.Approve("rev-01", "Dr. Reviewer", "Approved for exam publication");
        question.Publish("Publisher");
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        // Now create the exam
        var exam = new Exam(uniqueCode, "NCLEX Comprehensive Readiness", "Benchmark assessment", NursingPathway.RN, ExamCategory.ATI, "Director");
        var v1 = new ExamVersion(exam.Id, 1, "Version 1", "Draft version", "Director")
        {
            TimeLimitMinutes = 90,
            PassingScorePercentage = 75,
            Blueprint = new ExamBlueprint(Guid.NewGuid(), 50)
            {
                SubjectDistributionJson = "{\"Pharmacology\": 20, \"MedSurg\": 30}"
            }
        };
        v1.ExamQuestions.Add(new ExamQuestion(v1.Id, question.Id, qv.Id, 1, 1)
        {
            Question = question
        });
        exam.Versions.Add(v1);
        exam.CurrentVersion = v1;
        exam.CurrentVersionId = v1.Id;
        context.Exams.Add(exam);
        await context.SaveChangesAsync();

        // Invariant: Cannot publish directly from Draft
        Assert.Throws<DomainException>(() => exam.Publish("Publisher"));

        // Valid transition lifecycle
        exam.SubmitForReview("Director");
        Assert.Equal(ExamStatus.PendingReview, exam.Status);

        exam.Approve("Dean of Nursing", "Approved blueprint");
        Assert.Equal(ExamStatus.Approved, exam.Status);

        exam.Publish("Chief Nursing Officer");
        Assert.Equal(ExamStatus.Published, exam.Status);
        await context.SaveChangesAsync();

        var publishedExam = await context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.Blueprint)
            .FirstOrDefaultAsync(e => e.Id == exam.Id);

        Assert.NotNull(publishedExam);
        Assert.Equal(ExamStatus.Published, publishedExam.Status);
        Assert.Equal(ExamStatus.Published, publishedExam.CurrentVersion!.Status);

        // Attempting to submit an already published exam throws DomainException
        Assert.Throws<DomainException>(() =>
        {
            publishedExam.SubmitForReview("Editor");
        });
    }

    [Fact]
    public async Task TransactionRollback_OnFailure_LeavesDatabaseUnchanged()
    {
        await using var context = await CreateTestDbContextAsync();
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
        await using var context = await CreateTestDbContextAsync();

        // Run seed twice
        await DatabaseSeeder.SeedAsync(context);
        var countFirst = await context.Questions.CountAsync();

        await DatabaseSeeder.SeedAsync(context);
        var countSecond = await context.Questions.CountAsync();

        Assert.True(countFirst > 0);
        Assert.Equal(countFirst, countSecond);
    }

    [Fact]
    public async Task ReferentialIntegrity_DeletingQuestion_CascadesVersionsAndOptions()
    {
        await using var context = await CreateTestDbContextAsync();
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
