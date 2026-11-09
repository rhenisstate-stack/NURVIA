using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Domain.Questions;

public class QuestionVersion : Entity, IAuditableEntity
{
    public Guid QuestionId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public string Stem { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.MultipleChoice;
    public CognitiveSkill CognitiveSkill { get; set; } = CognitiveSkill.AnalyzeCues;
    public ClientNeedCategory ClientNeedCategory { get; set; } = ClientNeedCategory.PhysiologicalIntegrity;
    public string GeneralRationale { get; set; } = string.Empty;
    public string? ContentJsonData { get; set; } // Type-specific payload (e.g. Matrix columns, Drag & Drop keys)
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public string? ValidationErrors { get; set; }
    public string? ReviewNotes { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public Question? Question { get; set; }
    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public ICollection<QuestionExhibit> Exhibits { get; set; } = new List<QuestionExhibit>();
    public ICollection<QuestionReview> Reviews { get; set; } = new List<QuestionReview>();

    public QuestionVersion() { }

    public QuestionVersion(Guid questionId, int versionNumber, string stem, QuestionType questionType, string createdBy)
    {
        QuestionId = questionId;
        VersionNumber = versionNumber;
        Stem = stem;
        QuestionType = questionType;
        CreatedBy = createdBy;
        CreatedAtUtc = DateTime.UtcNow;
        Status = ContentStatus.Draft;
    }

    public bool Validate(out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrWhiteSpace(Stem) || Stem.Trim().Length < 10)
        {
            errors.Add("Question stem must contain at least 10 characters describing the clinical scenario.");
        }

        if (string.IsNullOrWhiteSpace(GeneralRationale) || GeneralRationale.Trim().Length < 15)
        {
            errors.Add("Comprehensive clinical rationale must contain at least 15 characters explaining why answers are correct/incorrect.");
        }

        switch (QuestionType)
        {
            case QuestionType.MultipleChoice:
                if (Options.Count < 2)
                    errors.Add("Multiple choice questions require at least 2 answer choices.");
                if (Options.Count(o => o.IsCorrect) != 1)
                    errors.Add("Multiple choice single-response questions must have exactly one correct answer.");
                break;

            case QuestionType.MultipleResponse:
                if (Options.Count < 3)
                    errors.Add("Select All That Apply (SATA) items require at least 3 answer choices.");
                if (Options.Count(o => o.IsCorrect) < 1)
                    errors.Add("Select All That Apply (SATA) items must have at least one correct choice.");
                break;

            case QuestionType.TrueFalse:
                if (Options.Count != 2)
                    errors.Add("True/False questions must have exactly 2 choices (True and False).");
                if (Options.Count(o => o.IsCorrect) != 1)
                    errors.Add("True/False questions must have exactly one correct answer.");
                break;

            case QuestionType.FillInTheBlank:
            case QuestionType.NumericResponse:
                if (Options.Count(o => o.IsCorrect) < 1 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Numeric response / Fill-in items must specify an acceptable target value or range.");
                break;

            case QuestionType.ClinicalCaseStudy:
                if (Exhibits.Count == 0)
                    errors.Add("Clinical Case Study / Unfolding items must include at least one clinical chart exhibit (e.g. Notes, Vitals, Labs).");
                break;
        }

        ValidationErrors = errors.Count > 0 ? string.Join("; ", errors) : null;
        return errors.Count == 0;
    }
}
