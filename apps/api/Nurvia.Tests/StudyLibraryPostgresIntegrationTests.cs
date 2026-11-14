using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Services;
using Nurvia.Application.StudyLibrary;
using Nurvia.Application.Tutor;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class StudyLibraryPostgresIntegrationTests : IAsyncLifetime
{
    private const string ConnectionString =
        "Host=127.0.0.1;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!;Include Error Detail=true";

    private readonly List<Guid> _createdExamIds = new();
    private readonly List<Guid> _createdQuestionIds = new();

    private static NurviaDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new NurviaDbContext(options);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await using var context = CreateContext();
        foreach (var examId in _createdExamIds)
        {
            await context.Database.ExecuteSqlRawAsync(
                @"DELETE FROM ""AttemptResponses"" WHERE ""ExamAttemptId"" IN (SELECT ""Id"" FROM ""ExamAttempts"" WHERE ""ExamId"" = {0})",
                examId);
            await context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""ExamAttempts"" WHERE ""ExamId"" = {0}", examId);
            await context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""SavedStudySets"" WHERE ""ExamId"" = {0}", examId);
            await context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""ExamReviews"" WHERE ""ExamId"" = {0}", examId);
            await context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""Exams"" WHERE ""Id"" = {0}", examId);
        }

        foreach (var qId in _createdQuestionIds)
        {
            await context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""Questions"" WHERE ""Id"" = {0}", qId);
        }
    }

    [Fact]
    public async Task Postgres_StudyLibrary_Filters_PersonalLibrary_Reviews_And_Tutor_EndToEnd()
    {
        await using var context = CreateContext();

        var q = new Question
        {
            Code = $"PG-Q-{Guid.NewGuid():N}"[..20],
            Subject = "Critical Care",
            Topic = "Sepsis Management",
            Difficulty = DifficultyLevel.Advanced,
            Pathway = NursingPathway.RN,
            Category = ExamCategory.HESI,
            CreatedBy = "pg-test",
            Status = ContentStatus.Published
        };
        var qv = new QuestionVersion(q.Id, 1, "A patient presents with suspected septic shock...", QuestionType.MultipleChoice, "pg-test")
        {
            CognitiveSkill = CognitiveSkill.PrioritizeHypotheses,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Obtain blood cultures before initiating broad-spectrum IV antibiotics.",
            Status = ContentStatus.Published
        };
        var optCorrect = new QuestionOption(1, "Obtain blood cultures then start IV antibiotics", true, "Cultures must precede antibiotics.");
        var optWrong = new QuestionOption(2, "Wait 24 hours for cultures before antibiotics", false, "Delays increase sepsis mortality.");
        qv.Options.Add(optCorrect);
        qv.Options.Add(optWrong);

        var exam = new Exam(
            $"PG-EX-{Guid.NewGuid():N}"[..20],
            "PG Sepsis Readiness Exam",
            "PostgreSQL integration test study set",
            NursingPathway.RN,
            ExamCategory.HESI,
            "pg-test")
        {
            School = "Stanford Nursing PG",
            AcademicYear = 2026,
            Season = "Winter",
            Subject = "Critical Care",
            Topic = "Sepsis Management",
            Difficulty = DifficultyLevel.Advanced,
            LearningObjectives = new List<string> { "Prioritize sepsis bundle interventions" },
            ModeAllowed = ExamDeliveryMode.All,
            TotalQuestions = 1,
            Status = ExamStatus.Published
        };
        var version = new ExamVersion(exam.Id, 1, exam.Title, exam.Description, "pg-test")
        {
            Instructions = "Select the priority nursing intervention.",
            Status = ExamStatus.Published
        };
        version.ExamQuestions.Add(new ExamQuestion(version.Id, q.Id, qv.Id, 1, 1));
        q.Versions.Add(qv);
        exam.Versions.Add(version);

        context.Questions.Add(q);
        context.Exams.Add(exam);
        await context.SaveChangesAsync();

        q.CurrentVersion = qv;
        q.CurrentVersionId = qv.Id;
        exam.CurrentVersion = version;
        exam.CurrentVersionId = version.Id;
        await context.SaveChangesAsync();

        _createdExamIds.Add(exam.Id);
        _createdQuestionIds.Add(q.Id);

        var libraryService = new StudyLibraryService(context);
        var learnerId = $"pg-learner-{Guid.NewGuid():N}";

        // 1. Combined PostgreSQL filters including QuestionType derived from QuestionVersion
        var filtered = await libraryService.GetCatalogAsync(new StudyLibraryFilterRequest
        {
            School = "Stanford Nursing PG",
            AcademicYear = 2026,
            Season = "Winter",
            Subject = "Critical Care",
            Topic = "Sepsis Management",
            Difficulty = DifficultyLevel.Advanced,
            QuestionType = QuestionType.MultipleChoice,
            Pathway = NursingPathway.RN,
            Category = ExamCategory.HESI,
            ExamId = exam.Id,
            SearchTerm = "Sepsis"
        }, learnerId);

        Assert.Equal(1, filtered.TotalCount);
        var card = Assert.Single(filtered.Items);
        Assert.Equal(1, card.TotalQuestions);
        Assert.Equal("Stanford Nursing PG", card.School);

        // 2. Save & duplicate save idempotency + SavedOnly filter
        await libraryService.SaveStudySetAsync(exam.Id, learnerId);
        await libraryService.SaveStudySetAsync(exam.Id, learnerId);
        var savedOnly = await libraryService.GetCatalogAsync(new StudyLibraryFilterRequest { SavedOnly = true }, learnerId);
        Assert.Single(savedOnly.Items);

        // 3. Tutor mode end-to-end on PostgreSQL
        var attemptService = new ExamAttemptService(context);
        var started = await attemptService.StartAttemptAsync(exam.Id, learnerId, "PG Learner", ExamDeliveryMode.Tutor, null);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());
        var hint = await tutorService.GetHintAsync(started.AttemptId, learnerId, new TutorHintRequest { QuestionId = q.Id, Stage = TutorStage.FirstHint });
        Assert.Contains("Critical Care", hint.Content);

        var eval = await tutorService.EvaluateAnswerAsync(started.AttemptId, learnerId, new TutorEvaluateRequest
        {
            QuestionId = q.Id,
            ResponseJson = $$"""{"SelectedOptionId":"{{optCorrect.Id}}"}"""
        });
        Assert.True(eval.IsCorrect);

        // 4. Submit attempt, then submit verified review
        await attemptService.SubmitAttemptAsync(started.AttemptId, learnerId);
        var review = await libraryService.SubmitReviewAsync(exam.Id, learnerId, "PG Learner", new SubmitExamReviewRequest
        {
            Rating = 5,
            Comment = "Accurate sepsis bundle scenario."
        });
        Assert.Equal(5, review.Rating);

        var detail = await libraryService.GetStudySetDetailAsync(exam.Id, learnerId);
        Assert.NotNull(detail);
        Assert.Equal(5.0, detail!.AverageRating);
        Assert.Equal(1, detail.ReviewCount);
        Assert.True(detail.CanReview);
        Assert.True(detail.IsSaved);
    }
}
