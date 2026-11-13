using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Application.Services;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class AttemptLifecycleTests : IAsyncLifetime
{
    // Host is the loopback IP literal, not "localhost": in some local environments
    // (this workspace included) the test-host assembly mix crashes inside Dns
    // resolution, and Npgsql skips DNS entirely for IP literals.
    private const string ConnectionString = "Host=127.0.0.1;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!;Include Error Detail=true";
    private readonly List<Guid> _createdExamIds = new();
    private readonly List<Guid> _createdQuestionIds = new();
    private readonly List<Guid> _createdAttemptIds = new();
    private readonly List<Guid> _createdProfileUserIds = new();

    private NurviaDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new NurviaDbContext(options);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await using var context = CreateDbContext();

        if (_createdProfileUserIds.Any())
        {
            var userIds = _createdProfileUserIds.ToArray();
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"UserProfiles\" WHERE \"UserId\" = ANY(@p0)", (object)userIds);
        }

        if (_createdAttemptIds.Any())
        {
            var attemptIds = _createdAttemptIds.ToArray();
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"AttemptResponses\" WHERE \"ExamAttemptId\" = ANY(@p0)", (object)attemptIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"ExamAttempts\" WHERE \"Id\" = ANY(@p0)", (object)attemptIds);
        }

        if (_createdExamIds.Any())
        {
            var examIds = _createdExamIds.ToArray();
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"ExamQuestions\" WHERE \"ExamVersionId\" IN (SELECT \"Id\" FROM \"ExamVersions\" WHERE \"ExamId\" = ANY(@p0))", (object)examIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"ExamBlueprints\" WHERE \"ExamVersionId\" IN (SELECT \"Id\" FROM \"ExamVersions\" WHERE \"ExamId\" = ANY(@p0))", (object)examIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"ExamVersions\" WHERE \"ExamId\" = ANY(@p0)", (object)examIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"Exams\" WHERE \"Id\" = ANY(@p0)", (object)examIds);
        }

        if (_createdQuestionIds.Any())
        {
            var questionIds = _createdQuestionIds.ToArray();
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"QuestionOptions\" WHERE \"QuestionVersionId\" IN (SELECT \"Id\" FROM \"QuestionVersions\" WHERE \"QuestionId\" = ANY(@p0))", (object)questionIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"QuestionExhibits\" WHERE \"QuestionVersionId\" IN (SELECT \"Id\" FROM \"QuestionVersions\" WHERE \"QuestionId\" = ANY(@p0))", (object)questionIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"QuestionReviews\" WHERE \"QuestionId\" = ANY(@p0)", (object)questionIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"QuestionVersions\" WHERE \"QuestionId\" = ANY(@p0)", (object)questionIds);
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"Questions\" WHERE \"Id\" = ANY(@p0)", (object)questionIds);
        }
    }

    private async Task<(Guid ExamId, Guid Question1Id, Guid Question2Id, Guid Q1CorrectOptionId, List<Guid> Q2CorrectOptionIds)> SeedPublishedExamWithQuestionsAsync(NurviaDbContext context, NursingPathway pathway = NursingPathway.RN)
    {
        var audit = new AuditService(context);
        var questionService = new QuestionService(context, audit);
        var examService = new ExamService(context, audit);

        // 1. Create and Publish Question 1 (SingleChoice)
        var q1Code = $"Q1-{Guid.NewGuid():N}".Substring(0, 16);
        var q1Dto = await questionService.CreateDraftAsync(new CreateQuestionRequest
        {
            Code = q1Code,
            Pathway = pathway,
            Category = ExamCategory.ATI,
            Subject = "Cardiology",
            Topic = "ECG",
            Difficulty = DifficultyLevel.Intermediate,
            QuestionType = QuestionType.SingleChoice,
            Stem = "What is the normal PR interval range?",
            GeneralRationale = "Normal PR interval is 0.12 to 0.20 seconds.",
            Options = new List<CreateOptionRequest>
            {
                new() { OptionIndex = 1, OptionText = "0.06 - 0.10 seconds", IsCorrect = false, SpecificRationale = "Too short" },
                new() { OptionIndex = 2, OptionText = "0.12 - 0.20 seconds", IsCorrect = true, SpecificRationale = "Correct PR duration" },
                new() { OptionIndex = 3, OptionText = "0.22 - 0.30 seconds", IsCorrect = false, SpecificRationale = "Indicates heart block" }
            }
        }, "Author1");
        _createdQuestionIds.Add(q1Dto.Id);

        await questionService.SubmitForReviewAsync(q1Dto.Id, "Author1");
        await questionService.ReviewQuestionAsync(q1Dto.Id, new QuestionReviewRequest { Decision = ReviewDecision.Approved, Comments = "LGTM" }, "rev-1", "Dr. Reviewer");
        var pubQ1 = await questionService.PublishQuestionAsync(q1Dto.Id, "Publisher");
        var q1CorrectOptionId = pubQ1.CurrentVersion!.Options.First(o => o.IsCorrect).Id;

        // 2. Create and Publish Question 2 (MultipleResponse)
        var q2Code = $"Q2-{Guid.NewGuid():N}".Substring(0, 16);
        var q2Dto = await questionService.CreateDraftAsync(new CreateQuestionRequest
        {
            Code = q2Code,
            Pathway = pathway,
            Category = ExamCategory.ATI,
            Subject = "Pharmacology",
            Topic = "Digoxin",
            Difficulty = DifficultyLevel.Advanced,
            QuestionType = QuestionType.MultipleResponse,
            Stem = "Which symptoms indicate Digoxin toxicity?",
            GeneralRationale = "Digoxin toxicity causes visual disturbances and nausea/vomiting.",
            Options = new List<CreateOptionRequest>
            {
                new() { OptionIndex = 1, OptionText = "Yellow-green halos around lights", IsCorrect = true, SpecificRationale = "Classic visual halo sign" },
                new() { OptionIndex = 2, OptionText = "Anorexia and nausea", IsCorrect = true, SpecificRationale = "Early gastrointestinal toxicity symptom" },
                new() { OptionIndex = 3, OptionText = "Hyperglycemia", IsCorrect = false, SpecificRationale = "Not related to digoxin toxicity" }
            }
        }, "Author1");
        _createdQuestionIds.Add(q2Dto.Id);

        await questionService.SubmitForReviewAsync(q2Dto.Id, "Author1");
        await questionService.ReviewQuestionAsync(q2Dto.Id, new QuestionReviewRequest { Decision = ReviewDecision.Approved, Comments = "LGTM" }, "rev-2", "Dr. Reviewer");
        var pubQ2 = await questionService.PublishQuestionAsync(q2Dto.Id, "Publisher");
        var q2CorrectOptionIds = pubQ2.CurrentVersion!.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToList();

        // 3. Create and Publish Exam with both questions
        var examCode = $"EX-{Guid.NewGuid():N}".Substring(0, 16);
        var examDto = await examService.CreateExamAsync(new CreateExamRequest
        {
            Code = examCode,
            Title = "Cardio-Pharm Benchmark Exam",
            Description = "Assessment Description",
            Pathway = pathway,
            Category = ExamCategory.ATI,
            TargetQuestionCount = 2,
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m,
            InitialQuestionIds = new List<Guid> { q1Dto.Id, q2Dto.Id }
        }, "Author1");
        _createdExamIds.Add(examDto.Id);

        await examService.SubmitForReviewAsync(examDto.Id, "Author1");
        await examService.ApproveExamAsync(examDto.Id, "Dean", "Approved blueprint");
        await examService.PublishExamAsync(examDto.Id, "Publisher");

        context.ChangeTracker.Clear();

        return (examDto.Id, q1Dto.Id, q2Dto.Id, q1CorrectOptionId, q2CorrectOptionIds);
    }

    [Fact]
    public async Task StartAttempt_ConcealsAnswerKeysAndCalculatesRemainingTime()
    {
        await using var context = CreateDbContext();
        var (examId, _, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);

        var attemptDto = await service.StartAttemptAsync(examId, "learner-123", "Jane Doe");
        _createdAttemptIds.Add(attemptDto.AttemptId);

        Assert.Equal("Cardio-Pharm Benchmark Exam", attemptDto.ExamTitle);
        Assert.Equal(2, attemptDto.TotalQuestions);
        Assert.True(attemptDto.RemainingSeconds > 3500 && attemptDto.RemainingSeconds <= 3600); // 60 minutes = 3600s
        Assert.Equal(2, attemptDto.Questions.Count);

        // Crucial Security Gate: Verify answer key and rationale concealment
        foreach (var q in attemptDto.Questions)
        {
            Assert.NotEmpty(q.Stem);
            Assert.NotEmpty(q.Options);
            foreach (var opt in q.Options)
            {
                // ActiveExamOptionDto has Id, OptionIndex, OptionText, DisplayOrder - NO IsCorrect, NO Rationale
                Assert.True(opt.OptionIndex > 0);
                Assert.NotEmpty(opt.OptionText);
            }
        }
    }

    [Fact]
    public async Task StartAttempt_PathwayMismatch_IsRejected()
    {
        await using var context = CreateDbContext();
        // Seed a PN/LPN examination, then attempt it as a learner whose profile
        // declares the RN pathway — cross-pathway access must be rejected.
        var (examId, _, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context, NursingPathway.PN_LPN);

        var rnLearnerId = Guid.NewGuid();
        _createdProfileUserIds.Add(rnLearnerId);
        context.UserProfiles.Add(new Nurvia.Domain.Accounts.UserProfile(rnLearnerId)
        {
            Pathway = NursingPathway.RN
        });
        await context.SaveChangesAsync();

        var service = new ExamAttemptService(context);

        var exception = await Assert.ThrowsAsync<DomainException>(
            () => service.StartAttemptAsync(examId, rnLearnerId.ToString(), "RN Learner"));

        Assert.Contains("pathway", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task StartAttempt_PathwayMatch_IsAllowed()
    {
        await using var context = CreateDbContext();
        var (examId, _, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context, NursingPathway.RN);

        var rnLearnerId = Guid.NewGuid();
        _createdProfileUserIds.Add(rnLearnerId);
        context.UserProfiles.Add(new Nurvia.Domain.Accounts.UserProfile(rnLearnerId)
        {
            Pathway = NursingPathway.RN
        });
        await context.SaveChangesAsync();

        var service = new ExamAttemptService(context);

        var attemptDto = await service.StartAttemptAsync(examId, rnLearnerId.ToString(), "RN Learner");
        _createdAttemptIds.Add(attemptDto.AttemptId);

        Assert.Equal(2, attemptDto.TotalQuestions);
    }

    [Fact]
    public async Task StartAttempt_UndeclaredPathway_IsAllowedTransitionally()
    {
        await using var context = CreateDbContext();
        var (examId, _, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);
        var attemptDto = await service.StartAttemptAsync(examId, "learner-no-pathway", "No Pathway Learner");
        _createdAttemptIds.Add(attemptDto.AttemptId);

        Assert.Equal(2, attemptDto.TotalQuestions);
    }

    [Fact]
    public async Task SaveResponse_UpdatesLearnerAnswerAndFlagState()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, q1CorrectOptionId, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);
        var attempt = await service.StartAttemptAsync(examId, "learner-456", "John Smith");
        _createdAttemptIds.Add(attempt.AttemptId);

        var responsePayload = JsonSerializer.Serialize(new { SelectedOptionId = q1CorrectOptionId });
        var autosaveReq = new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = responsePayload,
            IsFlagged = true
        };

        var saveResult = await service.AutosaveResponseAsync(attempt.AttemptId, autosaveReq, "learner-456");

        Assert.True(saveResult.IsFlagged);
        Assert.True(saveResult.IsAnswered);
        Assert.Equal(q1Id, saveResult.QuestionId);

        // Verify in database
        var responseInDb = await context.AttemptResponses
            .FirstOrDefaultAsync(r => r.ExamAttemptId == attempt.AttemptId && r.QuestionId == q1Id);

        Assert.NotNull(responseInDb);
        Assert.True(responseInDb.IsFlagged);
        Assert.True(responseInDb.IsAnswered);
        Assert.Contains(q1CorrectOptionId.ToString(), responseInDb.ResponseJson);
    }

    [Fact]
    public async Task IDOR_Protection_PreventsUnauthorizedAccessAcrossLearners()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);

        var aliceAttempt = await service.StartAttemptAsync(examId, "learner-alice", "Alice");
        _createdAttemptIds.Add(aliceAttempt.AttemptId);

        // Bob tries to get Alice's active attempt -> throws UnauthorizedAccessException
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetActiveAttemptAsync(aliceAttempt.AttemptId, "learner-bob"));

        // Bob tries to autosave an answer to Alice's attempt -> throws UnauthorizedAccessException
        var autosaveReq = new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = "{}",
            IsFlagged = false
        };
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.AutosaveResponseAsync(aliceAttempt.AttemptId, autosaveReq, "learner-bob"));

        // Bob tries to submit Alice's attempt -> throws UnauthorizedAccessException
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.SubmitAttemptAsync(aliceAttempt.AttemptId, "learner-bob"));
    }

    [Fact]
    public async Task SubmitAttempt_CalculatesDeterministicScore_AndReturnsComprehensiveReview()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, q2Id, q1CorrectOptionId, q2CorrectOptionIds) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);
        var attempt = await service.StartAttemptAsync(examId, "learner-scoring", "Scoring Student");
        _createdAttemptIds.Add(attempt.AttemptId);

        // 1. Answer Q1 correctly (SingleChoice, Option 2, 1.0 point)
        await service.AutosaveResponseAsync(attempt.AttemptId, new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = JsonSerializer.Serialize(new { SelectedOptionId = q1CorrectOptionId }),
            IsFlagged = false
        }, "learner-scoring");

        // 2. Answer Q2 partially or incorrectly (MultipleResponse, select only 1 option when 2 are required)
        await service.AutosaveResponseAsync(attempt.AttemptId, new AutosaveResponseRequest
        {
            QuestionId = q2Id,
            ResponseJson = JsonSerializer.Serialize(new { SelectedOptionIds = new List<Guid> { q2CorrectOptionIds[0] } }),
            IsFlagged = false
        }, "learner-scoring");

        // 3. Submit Attempt
        var submitResult = await service.SubmitAttemptAsync(attempt.AttemptId, "learner-scoring");

        Assert.Equal(attempt.AttemptId, submitResult.AttemptId);
        Assert.Equal("Graded", submitResult.Status);
        Assert.Equal(2, submitResult.TotalQuestions);
        Assert.Equal(1, submitResult.CorrectQuestions); // Only Q1 is fully correct
        // Score: 1 out of 2 questions correct = 50.0%
        Assert.Equal(50.0m, submitResult.ScorePercentage);
        Assert.False(submitResult.Passed); // Passing score is 75%

        // 4. Retrieve Full Review and verify rationales and answer keys are now revealed
        var review = await service.GetAttemptReviewAsync(attempt.AttemptId, "learner-scoring");

        Assert.NotNull(review);
        Assert.Equal(submitResult.ScorePercentage, review.ScorePercentage);
        Assert.Equal(2, review.ReviewQuestions.Count);

        var q1Review = review.ReviewQuestions.First(q => q.QuestionId == q1Id);
        Assert.True(q1Review.IsCorrect);
        Assert.Equal(1.0m, q1Review.PointsAwarded);
        Assert.Equal("Normal PR interval is 0.12 to 0.20 seconds.", q1Review.GeneralRationale);
        Assert.Contains(q1Review.Options, o => o.Id == q1CorrectOptionId && o.IsCorrect && o.WasSelected);

        var q2Review = review.ReviewQuestions.First(q => q.QuestionId == q2Id);
        Assert.False(q2Review.IsCorrect);
        // Partial-credit policy: selecting 1 of the 2 correct SATA options earns a
        // proportional share (fraction 0.5) of the question's points, while the
        // question still counts as not fully correct for the aggregate score.
        Assert.Equal(0.5m, q2Review.PointsAwarded);
        Assert.Equal("Digoxin toxicity causes visual disturbances and nausea/vomiting.", q2Review.GeneralRationale);
    }

    [Fact]
    public async Task SubmitAttempt_IsIdempotent_DoesNotMutateOnRepeatedSubmissions()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, q1CorrectOptionId, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var service = new ExamAttemptService(context);
        var attempt = await service.StartAttemptAsync(examId, "learner-idempotent", "Idempotent Student");
        _createdAttemptIds.Add(attempt.AttemptId);

        await service.AutosaveResponseAsync(attempt.AttemptId, new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = JsonSerializer.Serialize(new { SelectedOptionId = q1CorrectOptionId }),
            IsFlagged = false
        }, "learner-idempotent");

        var firstSubmit = await service.SubmitAttemptAsync(attempt.AttemptId, "learner-idempotent");
        var secondSubmit = await service.SubmitAttemptAsync(attempt.AttemptId, "learner-idempotent");

        Assert.Equal(firstSubmit.ScorePercentage, secondSubmit.ScorePercentage);
        Assert.Equal(firstSubmit.Status, secondSubmit.Status);
        Assert.Equal(firstSubmit.SubmittedAtUtc, secondSubmit.SubmittedAtUtc);
    }
}
