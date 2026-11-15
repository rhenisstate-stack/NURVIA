using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Services;
using Nurvia.Application.Tutor;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// DEF-04 regression suite: Tutor-mode answer-key confidentiality.
///
/// Mandatory acceptance criterion — no answer-bearing information (correct
/// answers, correct option identifiers, answer-key maps, expected responses,
/// rationales, or educational explanations) may reach the learner through any
/// serialized response before the authorized Tutor stage. The start/session
/// payloads are sanitized identically to Exam mode; correctness is released
/// exclusively by the authorized tutor evaluate endpoint after server-side
/// grading against the snapshotted question version.
/// </summary>
public class TutorConfidentialityTests
{
    private static readonly JsonSerializerOptions ApiJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static DbContextOptions<NurviaDbContext> InMemoryOptions(string dbName) =>
        new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    /// <summary>
    /// Seeds a published exam containing one question per distinct canonical
    /// question type. Every question embeds answer-bearing data in
    /// ContentJsonData, option rationales, and a general rationale, so any
    /// leakage through the start payload is detectable.
    /// </summary>
    private static async Task<(NurviaDbContext Context, Exam Exam)> SeedAllTypesExamAsync(
        DbContextOptions<NurviaDbContext> options, string learnerSuffix = "")
    {
        var context = new NurviaDbContext(options);
        var exam = new Exam("TUTOR-CONF-1" + learnerSuffix, "Tutor Confidentiality Exam", "All 18 question types with embedded answer keys.", NursingPathway.RN, ExamCategory.ATI, "author")
        {
            ModeAllowed = ExamDeliveryMode.All,
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m,
            Status = ExamStatus.Published
        };
        var version = new ExamVersion(exam.Id, 1, exam.Title, exam.Description, "author")
        {
            Instructions = "Tutor confidentiality fixture.",
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m,
            Status = ExamStatus.Published
        };

        var order = 1;
        foreach (var questionType in Enum.GetValues<QuestionType>().Cast<int>().Distinct().OrderBy(v => v).Cast<QuestionType>())
        {
            var q = new Question
            {
                Code = $"TC-{questionType}",
                Subject = "Pharmacology",
                Topic = "Confidentiality",
                Pathway = NursingPathway.RN,
                Category = ExamCategory.ATI,
                CreatedBy = "author"
            };
            var qv = new QuestionVersion(q.Id, 1, $"Clinical stem for {questionType}.", questionType, "author")
            {
                CognitiveSkill = CognitiveSkill.RecognizeCues,
                ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
                GeneralRationale = $"Approved general rationale {questionType}.",
                Status = ContentStatus.Published,
                // Embedded answer keys that must be stripped from the start payload.
                ContentJsonData = $$"""
                {
                  "Condition": "Hypovolemia",
                  "Actions": ["Administer isotonic IV fluid"],
                  "Parameters": ["Blood pressure"],
                  "Buckets": ["Priority", "Non-Priority"],
                  "CorrectCondition": "Hypovolemia",
                  "CorrectActions": ["Administer isotonic IV fluid"],
                  "CorrectParameters": ["Blood pressure"],
                  "CorrectBuckets": { "item1": "Priority" },
                  "CorrectTrueFalse": { "row1": true },
                  "CorrectSelections": ["c1"],
                  "AnswerKey": "5 mL",
                  "ExpectedAnswer": "5 mL",
                  "Solution": "5 mL"
                }
                """
            };
            qv.Options.Add(new QuestionOption(1, "Correct option", true, $"Approved specific rationale {questionType}."));
            qv.Options.Add(new QuestionOption(2, "Incorrect option", false, "Approved incorrect-option rationale."));
            qv.Options.Add(new QuestionOption(3, "Second incorrect option", false, "Approved second incorrect-option rationale."));
            q.Versions.Add(qv);
            q.CurrentVersion = qv;
            q.CurrentVersionId = qv.Id;
            q.Status = ContentStatus.Published;
            context.Questions.Add(q);

            version.ExamQuestions.Add(new ExamQuestion(version.Id, q.Id, qv.Id, order, 1));
            order++;
        }

        exam.Versions.Add(version);
        exam.CurrentVersion = version;
        exam.CurrentVersionId = version.Id;
        context.Exams.Add(exam);
        await context.SaveChangesAsync();
        return (context, exam);
    }

    [Fact]
    public async Task TutorStartPayload_SerializedJson_ContainsNoAnswerBearingData_ForAll18QuestionTypes()
    {
        var options = InMemoryOptions($"tutor_conf_start_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var service = new ExamAttemptService(context);

        var result = await service.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);

        // Inspect the actual serialized HTTP-shaped payload, not merely the DTO.
        var json = JsonSerializer.Serialize(result, ApiJsonOptions).ToLowerInvariant();

        // Null placeholder properties are expected; no rationale VALUE and no
        // answer-key data may ever be serialized.
        Assert.DoesNotContain("\"iscorrect\":true", json);
        Assert.DoesNotContain("\"generalrationale\":\"", json);
        Assert.DoesNotContain("\"specificrationale\":\"", json);
        Assert.DoesNotContain("approved", json);
        Assert.DoesNotContain("correctcondition", json);
        Assert.DoesNotContain("correctactions", json);
        Assert.DoesNotContain("correctparameters", json);
        Assert.DoesNotContain("correctbuckets", json);
        Assert.DoesNotContain("correcttruefalse", json);
        Assert.DoesNotContain("correctselections", json);
        Assert.DoesNotContain("answerkey", json);
        Assert.DoesNotContain("expectedanswer", json);
        Assert.DoesNotContain("\"solution\"", json);
        Assert.DoesNotContain("\"answer\"", json);

        // Sanity: the sanitized payload still delivers the real questions.
        Assert.Equal(Enum.GetValues<QuestionType>().Cast<int>().Distinct().Count(), result.TotalQuestions);
        Assert.Contains("clinical stem", json);

        // UI bucket definitions are preserved (learner needs buckets to answer).
        Assert.Contains("priority", json);
    }

    [Fact]
    public async Task TutorSessionRecoveryPayload_SerializedJson_ContainsNoAnswerBearingData_BeforeEvaluation()
    {
        var options = InMemoryOptions($"tutor_conf_recovery_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);

        // Hint stages advance progression but never authorize answer content.
        var firstQuestion = started.Questions.First();
        await tutorService.GetHintAsync(started.AttemptId, "learner-1",
            new TutorHintRequest { QuestionId = firstQuestion.Id, Stage = TutorStage.FirstHint });
        await tutorService.GetHintAsync(started.AttemptId, "learner-1",
            new TutorHintRequest { QuestionId = firstQuestion.Id, Stage = TutorStage.GuidedReasoning });

        var state = await tutorService.GetSessionStateAsync(started.AttemptId, "learner-1");

        var json = JsonSerializer.Serialize(state, ApiJsonOptions).ToLowerInvariant();
        Assert.DoesNotContain("\"iscorrect\":true", json);
        Assert.DoesNotContain("\"generalrationale\":\"", json);
        Assert.DoesNotContain("\"specificrationale\":\"", json);
        Assert.DoesNotContain("approved", json);
        Assert.DoesNotContain("correctcondition", json);
        Assert.DoesNotContain("correctbuckets", json);
        // No evaluation content was delivered for any question before evaluation.
        Assert.DoesNotContain("\"evaluation\":{", json);
        Assert.DoesNotContain("\"evaluation\": {", json);
        Assert.All(state.Questions, q => Assert.True(q.StageReached < 4));
    }

    [Fact]
    public async Task TutorHints_NeverRevealCorrectOptionAnswerKeyOrRationales()
    {
        var options = InMemoryOptions($"tutor_conf_hints_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);

        var mcqQuestion = started.Questions.First(q => q.QuestionType == QuestionType.MultipleChoice);
        var correctOptionText = "Correct option";
        var correctRationale = "Approved general rationale MultipleChoice.";
        var correctOptionId = started.Questions
            .First(q => q.QuestionType == QuestionType.MultipleChoice)
            .Options.First(o => o.OptionText == correctOptionText).Id;

        foreach (var stage in new[] { TutorStage.FirstHint, TutorStage.GuidedReasoning, TutorStage.ExplainConcept })
        {
            var hint = await tutorService.GetHintAsync(started.AttemptId, "learner-1",
                new TutorHintRequest { QuestionId = mcqQuestion.Id, Stage = stage });

            // No correctness, no correct option identifiers, no rationale text.
            Assert.DoesNotContain(correctOptionText, hint.Content);
            Assert.DoesNotContain(correctRationale, hint.Content);
            Assert.DoesNotContain("Approved specific rationale", hint.Content);
            Assert.DoesNotContain(correctOptionId.ToString(), hint.EliminatedOptionIds.Select(g => g.ToString()).ToList());
        }

        // Guided reasoning still eliminates an incorrect distractor only.
        var guided = await tutorService.GetHintAsync(started.AttemptId, "learner-1",
            new TutorHintRequest { QuestionId = mcqQuestion.Id, Stage = TutorStage.GuidedReasoning });
        var eliminatedId = Assert.Single(guided.EliminatedOptionIds);
        Assert.NotEqual(correctOptionId, eliminatedId);
    }

    [Fact]
    public async Task TutorStageProgression_IsServerAuthoritative_AndGatesEvaluationContent()
    {
        var options = InMemoryOptions($"tutor_conf_stages_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);

        var qA = started.Questions[0];
        var qB = started.Questions[1];
        var correctOptionId = qA.Options.First(o => o.OptionText == "Correct option").Id;

        // Stage 1: no evaluation content before any interaction.
        var initial = await tutorService.GetSessionStateAsync(started.AttemptId, "learner-1");
        Assert.All(initial.Questions, q => Assert.Null(q.Evaluation));

        // Stage 2 -> Stage 3 progression is recorded server-side.
        await tutorService.GetHintAsync(started.AttemptId, "learner-1",
            new TutorHintRequest { QuestionId = qA.Id, Stage = TutorStage.FirstHint });
        await tutorService.GetHintAsync(started.AttemptId, "learner-1",
            new TutorHintRequest { QuestionId = qA.Id, Stage = TutorStage.GuidedReasoning });
        var afterHints = await tutorService.GetSessionStateAsync(started.AttemptId, "learner-1");
        Assert.Equal(3, afterHints.Questions.First(q => q.QuestionId == qA.Id).StageReached);
        Assert.Equal(0, afterHints.Questions.First(q => q.QuestionId == qB.Id).StageReached);

        // Stage 4-6: only evaluation by the server releases correctness + rationale.
        var evaluation = await tutorService.EvaluateAnswerAsync(started.AttemptId, "learner-1",
            new TutorEvaluateRequest { QuestionId = qA.Id, ResponseJson = $$"""{"SelectedOptionId":"{{correctOptionId}}"}""" });
        Assert.True(evaluation.IsCorrect);
        Assert.NotEmpty(evaluation.GeneralRationale);
        Assert.NotEmpty(evaluation.Takeaway);

        var final = await tutorService.GetSessionStateAsync(started.AttemptId, "learner-1");
        var evaluatedState = final.Questions.First(q => q.QuestionId == qA.Id);
        Assert.Equal(6, evaluatedState.StageReached);
        Assert.NotNull(evaluatedState.Evaluation);
        Assert.True(evaluatedState.Evaluation!.IsCorrect);
        Assert.Equal("Approved general rationale MultipleChoice.", evaluatedState.Evaluation.GeneralRationale);

        // The untouched question still has no evaluation content.
        var untouched = final.Questions.First(q => q.QuestionId == qB.Id);
        Assert.Null(untouched.Evaluation);
    }

    [Fact]
    public async Task TutorSessionState_SurvivesSessionRecovery_AcrossContextInstances()
    {
        var options = InMemoryOptions($"tutor_conf_recovery2_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);
        var qA = started.Questions[0];
        var correctOptionId = qA.Options.First(o => o.OptionText == "Correct option").Id;

        await tutorService.EvaluateAnswerAsync(started.AttemptId, "learner-1",
            new TutorEvaluateRequest { QuestionId = qA.Id, ResponseJson = $$"""{"SelectedOptionId":"{{correctOptionId}}"}""" });
        await context.DisposeAsync();

        // Fresh context + fresh service instances simulate a page refresh with
        // session recovery against the persisted attempt.
        var recoveredContext = new NurviaDbContext(options);
        var recoveredTutor = new TutorService(recoveredContext, new GroundedFallbackAiTutorProvider());
        var state = await recoveredTutor.GetSessionStateAsync(started.AttemptId, "learner-1");

        var evaluatedState = state.Questions.First(q => q.QuestionId == qA.Id);
        Assert.Equal(6, evaluatedState.StageReached);
        Assert.NotNull(evaluatedState.Evaluation);
        Assert.True(evaluatedState.Evaluation!.IsCorrect);
        Assert.NotEmpty(evaluatedState.Evaluation.Takeaway);
    }

    [Fact]
    public async Task TutorSessionState_RejectsCrossLearnerAccess()
    {
        var options = InMemoryOptions($"tutor_conf_idor_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            tutorService.GetSessionStateAsync(started.AttemptId, "learner-other"));
    }

    [Fact]
    public async Task TutorEndpoints_RejectUndefinedStages_AndBlockedAfterSubmission()
    {
        var options = InMemoryOptions($"tutor_conf_guards_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);
        var qA = started.Questions[0];

        // Undefined / out-of-range stage values cannot be mapped to a hint stage.
        await Assert.ThrowsAsync<DomainException>(() =>
            tutorService.GetHintAsync(started.AttemptId, "learner-1",
                new TutorHintRequest { QuestionId = qA.Id, Stage = (TutorStage)99 }));

        // Submission terminates the Tutor session; no further guidance or
        // evaluation can be requested against the submitted attempt.
        var attempt = await context.ExamAttempts.Include(a => a.Responses).FirstAsync(a => a.Id == started.AttemptId);
        attempt.Submit(DateTime.UtcNow);
        attempt.RecordScore(1, attempt.Responses.Count);
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<DomainException>(() =>
            tutorService.GetHintAsync(started.AttemptId, "learner-1",
                new TutorHintRequest { QuestionId = qA.Id, Stage = TutorStage.FirstHint }));

        await Assert.ThrowsAsync<DomainException>(() =>
            tutorService.EvaluateAnswerAsync(started.AttemptId, "learner-1",
                new TutorEvaluateRequest { QuestionId = qA.Id, ResponseJson = "0" }));

        await Assert.ThrowsAsync<DomainException>(() =>
            tutorService.GetSessionStateAsync(started.AttemptId, "learner-1"));
    }

    [Fact]
    public async Task TutorEvaluate_MalformedAnswer_IsHandledWithoutLeakage()
    {
        var options = InMemoryOptions($"tutor_conf_malformed_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);
        var qA = started.Questions[0];

        // Malformed payloads never throw and never earn credit.
        foreach (var malformed in new[] { "{invalid-json", "[]", "not-an-answer" })
        {
            var evaluation = await tutorService.EvaluateAnswerAsync(started.AttemptId, "learner-1",
                new TutorEvaluateRequest { QuestionId = qA.Id, ResponseJson = malformed });
            Assert.False(evaluation.IsCorrect);
            Assert.Equal(0m, evaluation.PointsAwarded);
        }
    }

    [Fact]
    public async Task TutorEvaluate_GradesAgainstSnapshottedQuestionVersion_NotCurrentRevision()
    {
        var options = InMemoryOptions($"tutor_conf_snapshot_{Guid.NewGuid()}");
        var (context, exam) = await SeedAllTypesExamAsync(options);
        var attemptService = new ExamAttemptService(context);
        var tutorService = new TutorService(context, new GroundedFallbackAiTutorProvider());

        var started = await attemptService.StartAttemptAsync(
            exam.Id, "learner-1", "Learner One", ExamDeliveryMode.Tutor, ExamLayout.Sequential);
        var qA = started.Questions[0];
        var originalCorrectOptionId = qA.Options.First(o => o.OptionText == "Correct option").Id;

        // A mid-session revision flips which option is correct in the CURRENT
        // version; the snapshotted version the learner actually saw remains
        // authoritative for grading. The revision is authored through a separate
        // context, as it would be by a different author at runtime.
        await using (var revisionContext = new NurviaDbContext(options))
        {
            var question = await revisionContext.Questions.FirstAsync(q => q.Id == qA.Id);
            var revised = new QuestionVersion(question.Id, 2, "Revised stem.", QuestionType.MultipleChoice, "author")
            {
                CognitiveSkill = CognitiveSkill.RecognizeCues,
                ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
                GeneralRationale = "Revised rationale.",
                Status = ContentStatus.Published
            };
            revised.Options.Add(new QuestionOption(1, "Revised correct", true, "Revised specific."));
            revised.Options.Add(new QuestionOption(2, "Revised incorrect", false, "Revised incorrect."));
            // Explicit Add: EF Core 10 classifies graph-discovered dependents of a
            // previously-saved principal as Modified, so the explicit Add mirrors
            // the production service (QuestionService.CreateNewVersionAsync).
            revisionContext.QuestionVersions.Add(revised);
            revisionContext.Questions.Attach(question);
            question.CurrentVersionId = revised.Id;
            await revisionContext.SaveChangesAsync();
        }

        // The original correct option no longer exists in the revised version;
        // grading against the snapshot still honors it.
        var evaluation = await tutorService.EvaluateAnswerAsync(started.AttemptId, "learner-1",
            new TutorEvaluateRequest { QuestionId = qA.Id, ResponseJson = $$"""{"SelectedOptionId":"{{originalCorrectOptionId}}"}""" });
        Assert.True(evaluation.IsCorrect);
        Assert.Equal("Approved general rationale MultipleChoice.", evaluation.GeneralRationale);
    }

    // =========================================================================
    // DEF-05: academic metadata integrity
    // =========================================================================

    [Fact]
    public async Task DatabaseSeeder_PopulatesVerifiedSubjectMetadata_LeavesUnknownFieldsNullable()
    {
        var options = InMemoryOptions($"tutor_conf_seed_{Guid.NewGuid()}");
        await using var context = new NurviaDbContext(options);
        await DatabaseSeeder.SeedAsync(context);

        var pharm = await context.Exams.FirstAsync(e => e.Code == "ATI-PHARM-2026");
        var exit = await context.Exams.FirstAsync(e => e.Code == "RN-EXIT-COMP-01");

        // Verified: the pharmacology blueprint is 100% Pharmacology.
        Assert.Equal("Pharmacology", pharm.Subject);
        // Verified: the multi-specialty predictor is comprehensive by design.
        Assert.Equal("Comprehensive", exit.Subject);

        // Genuinely unknown values stay NULL — no fabricated school/year/season.
        Assert.Null(pharm.School);
        Assert.Null(pharm.AcademicYear);
        Assert.Null(pharm.Season);
        Assert.Null(pharm.Topic);
        Assert.Null(pharm.Difficulty);
        Assert.Null(exit.School);
        Assert.Null(exit.AcademicYear);
        Assert.Null(exit.Season);

        // Study Library filter options never advertise empty metadata values.
        var studyLibrary = new StudyLibraryService(context);
        var filters = await studyLibrary.GetFiltersAsync();
        Assert.Contains("Pharmacology", filters.Subjects);
        Assert.Contains("Comprehensive", filters.Subjects);
        Assert.DoesNotContain("", filters.Subjects);
        Assert.DoesNotContain("", filters.Schools);
        Assert.Empty(filters.Schools);
        Assert.Empty(filters.Seasons);
    }
}