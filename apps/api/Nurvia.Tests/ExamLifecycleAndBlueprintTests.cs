using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

public class ExamLifecycleAndBlueprintTests
{
    private (Exam Exam, Question PublishedQ, Question DraftQ) SetupExamWithQuestions()
    {
        var exam = new Exam("EXAM-TEST-01", "Nursing Leadership Practice Assessment", "Evaluates prioritization and delegation in acute inpatient settings.", NursingPathway.RN, ExamCategory.ATI, "Lead Author")
        {
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m
        };

        var version = new ExamVersion(exam.Id, 1, "Nursing Leadership Practice Assessment", "Assessment version 1", "Lead Author")
        {
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75.0m,
            Instructions = "Read each scenario carefully. Select the best response.",
            Blueprint = new ExamBlueprint(exam.Id, 2)
        };

        exam.Versions.Add(version);
        exam.CurrentVersion = version;
        exam.CurrentVersionId = version.Id;

        // Create a Published Question
        var qPub = new Question("Q-PUB-01", NursingPathway.RN, ExamCategory.ATI, "Leadership", "Delegation", DifficultyLevel.Intermediate, "Author")
        {
            Status = ContentStatus.Published
        };
        var qPubVer = new QuestionVersion(qPub.Id, 1, "Which task can the RN safely delegate to an experienced Unlicensed Assistive Personnel (UAP)?", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "Measuring and recording routine vital signs on a stable postoperative client is within the scope of practice of UAP.",
            Status = ContentStatus.Published
        };
        qPubVer.Options.Add(new QuestionOption(1, "Measuring and recording routine vital signs on a stable client", true));
        qPubVer.Options.Add(new QuestionOption(2, "Administering oral analgesic medication", false));
        qPub.Versions.Add(qPubVer);
        qPub.CurrentVersion = qPubVer;
        qPub.CurrentVersionId = qPubVer.Id;

        // Create a Draft Question
        var qDraft = new Question("Q-DFT-02", NursingPathway.RN, ExamCategory.ATI, "Leadership", "Prioritization", DifficultyLevel.Intermediate, "Author")
        {
            Status = ContentStatus.Draft
        };
        var qDraftVer = new QuestionVersion(qDraft.Id, 1, "Which client should the nurse assess first during morning rounds?", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "A client reporting sudden shortness of breath and tracheostomy tube dislodgement requires emergency intervention.",
            Status = ContentStatus.Draft
        };
        qDraftVer.Options.Add(new QuestionOption(1, "Client with tracheostomy experiencing acute respiratory distress", true));
        qDraftVer.Options.Add(new QuestionOption(2, "Client requesting routine discharge paperwork", false));
        qDraft.Versions.Add(qDraftVer);
        qDraft.CurrentVersion = qDraftVer;
        qDraft.CurrentVersionId = qDraftVer.Id;

        return (exam, qPub, qDraft);
    }

    [Fact]
    public void ExamBlueprint_Validate_FailsWhenZeroQuestionsAssigned()
    {
        var (exam, _, _) = SetupExamWithQuestions();
        exam.CurrentVersion!.ExamQuestions.Clear();

        var isValid = exam.CurrentVersion.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("requires at least one question assigned"));
    }

    [Fact]
    public void ExamPublish_WithUnpublishedQuestion_ThrowsDomainException()
    {
        var (exam, qPub, qDraft) = SetupExamWithQuestions();

        // Assign both the published and the draft question
        var eq1 = new ExamQuestion(exam.CurrentVersion!.Id, qPub.Id, qPub.CurrentVersionId!.Value, 1) { Question = qPub };
        var eq2 = new ExamQuestion(exam.CurrentVersion.Id, qDraft.Id, qDraft.CurrentVersionId!.Value, 2) { Question = qDraft };

        exam.CurrentVersion.ExamQuestions.Add(eq1);
        exam.CurrentVersion.ExamQuestions.Add(eq2);

        exam.SubmitForReview("Lead Author");
        exam.Approve("Dr. Reviewer", "Blueprint looks good");

        // Act & Assert: Publish should fail because qDraft is not Published
        var ex = Assert.Throws<DomainException>(() => exam.Publish("Publisher"));
        Assert.Contains("Contains unapproved question", ex.Message);
        Assert.Contains("Q-DFT-02", ex.Message);
    }

    [Fact]
    public void ExamPublish_WithAllPublishedQuestions_Succeeds()
    {
        var (exam, qPub, _) = SetupExamWithQuestions();

        var eq1 = new ExamQuestion(exam.CurrentVersion!.Id, qPub.Id, qPub.CurrentVersionId!.Value, 1) { Question = qPub };
        exam.CurrentVersion.ExamQuestions.Add(eq1);

        exam.SubmitForReview("Lead Author");
        Assert.Equal(ExamStatus.PendingReview, exam.Status);

        exam.Approve("Dr. Reviewer", "Approved for course rollout");
        Assert.Equal(ExamStatus.Approved, exam.Status);

        exam.Publish("Curriculum Director");
        Assert.Equal(ExamStatus.Published, exam.Status);
        Assert.Equal(ExamStatus.Published, exam.CurrentVersion.Status);
    }

    [Fact]
    public void ExamVersion_Validate_FailsWhenTimeLimitZeroOrNegative()
    {
        var (exam, qPub, _) = SetupExamWithQuestions();
        var eq1 = new ExamQuestion(exam.CurrentVersion!.Id, qPub.Id, qPub.CurrentVersionId!.Value, 1) { Question = qPub };
        exam.CurrentVersion.ExamQuestions.Add(eq1);

        exam.CurrentVersion.TimeLimitMinutes = 0;

        var isValid = exam.CurrentVersion.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Time limit must be greater than zero"));
    }

    [Fact]
    public void ExamVersion_Validate_FailsWhenPassingScoreExceedsHundred()
    {
        var (exam, qPub, _) = SetupExamWithQuestions();
        var eq1 = new ExamQuestion(exam.CurrentVersion!.Id, qPub.Id, qPub.CurrentVersionId!.Value, 1) { Question = qPub };
        exam.CurrentVersion.ExamQuestions.Add(eq1);

        exam.CurrentVersion.PassingScorePercentage = 105.0m;

        var isValid = exam.CurrentVersion.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Passing score percentage must be between 1% and 100%"));
    }
}
