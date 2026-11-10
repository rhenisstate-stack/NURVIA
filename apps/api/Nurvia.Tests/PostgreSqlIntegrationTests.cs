using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Questions;
using Nurvia.Application.Services;
using Nurvia.Application.Security;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Npgsql;
using System.ComponentModel.DataAnnotations;
using System.Data.Common;
using Xunit;

namespace Nurvia.Tests;

public class PostgreSqlIntegrationTests : IAsyncLifetime
{
    private readonly Xunit.Abstractions.ITestOutputHelper _output;
    private readonly string _connectionString;
    private static bool _validationPerformed = false;

    public PostgreSqlIntegrationTests(Xunit.Abstractions.ITestOutputHelper output)
    {
        _output = output;
        _connectionString = Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING") 
                           ?? "Host=localhost;Port=5432;Database=nurvia_test;Username=nurvia_test_user;Password=nurvia_secure_test_password_dev2026!;Include Error Detail=true";
        ValidateTestEnvironmentAndDatabase();
    }

    private void ValidateTestEnvironmentAndDatabase()
    {
        // Ensure validation happens only once
        if (_validationPerformed) return;
        _validationPerformed = true;

        // 1. Validate that we're running in Test environment
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
        if (string.IsNullOrEmpty(environment) || environment != "Test")
        {
            throw new InvalidOperationException("Tests must be run with DOTNET_ENVIRONMENT=Test");
        }

        // 2. Validate database name is exactly "nurvia_test"
        var builder = new NpgsqlConnectionStringBuilder(_connectionString);
        if (builder.Database != "nurvia_test")
        {
            throw new InvalidOperationException($"Test environment must use 'nurvia_test' database. Current database: {builder.Database}");
        }

        // 3. Validate that we're NOT using development database
        if (builder.Database == "nurvia_db")
        {
            throw new InvalidOperationException("Test environment cannot use development database 'nurvia_db'");
        }

        // 4. Validate that we're NOT using production database (simple heuristic)
        if (builder.Database.Contains("production") || builder.Database.Contains("prod"))
        {
            throw new InvalidOperationException("Test environment cannot use production database");
        }

        // 5. Validate connection string format
        if (string.IsNullOrEmpty(builder.Host) || builder.Port <= 0)
        {
            throw new InvalidOperationException("Invalid database connection string: missing host or port");
        }

        // 6. Validate that we're not connecting to production host
        if (builder.Host == "prod-db.nurvia.com" || builder.Host == "production-db.nurvia.com")
        {
            throw new InvalidOperationException("Test environment cannot connect to production database host");
        }
        
        // 7. Validate that we have a password (security check)
        if (string.IsNullOrEmpty(builder.Password))
        {
            throw new InvalidOperationException("Database password must be configured for test environment");
        }
    }

    private readonly List<Guid> _createdQuestionIds = new();
    private readonly List<Guid> _createdExamIds = new();
    private readonly List<Guid> _createdUserIds = new();

    private NurviaDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(_connectionString)
            .EnableSensitiveDataLogging()
            .LogTo(_output.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
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

        if (_createdUserIds.Any())
        {
            var users = await context.UserAccounts.Where(user => _createdUserIds.Contains(user.Id)).ToListAsync();
            context.UserAccounts.RemoveRange(users);
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
        Assert.Contains("ExamAttempts", tables);
        Assert.Contains("AttemptResponses", tables);
        Assert.Contains("AuditLogs", tables);
        Assert.Contains("UserAccounts", tables);
    }

    [Fact]
    public async Task LearnerRegistrationAndProfileChanges_PersistThroughPostgreSql()
    {
        await using var context = CreateDbContext();
        var authService = new AuthService(context, new Pbkdf2PasswordHasher());
        var email = $"learner-{Guid.NewGuid():N}@example.test";
        const string password = "NursingConfidence-2026!";

        var registered = await authService.RegisterAsync(new RegistrationRequest
        {
            Name = "Test Learner",
            Email = email,
            Password = password
        }, CancellationToken.None);

        Assert.True(registered);
        var user = await authService.AuthenticateAsync(email, password, CancellationToken.None);
        Assert.NotNull(user);
        Assert.Equal("Learner", user.Role);
        _createdUserIds.Add(Guid.Parse(user.Id));

        var persisted = await context.UserAccounts.SingleAsync(account => account.Id == Guid.Parse(user.Id));
        Assert.NotEqual(password, persisted.PasswordHash);
        Assert.False(await authService.RegisterAsync(new RegistrationRequest
        {
            Name = "Duplicate",
            Email = email.ToUpperInvariant(),
            Password = password
        }, CancellationToken.None));

        var updated = await authService.UpdateProfileAsync(user.Id, "Updated Learner", CancellationToken.None);
        Assert.NotNull(updated);
        Assert.Equal("Updated Learner", updated.Name);
        Assert.Equal("Updated Learner", await context.UserAccounts
            .Where(account => account.Id == Guid.Parse(user.Id))
            .Select(account => account.Name)
            .SingleAsync());
    }

    [Fact]
    public async Task BootstrapSuperadmin_IsOneTimeAndDoesNotEscalateAnExistingAccount()
    {
        await using var context = CreateDbContext();
        var authService = new AuthService(context, new Pbkdf2PasswordHasher());
        var email = $"admin-{Guid.NewGuid():N}@example.test";

        Assert.True(await authService.BootstrapSuperadminAsync(
            "Bootstrap Admin", email, "NursingConfidence-2026!", CancellationToken.None));

        var account = await context.UserAccounts.SingleAsync(user => user.NormalizedEmail == email.ToUpperInvariant());
        _createdUserIds.Add(account.Id);
        Assert.Equal("Superadmin", account.Role);
        Assert.False(await authService.BootstrapSuperadminAsync(
            "Different Admin", email, "AnotherPassword-2026!", CancellationToken.None));
        Assert.Equal("Superadmin", account.Role);
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
