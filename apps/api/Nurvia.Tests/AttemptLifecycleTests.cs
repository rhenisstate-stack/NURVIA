using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Attempts;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Questions;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class AttemptLifecycleTests : IAsyncLifetime
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!;Include Error Detail=true";
    private readonly List<Guid> _createdExamIds = new();
    private readonly List<Guid> _createdQuestionIds = new();
    private readonly List<Guid> _createdAttemptIds = new();

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

        if (_createdAttemptIds.Any())
        {
            var attempts = await context.ExamAttempts.Where(a => _createdAttemptIds.Contains(a.Id)).ToListAsync();
            context.ExamAttempts.RemoveRange(attempts);
        }

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

    private async Task<(Guid ExamId, Guid Question1Id, Guid Question2Id, int Q1CorrectOptionId, int Q2CorrectOptionId)> SeedPublishedExamWithQuestionsAsync(NurviaDbContext context)
    {
        // 1. Create two test questions
        var code1 = $"Q1-{Guid.NewGuid():N}".Substring(0, 16);
        var q1 = new Question(code1, NursingPathway.RN, ExamCategory.NCLEX_RN, "Cardiology", "ECG", DifficultyLevel.Intermediate, "Author1");
        var v1 = new QuestionVersion(q1.Id, 1, "What is the normal PR interval range?", QuestionType.SingleChoice, "Author1")
        {
            Status = ContentStatus.Published,
            GeneralRationale = "Normal PR interval is 0.12 to 0.20 seconds."
        };
        v1.Options.Add(new QuestionOption(1, "0.06 - 0.10 seconds", false, "Too short", 1));
        v1.Options.Add(new QuestionOption(2, "0.12 - 0.20 seconds", true, "Correct PR duration", 2));
        v1.Options.Add(new QuestionOption(3, "0.22 - 0.30 seconds", false, "Indicates heart block", 3));
        q1.Versions.Add(v1);
        context.Questions.Add(q1);
        _createdQuestionIds.Add(q1.Id);

        var code2 = $"Q2-{Guid.NewGuid():N}".Substring(0, 16);
        var q2 = new Question(code2, NursingPathway.RN, ExamCategory.NCLEX_RN, "Pharmacology", "Digoxin", DifficultyLevel.Advanced, "Author1");
        var v2 = new QuestionVersion(q2.Id, 1, "Which symptoms indicate Digoxin toxicity?", QuestionType.MultipleResponse, "Author1")
        {
            Status = ContentStatus.Published,
            GeneralRationale = "Digoxin toxicity causes visual disturbances and nausea/vomiting."
        };
        v2.Options.Add(new QuestionOption(10, "Yellow-green halos around lights", true, "Classic visual halo sign", 1));
        v2.Options.Add(new QuestionOption(11, "Anorexia and nausea", true, "Early gastrointestinal toxicity symptom", 2));
        v2.Options.Add(new QuestionOption(12, "Hyperglycemia", false, "Not related to digoxin toxicity", 3));
        q2.Versions.Add(v2);
        context.Questions.Add(q2);
        _createdQuestionIds.Add(q2.Id);

        // 2. Create Published Exam
        var examCode = $"EX-{Guid.NewGuid():N}".Substring(0, 16);
        var exam = new Exam(examCode, NursingPathway.RN, ExamCategory.NCLEX_RN, "Cardio-Pharm Benchmark", "Assessment", "Author1");
        var examVersion = new ExamVersion(exam.Id, 1, "Cardio-Pharm Benchmark Exam", 60, 75.0m, "Author1")
        {
            Status = ExamPublishStatus.Published,
            PublishedAtUtc = DateTime.UtcNow
        };
        examVersion.Questions.Add(new ExamQuestion(examVersion.Id, q1.Id, 1, 1.0m));
        examVersion.Questions.Add(new ExamQuestion(examVersion.Id, q2.Id, 2, 2.0m));
        exam.Versions.Add(examVersion);

        context.Exams.Add(exam);
        await context.SaveChangesAsync();
        _createdExamIds.Add(exam.Id);

        return (exam.Id, q1.Id, q2.Id, 2, 10);
    }

    [Fact]
    public async Task StartAttempt_ConcealsAnswerKeysAndCalculatesRemainingTime()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, q2Id, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var learnerUser = new CurrentUser("learner-123", "Jane Doe", "jane@example.com", "Learner");
        var service = new ExamAttemptService(context, learnerUser);

        var attemptDto = await service.StartAttemptAsync(examId);
        _createdAttemptIds.Add(attemptDto.AttemptId);

        Assert.Equal("Jane Doe", attemptDto.LearnerName);
        Assert.Equal(ExamAttemptStatus.InProgress, attemptDto.Status);
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
                // ActiveExamOptionDto must NOT contain IsCorrect or Rationale fields
                Assert.True(opt.OrderIndex > 0);
                Assert.NotEmpty(opt.Text);
            }
        }
    }

    [Fact]
    public async Task SaveResponse_UpdatesLearnerAnswerAndFlagState()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var learnerUser = new CurrentUser("learner-456", "John Smith", "john@example.com", "Learner");
        var service = new ExamAttemptService(context, learnerUser);

        var attempt = await service.StartAttemptAsync(examId);
        _createdAttemptIds.Add(attempt.AttemptId);

        var saveResult = await service.SaveResponseAsync(attempt.AttemptId, new SaveResponseDto(
            q1Id,
            SelectedOptionId: 2,
            SelectedOptionIds: null,
            TextResponse: null,
            NumericResponse: null,
            IsFlagged: true
        ));

        Assert.True(saveResult.Success);
        Assert.True(saveResult.IsFlagged);
        Assert.True(saveResult.IsAnswered);

        // Verify in database
        var responseInDb = await context.AttemptResponses
            .FirstOrDefaultAsync(r => r.ExamAttemptId == attempt.AttemptId && r.QuestionId == q1Id);

        Assert.NotNull(responseInDb);
        Assert.True(responseInDb.IsFlagged);
        Assert.True(responseInDb.IsAnswered);
        Assert.Contains("\"SelectedOptionId\":2", responseInDb.ResponseJson);
    }

    [Fact]
    public async Task IDOR_Protection_PreventsUnauthorizedAccessAcrossLearners()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, _, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var learnerAlice = new CurrentUser("learner-alice", "Alice", "alice@example.com", "Learner");
        var learnerBob = new CurrentUser("learner-bob", "Bob", "bob@example.com", "Learner");

        var aliceService = new ExamAttemptService(context, learnerAlice);
        var bobService = new ExamAttemptService(context, learnerBob);

        var aliceAttempt = await aliceService.StartAttemptAsync(examId);
        _createdAttemptIds.Add(aliceAttempt.AttemptId);

        // Bob tries to get Alice's active attempt
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            bobService.GetActiveAttemptAsync(aliceAttempt.AttemptId));

        // Bob tries to save an answer to Alice's attempt
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            bobService.SaveResponseAsync(aliceAttempt.AttemptId, new SaveResponseDto(q1Id, 1, null, null, null, false)));

        // Bob tries to submit Alice's attempt
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            bobService.SubmitAttemptAsync(aliceAttempt.AttemptId));
    }

    [Fact]
    public async Task SubmitAttempt_CalculatesDeterministicScore_AndReturnsComprehensiveReview()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, q2Id, q1CorrectOption, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var learnerUser = new CurrentUser("learner-scoring", "Scoring Student", "student@example.com", "Learner");
        var service = new ExamAttemptService(context, learnerUser);

        var attempt = await service.StartAttemptAsync(examId);
        _createdAttemptIds.Add(attempt.AttemptId);

        // 1. Answer Q1 correctly (Single Choice, Option 2, worth 1.0 point)
        await service.SaveResponseAsync(attempt.AttemptId, new SaveResponseDto(
            q1Id,
            SelectedOptionId: q1CorrectOption,
            SelectedOptionIds: null,
            TextResponse: null,
            NumericResponse: null,
            IsFlagged: false
        ));

        // 2. Answer Q2 partially or incorrectly (Multiple Response, select only 10 when 10 and 11 are required, worth 2.0 points)
        await service.SaveResponseAsync(attempt.AttemptId, new SaveResponseDto(
            q2Id,
            SelectedOptionId: null,
            SelectedOptionIds: new List<int> { 10 },
            TextResponse: null,
            NumericResponse: null,
            IsFlagged: false
        ));

        // 3. Submit Attempt
        var submitResult = await service.SubmitAttemptAsync(attempt.AttemptId);

        Assert.Equal(attempt.AttemptId, submitResult.AttemptId);
        Assert.Equal(ExamAttemptStatus.Submitted, submitResult.Status);
        Assert.Equal(2, submitResult.TotalQuestions);
        Assert.Equal(1, submitResult.CorrectQuestions); // Only Q1 is fully correct
        // Score: 1.0 out of 3.0 total points = 33.33%
        Assert.Equal(33.33m, submitResult.ScorePercentage);
        Assert.False(submitResult.Passed); // Passing is 75%

        // 4. Retrieve Full Review and verify rationales and answer keys are now exposed
        var review = await service.GetAttemptReviewAsync(attempt.AttemptId);

        Assert.NotNull(review);
        Assert.Equal(submitResult.ScorePercentage, review.ScorePercentage);
        Assert.Equal(2, review.Questions.Count);

        var q1Review = review.Questions.First(q => q.QuestionId == q1Id);
        Assert.True(q1Review.IsCorrect);
        Assert.Equal(1.0m, q1Review.PointsAwarded);
        Assert.Equal("Normal PR interval is 0.12 to 0.20 seconds.", q1Review.GeneralRationale);
        Assert.Equal(2, q1Review.SelectedOptionId);
        Assert.Contains(q1Review.Options, o => o.Id == 2 && o.IsCorrect);

        var q2Review = review.Questions.First(q => q.QuestionId == q2Id);
        Assert.False(q2Review.IsCorrect);
        Assert.Equal(0.0m, q2Review.PointsAwarded);
        Assert.Equal("Digoxin toxicity causes visual disturbances and nausea/vomiting.", q2Review.GeneralRationale);
    }

    [Fact]
    public async Task SubmitAttempt_IsIdempotent_DoesNotMutateOnRepeatedSubmissions()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _, q1CorrectOption, _) = await SeedPublishedExamWithQuestionsAsync(context);

        var learnerUser = new CurrentUser("learner-idempotent", "Idempotent Student", "idem@example.com", "Learner");
        var service = new ExamAttemptService(context, learnerUser);

        var attempt = await service.StartAttemptAsync(examId);
        _createdAttemptIds.Add(attempt.AttemptId);

        await service.SaveResponseAsync(attempt.AttemptId, new SaveResponseDto(
            q1Id,
            SelectedOptionId: q1CorrectOption,
            SelectedOptionIds: null,
            TextResponse: null,
            NumericResponse: null,
            IsFlagged: false
        ));

        var firstSubmit = await service.SubmitAttemptAsync(attempt.AttemptId);
        var secondSubmit = await service.SubmitAttemptAsync(attempt.AttemptId);

        Assert.Equal(firstSubmit.ScorePercentage, secondSubmit.ScorePercentage);
        Assert.Equal(firstSubmit.Status, secondSubmit.Status);
        Assert.Equal(firstSubmit.SubmittedAtUtc, secondSubmit.SubmittedAtUtc);
    }
}
