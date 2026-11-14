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
            case QuestionType.SingleChoice:
                if (Options.Count < 2)
                    errors.Add("Multiple choice questions require at least 2 answer choices.");
                if (Options.Count(o => o.IsCorrect) != 1)
                    errors.Add("Multiple choice single-response questions must have exactly one correct answer.");
                break;

            case QuestionType.MultipleResponse: // Also SelectAllThatApply (SATA)
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

            case QuestionType.MultipleTrueFalse:
                if (Options.Count < 2 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Multiple True/False items require at least 2 distinct statements to evaluate.");
                break;

            case QuestionType.ImageBased:
                if (Exhibits.Count(e => e.Type == ExhibitType.Image) == 0 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Image-based questions must include at least one clinical image exhibit or visual media URL in ContentJsonData.");
                if (Options.Count < 2 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Image-based questions require at least 2 answer choices or hotspot target definitions.");
                break;

            case QuestionType.MultipleImageSelection:
            {
                // Grading derives the authoritative key exclusively from option
                // IsCorrect flags (QuestionResponseGrader treats this type as
                // set-equality over selected options), so a selectable option set
                // with at least one correct choice is always required. Exhibits may
                // supplement the panels but cannot substitute for gradable choices.
                if (Options.Count < 2)
                    errors.Add("Multiple-Image Selection questions require at least 2 selectable image choices to present to the candidate.");
                if (Options.Count >= 2 && Options.Count(o => o.IsCorrect) < 1)
                    errors.Add("Multiple-Image Selection questions must designate at least one correct image choice.");
                break;
            }

            case QuestionType.DragAndDrop:
                if (Options.Count < 2 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Drag-and-Drop questions must specify draggable tokens and drop targets.");
                break;

            case QuestionType.OrderedResponse:
                if (Options.Count < 3)
                    errors.Add("Ordered response questions require at least 3 steps or procedures to arrange in sequence.");
                break;

            case QuestionType.ClinicalCaseStudy: // Also UnfoldingCaseStudy
                if (Exhibits.Count == 0 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Clinical Case Study / Unfolding items must include at least one clinical chart exhibit (e.g. Notes, Vitals, Labs).");
                break;

            case QuestionType.ExtendedResponse:
                if (string.IsNullOrWhiteSpace(GeneralRationale) || GeneralRationale.Trim().Length < 30)
                    errors.Add("Extended response / Essay items must provide an evaluation rubric or model answer with at least 30 characters in GeneralRationale.");
                break;

            case QuestionType.Matching:
            {
                // Matching data represents pairs as alternating option entries: a premise
                // at an even position followed directly by its correct response at the
                // next odd position. QuestionResponseGrader derives the authoritative
                // answer key from this convention, so options (not ContentJsonData) are
                // always required and the pairing must be structurally complete.
                if (Options.Count < 2)
                {
                    errors.Add("Matching questions require at least 2 premise-response matching pair entries.");
                }
                else
                {
                    if (Options.Count % 2 != 0)
                    {
                        errors.Add("Matching questions require an even number of options — each premise followed directly by its correct response.");
                    }

                    var ordered = Options.OrderBy(o => o.DisplayOrder).ToList();
                    for (var i = 0; i < ordered.Count - 1; i += 2)
                    {
                        if (string.IsNullOrWhiteSpace(ordered[i].OptionText) ||
                            string.IsNullOrWhiteSpace(ordered[i + 1].OptionText))
                        {
                            errors.Add("Every matching pair must include both a complete premise and a complete response.");
                            break;
                        }
                    }
                }

                if (Options.Select(o => o.OptionIndex).Distinct().Count() != Options.Count)
                {
                    errors.Add("Matching options must use distinct option identifiers so learner responses map to the correct pair.");
                }

                break;
            }

            case QuestionType.FillInTheBlank: // Also Cloze
                var hasBlankInStem = Stem.Contains("____") || Stem.Contains("[blank]") || Stem.Contains("{blank}") || Stem.Contains("{1}");
                if (!hasBlankInStem && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Cloze / Fill-in-the-blank items must include a blank marker (e.g. '____', '[blank]') in the stem or specify blank tokens in ContentJsonData.");
                if (Options.Count(o => o.IsCorrect) < 1 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Cloze / Fill-in-the-blank items must specify at least one accepted answer.");
                break;

            case QuestionType.MatrixGrid:
                if (Options.Count < 4 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Matrix/Grid items must specify row and column configurations with at least 2 rows and 2 columns.");
                break;

            case QuestionType.NumericResponse: // Also NumericCalculation
                if (Options.Count(o => o.IsCorrect) < 1 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Numeric calculation items must specify an acceptable numerical answer, range, or tolerance.");
                break;

            case QuestionType.TabularResponse:
                if (string.IsNullOrWhiteSpace(ContentJsonData) && Exhibits.Count == 0)
                    errors.Add("Tabular response questions must define clinical table columns, rows, or patient trend exhibits.");
                break;

            case QuestionType.ShortAnswer:
                if (Options.Count(o => o.IsCorrect) < 1 && string.IsNullOrWhiteSpace(ContentJsonData))
                    errors.Add("Short answer questions must provide at least one accepted clinical term, keyword, or synonym.");
                break;

            case QuestionType.BowTie: // Also DynamicLabBowTie
                if (string.IsNullOrWhiteSpace(ContentJsonData) && Options.Count < 5)
                    errors.Add("Bow-Tie items must specify potential conditions, actions to take, and parameters to monitor (or at least 5 component options).");
                break;
        }

        ValidationErrors = errors.Count > 0 ? string.Join("; ", errors) : null;
        return errors.Count == 0;
    }
}
