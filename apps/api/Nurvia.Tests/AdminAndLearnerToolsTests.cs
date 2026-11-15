using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Nurvia.Application.Services;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Nurvia.Infrastructure.Services;
using Xunit;

namespace Nurvia.Tests;

[Collection("PostgresIntegration")]
public class AdminAndLearnerToolsTests
{
    private static NurviaDbContext CreateDbContext()
    {
        var conn = DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString();
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(conn)
            .Options;
        return new NurviaDbContext(options);
    }

    [Fact]
    public async Task DevelopmentEmailSink_CapturesAndClearsMessages()
    {
        var sink = new DevelopmentEmailSink(NullLogger<DevelopmentEmailSink>.Instance);
        await sink.SendPasswordResetEmailAsync(
            "nurse@nurvia.test",
            "Nurse Test",
            "http://localhost:3005/reset-password?token=abc123",
            CancellationToken.None);

        var messages = sink.GetMessages();
        Assert.Single(messages);
        Assert.Equal("nurse@nurvia.test", messages[0].ToEmail);
        Assert.Contains("token=abc123", messages[0].ResetUrl);

        sink.Clear();
        Assert.Empty(sink.GetMessages());
    }

    [Fact]
    public async Task AdminDashboardService_ReturnsLiveCountsAndAll18QuestionTypes()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();

        var service = new AdminDashboardService(db);
        var overview = await service.GetOverviewAsync();
        Assert.Equal(6, overview.Pipeline.Count);
        Assert.True(overview.TotalQuestions >= 0);

        var types = await service.GetQuestionTypesAsync();
        Assert.Equal(18, types.Count);
        Assert.Contains(types, t => t.Code == "ClinicalCaseStudy" && t.GradingMode == "PendingManualReview");
        Assert.Contains(types, t => t.Code == "ExtendedResponse" && t.GradingMode == "PendingManualReview");

        var analytics = await service.GetAnalyticsAsync();
        Assert.True(analytics.TotalAttempts >= 0);

        var taxonomy = await service.GetTaxonomyAsync();
        Assert.Equal(4, taxonomy.ClientNeedsCategories.Count);
        Assert.Equal(4, taxonomy.Pathways.Count);
    }

    [Fact]
    public async Task SavedQuestionsAndPlanner_PersistAndEnforceLearnerOwnership()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();

        var learnerA = $"learner-a-{Guid.NewGuid():N}";
        var learnerB = $"learner-b-{Guid.NewGuid():N}";

        var question = new Question(
            $"SQ-{Guid.NewGuid():N}"[..16],
            NursingPathway.RN,
            ExamCategory.ATI,
            "Pharmacology",
            "Cardiac",
            DifficultyLevel.Intermediate,
            "test-author");
        var version = new QuestionVersion
        {
            QuestionId = question.Id,
            VersionNumber = 1,
            Stem = "Which electrolyte imbalance increases the risk of digoxin toxicity?",
            QuestionType = QuestionType.MultipleChoice,
            Status = ContentStatus.Published,
            CreatedBy = "test-author"
        };
        question.Versions.Add(version);
        question.Status = ContentStatus.Published;
        db.Questions.Add(question);
        await db.SaveChangesAsync();

        question.CurrentVersionId = version.Id;
        await db.SaveChangesAsync();

        var savedService = new SavedQuestionsService(db);
        var saved = await savedService.SaveQuestionAsync(learnerA, question.Id, null, "Review potassium", CancellationToken.None);
        Assert.NotNull(saved);
        Assert.Equal(question.Id, saved!.QuestionId);

        var listA = await savedService.GetSavedQuestionsAsync(learnerA);
        Assert.Single(listA);
        Assert.Empty(await savedService.GetSavedQuestionsAsync(learnerB));

        Assert.False(await savedService.RemoveSavedQuestionAsync(learnerB, question.Id));
        Assert.True(await savedService.RemoveSavedQuestionAsync(learnerA, question.Id));
        Assert.Empty(await savedService.GetSavedQuestionsAsync(learnerA));

        var plannerService = new StudyPlannerService(db);
        var (badTask, badErr) = await plannerService.CreateTaskAsync(
            learnerA,
            new CreateStudyPlanTaskRequest("Invalid duration", DateTime.UtcNow.AddDays(1), 2));
        Assert.Null(badTask);
        Assert.NotNull(badErr);

        var (created, createErr) = await plannerService.CreateTaskAsync(
            learnerA,
            new CreateStudyPlanTaskRequest("Pharmacology Review", DateTime.UtcNow.AddDays(1), 45));
        Assert.Null(createErr);
        Assert.NotNull(created);

        var (_, _, notFoundForB) = await plannerService.UpdateTaskAsync(
            learnerB,
            created!.Id,
            new UpdateStudyPlanTaskRequest(IsCompleted: true));
        Assert.True(notFoundForB);

        var (updated, updateErr, notFoundForA) = await plannerService.UpdateTaskAsync(
            learnerA,
            created.Id,
            new UpdateStudyPlanTaskRequest(IsCompleted: true));
        Assert.False(notFoundForA);
        Assert.Null(updateErr);
        Assert.True(updated!.IsCompleted);

        Assert.False(await plannerService.DeleteTaskAsync(learnerB, created.Id));
        Assert.True(await plannerService.DeleteTaskAsync(learnerA, created.Id));
        Assert.Empty(await plannerService.GetTasksAsync(learnerA));

        question.CurrentVersionId = null;
        await db.SaveChangesAsync();
        db.Questions.Remove(question);
        await db.SaveChangesAsync();
    }
}
