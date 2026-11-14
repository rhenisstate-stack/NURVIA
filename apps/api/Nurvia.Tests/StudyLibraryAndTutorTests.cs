using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Services;
using Nurvia.Application.StudyLibrary;
using Nurvia.Application.Tutor;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class StudyLibraryAndTutorTests
{
    private static NurviaDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase($"nurvia_study_lib_{Guid.NewGuid()}")
            .Options;
        return new NurviaDbContext(options);
    }

    private static async Task<(Exam PublishedExam, Exam DraftExam, Question Question)> SeedSampleCatalogAsync(NurviaDbContext context)
    {
        var q = new Question
        {
            Code = "Q-PHARM-01",
            Subject = "Pharmacology",
            Topic = "Anticoagulants",
            Difficulty = DifficultyLevel.Intermediate,
            Pathway = NursingPathway.RN,
            Category = ExamCategory.ATI,
            CreatedBy = "author"
        };
        var qv = new QuestionVersion(q.Id, 1, "A nurse is administering warfarin...", QuestionType.MultipleChoice, "author")
        {
            CognitiveSkill = CognitiveSkill.TakeActions,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Monitor INR levels closely.",
            Status = ContentStatus.Published
        };
        var opt1 = new QuestionOption(1, "Monitor INR", true, "INR measures warfarin therapeutic effect.");
        var opt2 = new QuestionOption(2, "Monitor aPTT", false, "aPTT is used for heparin, not warfarin.");
        var opt3 = new QuestionOption(3, "Administer vitamin K routinely", false, "Vitamin K is only for reversal.");
        qv.Options.Add(opt1);
        qv.Options.Add(opt2);
        qv.Options.Add(opt3);
        q.Versions.Add(qv);
        q.CurrentVersion = qv;
        q.CurrentVersionId = qv.Id;
        q.Status = ContentStatus.Published;

        var pubExam = new Exam("EXAM-PUB-01", "RN Pharmacology Readiness", "Comprehensive pharm review", NursingPathway.RN, ExamCategory.ATI, "author")
        {
            School = "Johns Hopkins",
            AcademicYear = 2026,
            Season = "Fall",
            Subject = "Pharmacology",
            Topic = "Anticoagulants",
            Difficulty = DifficultyLevel.Intermediate,
            LearningObjectives = new List<string> { "Evaluate anticoagulation labs safely" },
            ModeAllowed = ExamDeliveryMode.All,
            TotalQuestions = 1,
            Status = ExamStatus.Published
        };
        var pubVersion = new ExamVersion(pubExam.Id, 1, pubExam.Title, pubExam.Description, "author")
        {
            Instructions = "Answer all questions carefully.",
            Status = ExamStatus.Published
        };
        pubVersion.ExamQuestions.Add(new ExamQuestion(pubVersion.Id, q.Id, qv.Id, 1, 1));
        pubExam.Versions.Add(pubVersion);
        pubExam.CurrentVersion = pubVersion;
        pubExam.CurrentVersionId = pubVersion.Id;

        var draftExam = new Exam("EXAM-DRAFT-01", "Unpublished Draft Exam", "Should never appear to learners", NursingPathway.PN_LPN, ExamCategory.HESI, "author")
        {
            School = "Draft University",
            AcademicYear = 2025,
            Season = "Spring",
            Status = ExamStatus.Draft
        };
        var draftVersion = new ExamVersion(draftExam.Id, 1, draftExam.Title, draftExam.Description, "author")
        {
            Status = ExamStatus.Draft
        };
        draftExam.Versions.Add(draftVersion);
        draftExam.CurrentVersion = draftVersion;
        draftExam.CurrentVersionId = draftVersion.Id;

        context.Questions.Add(q);
        context.Exams.AddRange(pubExam, draftExam);
        await context.SaveChangesAsync();

        return (pubExam, draftExam, q);
    }

    [Fact]
    public void SanitizeContentJsonForExamMode_StripsAllAnswerKeys_PreservesUiStructure()
    {
        var rawJson = """
        {
          "Condition": "Sepsis",
          "Actions": ["Administer IV antibiotics", "Obtain blood cultures"],
          "Parameters": ["Lactate", "MAP"],
          "CorrectCondition": "Sepsis",
          "CorrectActions": ["Administer IV antibiotics"],
          "CorrectParameters": ["Lactate"],
          "CorrectTrueFalse": { "row1": true },
          "CorrectSelections": ["c1"],
          "CorrectBuckets": { "b1": ["item1"] },
          "specificRationale": "Hidden rationale"
        }
        """;

        var sanitized = ExamAttemptService.SanitizeContentJsonForExamMode(rawJson);
        Assert.NotNull(sanitized);
        Assert.Contains("Administer IV antibiotics", sanitized);
        Assert.Contains("Lactate", sanitized);
        Assert.DoesNotContain("CorrectCondition", sanitized);
        Assert.DoesNotContain("CorrectActions", sanitized);
        Assert.DoesNotContain("CorrectParameters", sanitized);
        Assert.DoesNotContain("CorrectTrueFalse", sanitized);
        Assert.DoesNotContain("CorrectSelections", sanitized);
        Assert.DoesNotContain("CorrectBuckets", sanitized);
        Assert.DoesNotContain("specificRationale", sanitized);
    }

    [Fact]
    public async Task StudyLibrary_Catalog_Filters_And_Summary_ExcludeUnpublishedAndFilterAccurately()
    {
        await using var context = CreateInMemoryContext();
        var (pubExam, draftExam, _) = await SeedSampleCatalogAsync(context);
        var service = new StudyLibraryService(context);

        var allCatalog = await service.GetCatalogAsync(new StudyLibraryFilterRequest(), "learner-1");
        Assert.Equal(1, allCatalog.TotalCount);
        Assert.Single(allCatalog.Items);
        Assert.Equal(pubExam.Id, allCatalog.Items[0].Id);
        Assert.Null(allCatalog.Items[0].AverageRating);
        Assert.Equal(0, allCatalog.Items[0].ReviewCount);

        var bySchool = await service.GetCatalogAsync(new StudyLibraryFilterRequest { School = "Johns Hopkins", AcademicYear = 2026, Season = "Fall" }, "learner-1");
        Assert.Equal(1, bySchool.TotalCount);

        var byWrongYear = await service.GetCatalogAsync(new StudyLibraryFilterRequest { AcademicYear = 2024 }, "learner-1");
        Assert.Equal(0, byWrongYear.TotalCount);

        var byQuestionType = await service.GetCatalogAsync(new StudyLibraryFilterRequest { QuestionType = QuestionType.MultipleChoice }, "learner-1");
        Assert.Equal(1, byQuestionType.TotalCount);

        var filters = await service.GetFiltersAsync();
        Assert.Contains("Johns Hopkins", filters.Schools);
        Assert.DoesNotContain("Draft University", filters.Schools);
        Assert.Contains(2026, filters.AcademicYears);
        Assert.Contains("Fall", filters.Seasons);

        var summary = await service.GetSummaryAsync();
        Assert.Equal(1, summary.TotalPublishedStudySets);
        Assert.Equal(1, summary.TotalAvailableQuestions);

        Assert.Null(await service.GetStudySetDetailAsync(draftExam.Id, "learner-1"));
        Assert.NotNull(await service.GetStudySetDetailAsync(pubExam.Id, "learner-1"));
    }

    [Fact]
    public async Task StudyLibrary_PersonalLibrary_And_ReviewEligibility_WorkAndIsolateLearners()
    {
        await using var context = CreateInMemoryContext();
        var (pubExam, _, _) = await SeedSampleCatalogAsync(context);
        var service = new StudyLibraryService(context);

        await service.SaveStudySetAsync(pubExam.Id, "learner-a");
        var savedA = await service.GetSavedStudySetsAsync("learner-a");
        var savedB = await service.GetSavedStudySetsAsync("learner-b");
        Assert.Single(savedA);
        Assert.Empty(savedB);

        // Cannot review without a completed attempt
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.SubmitReviewAsync(pubExam.Id, "learner-a", "Learner A", new SubmitExamReviewRequest { Rating = 5, Comment = "Great!" }));

        // Add submitted attempt for learner-a
        var attempt = new ExamAttempt(pubExam.Id, pubExam.CurrentVersionId!.Value, "learner-a", "Learner A", 90, 75, 1);
        attempt.Submit(DateTime.UtcNow);
        context.ExamAttempts.Add(attempt);
        await context.SaveChangesAsync();

        var review = await service.SubmitReviewAsync(pubExam.Id, "learner-a", "Learner A", new SubmitExamReviewRequest { Rating = 5, Comment = "Helped me pass!" });
        Assert.Equal(5, review.Rating);
        Assert.Equal("Helped me pass!", review.Comment);

        var catalog = await service.GetCatalogAsync(new StudyLibraryFilterRequest(), "learner-a");
        Assert.Equal(5.0, catalog.Items[0].AverageRating);
        Assert.Equal(1, catalog.Items[0].ReviewCount);
        Assert.Equal("Helped me pass!", catalog.Items[0].FeaturedTestimonial);
        Assert.True(catalog.Items[0].IsSaved);

        await service.RemoveSavedStudySetAsync(pubExam.Id, "learner-a");
        Assert.Empty(await service.GetSavedStudySetsAsync("learner-a"));
    }

    [Fact]
    public async Task TutorService_EnforcesOwnershipAndMode_AndProvidesProgressiveHintsAndEvaluation()
    {
        await using var context = CreateInMemoryContext();
        var (pubExam, _, q) = await SeedSampleCatalogAsync(context);
        var correctOption = q.CurrentVersion!.Options.First(o => o.IsCorrect);

        var tutorAttempt = new ExamAttempt(pubExam.Id, pubExam.CurrentVersionId!.Value, "learner-1", "Learner One", 90, 75, 1, ExamDeliveryMode.Tutor);
        tutorAttempt.Responses.Add(new AttemptResponse(tutorAttempt.Id, q.Id, q.CurrentVersionId!.Value, 1));

        var examAttempt = new ExamAttempt(pubExam.Id, pubExam.CurrentVersionId!.Value, "learner-1", "Learner One", 90, 75, 1, ExamDeliveryMode.Exam);

        context.ExamAttempts.AddRange(tutorAttempt, examAttempt);
        await context.SaveChangesAsync();

        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        // Ownership check
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            tutorService.GetHintAsync(tutorAttempt.Id, "learner-other", new TutorHintRequest { QuestionId = q.Id, Stage = TutorStage.FirstHint }));

        // Mode check (cannot call Tutor on Exam-mode attempt)
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            tutorService.GetHintAsync(examAttempt.Id, "learner-1", new TutorHintRequest { QuestionId = q.Id, Stage = TutorStage.FirstHint }));

        // Stage 2: First Hint
        var hint1 = await tutorService.GetHintAsync(tutorAttempt.Id, "learner-1", new TutorHintRequest { QuestionId = q.Id, Stage = TutorStage.FirstHint });
        Assert.False(hint1.IsAiGenerated);
        Assert.Empty(hint1.EliminatedOptionIds);
        Assert.Contains("Pharmacology", hint1.Content);

        // Stage 3: Guided Reasoning eliminates 1 distractor
        var hint2 = await tutorService.GetHintAsync(tutorAttempt.Id, "learner-1", new TutorHintRequest { QuestionId = q.Id, Stage = TutorStage.GuidedReasoning });
        Assert.Single(hint2.EliminatedOptionIds);

        // Stage 4/5/6: Evaluate answer
        var eval = await tutorService.EvaluateAnswerAsync(tutorAttempt.Id, "learner-1", new TutorEvaluateRequest
        {
            QuestionId = q.Id,
            ResponseJson = $$"""{"SelectedOptionId":"{{correctOption.Id}}"}"""
        });
        Assert.True(eval.IsCorrect);
        Assert.Equal(1.0m, eval.PointsAwarded);
        Assert.Equal("Monitor INR levels closely.", eval.GeneralRationale);
        Assert.Equal(3, eval.OptionRationales.Count);
    }

    [Fact]
    public async Task GetExamReviewContentAsync_RejectsDisabledReviewMode()
    {
        await using var context = CreateInMemoryContext();
        var (pubExam, _, _) = await SeedSampleCatalogAsync(context);
        pubExam.ModeAllowed = ExamDeliveryMode.Exam;
        await context.SaveChangesAsync();

        var attemptService = new ExamAttemptService(context);
        await Assert.ThrowsAsync<DomainException>(() =>
            attemptService.GetExamReviewContentAsync(pubExam.Id, "learner-1"));
    }
}
