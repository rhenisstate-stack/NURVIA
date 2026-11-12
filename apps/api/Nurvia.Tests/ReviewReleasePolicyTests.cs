using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Application.Services;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// Verifies the exam-level review release policy:
/// - Immediate (default): full answer key and rationales are released on submission.
/// - ManualRelease: answer keys and rationales stay withheld until staff release them,
///   and the review endpoint is blocked until release.
/// </summary>
public class ReviewReleasePolicyTests : IAsyncLifetime
{
    // Loopback IP literal: see the note in AttemptLifecycleTests.
    private const string ConnectionString = "Host=127.0.0.1;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!;Include Error Detail=true";
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

    private async Task<(Guid ExamId, Guid Question1Id, Guid Q1CorrectOptionId)> SeedPublishedExamWithPolicyAsync(
        NurviaDbContext context, ReviewReleasePolicy reviewReleasePolicy)
    {
        var audit = new AuditService(context);
        var questionService = new QuestionService(context, audit);
        var examService = new ExamService(context, audit);

        var q1Code = $"Q1-{Guid.NewGuid():N}".Substring(0, 16);
        var q1Dto = await questionService.CreateDraftAsync(new CreateQuestionRequest
        {
            Code = q1Code,
            Pathway = NursingPathway.RN,
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
        await questionService.PublishQuestionAsync(q1Dto.Id, "Publisher");

        var examCode = $"EX-{Guid.NewGuid():N}".Substring(0, 16);
        var examDto = await examService.CreateExamAsync(new CreateExamRequest
        {
            Code = examCode,
            Title = "Review Policy Benchmark Exam",
            Description = "Assessment Description",
            Pathway = NursingPathway.RN,
            Category = ExamCategory.ATI,
            ReviewReleasePolicy = reviewReleasePolicy,
            TargetQuestionCount = 1,
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m,
            InitialQuestionIds = new List<Guid> { q1Dto.Id }
        }, "Author1");
        _createdExamIds.Add(examDto.Id);

        await examService.SubmitForReviewAsync(examDto.Id, "Author1");
        await examService.ApproveExamAsync(examDto.Id, "Dean", "Approved blueprint");
        await examService.PublishExamAsync(examDto.Id, "Publisher");

        context.ChangeTracker.Clear();

        var published = await examService.GetExamByIdAsync(examDto.Id);
        var correctOptionId = published!.CurrentVersion!.ExamQuestions.Count > 0
            ? published.CurrentVersion.ExamQuestions[0].QuestionId
            : Guid.Empty;

        // Re-resolve correct option id through the question service DTO
        var questionDto = await questionService.GetQuestionByIdAsync(correctOptionId);
        var q1CorrectOptionId = questionDto!.CurrentVersion!.Options.First(o => o.IsCorrect).Id;

        return (examDto.Id, correctOptionId, q1CorrectOptionId);
    }

    [Fact]
    public async Task ImmediatePolicy_SubmitReleasesFullAnswerKey()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, q1CorrectOptionId) = await SeedPublishedExamWithPolicyAsync(context, ReviewReleasePolicy.Immediate);

        var service = new ExamAttemptService(context);
        var attempt = await service.StartAttemptAsync(examId, "learner-immediate", "Immediate Student");
        _createdAttemptIds.Add(attempt.AttemptId);

        await service.AutosaveResponseAsync(attempt.AttemptId, new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = JsonSerializer.Serialize(new { SelectedOptionId = q1CorrectOptionId }),
            IsFlagged = false
        }, "learner-immediate");

        var result = await service.SubmitAttemptAsync(attempt.AttemptId, "learner-immediate");

        Assert.True(result.ReviewReleased);
        var q1Review = result.ReviewQuestions.Single(q => q.QuestionId == q1Id);
        Assert.True(q1Review.IsCorrect);
        Assert.Equal("Normal PR interval is 0.12 to 0.20 seconds.", q1Review.GeneralRationale);
        Assert.Contains(q1Review.Options, o => o.Id == q1CorrectOptionId && o.IsCorrect);

        var review = await service.GetAttemptReviewAsync(attempt.AttemptId, "learner-immediate");
        Assert.True(review.ReviewReleased);
        Assert.Contains(review.ReviewQuestions.Single(q => q.QuestionId == q1Id).Options, o => o.IsCorrect);
    }

    [Fact]
    public async Task ManualRelease_SubmitSanitizesAnswerKeyAndRationales()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, q1CorrectOptionId) = await SeedPublishedExamWithPolicyAsync(context, ReviewReleasePolicy.ManualRelease);

        var service = new ExamAttemptService(context);
        var attempt = await service.StartAttemptAsync(examId, "learner-manual", "Manual Student");
        _createdAttemptIds.Add(attempt.AttemptId);

        await service.AutosaveResponseAsync(attempt.AttemptId, new AutosaveResponseRequest
        {
            QuestionId = q1Id,
            ResponseJson = JsonSerializer.Serialize(new { SelectedOptionId = q1CorrectOptionId }),
            IsFlagged = false
        }, "learner-manual");

        var result = await service.SubmitAttemptAsync(attempt.AttemptId, "learner-manual");

        // Score summary is available, but the answer key must not be released
        Assert.False(result.ReviewReleased);
        Assert.Equal(100.0m, result.ScorePercentage);

        var q1Review = result.ReviewQuestions.Single(q => q.QuestionId == q1Id);
        Assert.False(q1Review.IsCorrect);
        Assert.Null(q1Review.GeneralRationale);
        Assert.All(q1Review.Options, o =>
        {
            Assert.False(o.IsCorrect);
            Assert.Null(o.SpecificRationale);
        });
    }

    [Fact]
    public async Task ManualRelease_ReviewEndpointIsBlockedUntilStaffRelease()
    {
        await using var context = CreateDbContext();
        var (examId, q1Id, _) = await SeedPublishedExamWithPolicyAsync(context, ReviewReleasePolicy.ManualRelease);

        var attemptService = new ExamAttemptService(context);
        var attempt = await attemptService.StartAttemptAsync(examId, "learner-blocked", "Blocked Student");
        _createdAttemptIds.Add(attempt.AttemptId);

        await attemptService.SubmitAttemptAsync(attempt.AttemptId, "learner-blocked");

        await Assert.ThrowsAsync<ReviewNotReleasedException>(() =>
            attemptService.GetAttemptReviewAsync(attempt.AttemptId, "learner-blocked"));

        // Staff release unlocks review for the submitted attempt
        var audit = new AuditService(context);
        var examService = new ExamService(context, audit);
        await examService.ReleaseReviewAsync(examId, "Publisher");

        var review = await attemptService.GetAttemptReviewAsync(attempt.AttemptId, "learner-blocked");
        Assert.True(review.ReviewReleased);
        var q1Review = review.ReviewQuestions.Single(q => q.QuestionId == q1Id);
        Assert.Contains(q1Review.Options, o => o.IsCorrect);
        Assert.NotNull(q1Review.GeneralRationale);
    }
}
