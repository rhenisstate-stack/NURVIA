using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

public class QuestionLifecycleTests
{
    private Question CreateValidDraftQuestion()
    {
        var question = new Question("Q-RN-ATI-TEST-001", NursingPathway.RN, ExamCategory.ATI, "Pharmacology", "Cardiac", DifficultyLevel.Intermediate, "Prof. Adams");
        var version = new QuestionVersion(question.Id, 1, "A nurse assesses a client taking digoxin who reports blurred vision and yellow halos. What is the priority nursing action?", QuestionType.MultipleChoice, "Prof. Adams")
        {
            CognitiveSkill = CognitiveSkill.AnalyzeCues,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Yellow halos and blurred vision are classic signs of digitalis toxicity. The nurse must withhold the next dose and verify serum digoxin level.",
            Status = ContentStatus.Draft
        };

        version.Options.Add(new QuestionOption(1, "Withhold medication and notify the provider to obtain serum digoxin level", true, "Priority action", 1));
        version.Options.Add(new QuestionOption(2, "Administer the next scheduled dose with milk", false, "Dangerous action", 2));
        version.Options.Add(new QuestionOption(3, "Encourage high-potassium fruit juice", false, "Secondary consideration", 3));
        version.Options.Add(new QuestionOption(4, "Recheck visual acuity with a Snellen chart", false, "Ineffective delay", 4));

        question.Versions.Add(version);
        question.CurrentVersion = version;
        question.CurrentVersionId = version.Id;

        return question;
    }

    [Fact]
    public void FullLifecycle_FromDraftToPublished_TransitionsCorrectly()
    {
        // Arrange
        var question = CreateValidDraftQuestion();
        Assert.Equal(ContentStatus.Draft, question.Status);

        // Act 1: Submit for review
        question.SubmitForReview("Prof. Adams");
        Assert.Equal(ContentStatus.PendingReview, question.Status);
        Assert.Equal(ContentStatus.PendingReview, question.CurrentVersion!.Status);

        // Act 2: Reviewer approves
        question.Approve("rev-01", "Dr. Jenkins, DNP", "Clinically accurate and reflects current NCLEX standards.");
        Assert.Equal(ContentStatus.Approved, question.Status);
        Assert.Single(question.Reviews);
        Assert.Equal(ReviewDecision.Approved, question.Reviews.First().Decision);

        // Act 3: Publisher publishes
        question.Publish("Content Publisher Lead");
        Assert.Equal(ContentStatus.Published, question.Status);
        Assert.Equal(ContentStatus.Published, question.CurrentVersion!.Status);
    }

    [Fact]
    public void Publish_DirectlyFromDraft_ThrowsDomainException()
    {
        // Arrange
        var question = CreateValidDraftQuestion();

        // Act & Assert
        var ex = Assert.Throws<DomainException>(() => question.Publish("Publisher"));
        Assert.Contains("must be validated and approved", ex.Message);
        Assert.Equal(ContentStatus.Draft, question.Status);
    }

    [Fact]
    public void SubmitForReview_WithInvalidData_ThrowsDomainExceptionAndMarksValidationFailed()
    {
        // Arrange
        var question = new Question("Q-RN-ATI-INV", NursingPathway.RN, ExamCategory.ATI, "Pharmacology", "Cardiac", DifficultyLevel.Intermediate, "Author");
        var version = new QuestionVersion(question.Id, 1, "Short", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "", // Invalid
            Status = ContentStatus.Draft
        };
        question.Versions.Add(version);
        question.CurrentVersion = version;

        // Act & Assert
        var ex = Assert.Throws<DomainException>(() => question.SubmitForReview("Author"));
        Assert.Equal(ContentStatus.ValidationFailed, question.Status);
        Assert.Contains("Question validation failed", ex.Message);
    }

    [Fact]
    public void Reject_SetsStatusToRejectedAndRecordsReviewHistory()
    {
        // Arrange
        var question = CreateValidDraftQuestion();
        question.SubmitForReview("Prof. Adams");

        // Act
        question.Reject("rev-02", "Dr. Miller", "Rationale needs additional citations regarding pediatric contraindications.");

        // Assert
        Assert.Equal(ContentStatus.Rejected, question.Status);
        Assert.Equal(ContentStatus.Rejected, question.CurrentVersion!.Status);
        Assert.Single(question.Reviews);
        Assert.Equal(ReviewDecision.Rejected, question.Reviews.First().Decision);
    }

    [Fact]
    public void CreateNewVersion_FromPublishedQuestion_PreservesHistoricalVersionAndCreatesDraftV2()
    {
        // Arrange
        var question = CreateValidDraftQuestion();
        question.SubmitForReview("Prof. Adams");
        question.Approve("rev-01", "Dr. Jenkins", "Approved");
        question.Publish("Publisher");

        Assert.Single(question.Versions);
        Assert.Equal(ContentStatus.Published, question.Status);

        // Act: Author starts revision
        var v2 = question.CreateNewVersion("Prof. Adams");

        // Assert
        Assert.Equal(2, question.Versions.Count);
        Assert.Equal(2, v2.VersionNumber);
        Assert.Equal(ContentStatus.Draft, v2.Status);
        Assert.Equal(ContentStatus.Draft, question.Status);
        Assert.Equal(v2.Id, question.CurrentVersionId);

        // Historical v1 is preserved as Published
        var v1 = question.Versions.First(v => v.VersionNumber == 1);
        Assert.Equal(ContentStatus.Published, v1.Status);
    }

    [Fact]
    public void Archive_MarksQuestionAndCurrentVersionArchived()
    {
        // Arrange
        var question = CreateValidDraftQuestion();
        question.SubmitForReview("Prof. Adams");
        question.Approve("rev-01", "Dr. Jenkins", "Approved");
        question.Publish("Publisher");

        // Act
        question.Archive("Publisher");

        // Assert
        Assert.Equal(ContentStatus.Archived, question.Status);
        Assert.Equal(ContentStatus.Archived, question.CurrentVersion!.Status);
    }
}
