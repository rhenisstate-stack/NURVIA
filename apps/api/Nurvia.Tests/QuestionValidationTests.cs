using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

public class QuestionValidationTests
{
    private static QuestionVersion CreateBaseVersion(QuestionType type, string stem = "A 64-year-old patient presents with acute heart failure symptoms.")
    {
        return new QuestionVersion(Guid.NewGuid(), 1, stem, type, "nurse-author-01")
        {
            GeneralRationale = "This comprehensive rationale explains the underlying clinical physiology and why specific nursing actions are prioritized."
        };
    }

    [Fact]
    public void Type01_SingleChoice_MCQ_Passes_When_Exactly_One_Correct_Option()
    {
        var qv = CreateBaseVersion(QuestionType.SingleChoice);
        qv.Options.Add(new QuestionOption(0, "Administer oxygen via nasal cannula", true));
        qv.Options.Add(new QuestionOption(1, "Place patient in Trendelenburg position", false));
        qv.Options.Add(new QuestionOption(2, "Administer IV beta blocker immediately", false));
        qv.Options.Add(new QuestionOption(3, "Encourage vigorous ambulation", false));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type01_SingleChoice_MCQ_Fails_When_Multiple_Or_Zero_Correct()
    {
        var qv = CreateBaseVersion(QuestionType.MultipleChoice);
        qv.Options.Add(new QuestionOption(0, "Option A", false));
        qv.Options.Add(new QuestionOption(1, "Option B", false));

        var isValid = qv.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("exactly one correct answer"));
    }

    [Fact]
    public void Type02_03_SATA_Passes_When_At_Least_One_Correct_Option()
    {
        var qv = CreateBaseVersion(QuestionType.SelectAllThatApply);
        qv.Options.Add(new QuestionOption(0, "Assess lung sounds bilateral", true));
        qv.Options.Add(new QuestionOption(1, "Monitor continuous pulse oximetry", true));
        qv.Options.Add(new QuestionOption(2, "Elevate head of bed to High-Fowler's", true));
        qv.Options.Add(new QuestionOption(3, "Administer large IV fluid bolus", false));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type04_MultipleTrueFalse_Passes_With_Options_Or_JsonData()
    {
        var qv = CreateBaseVersion(QuestionType.MultipleTrueFalse);
        qv.Options.Add(new QuestionOption(0, "Statement 1: Hypokalemia causes U waves", true));
        qv.Options.Add(new QuestionOption(1, "Statement 2: Hypercalcemia shortens QT interval", true));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type05_ImageBased_Passes_With_Image_Exhibit()
    {
        var qv = CreateBaseVersion(QuestionType.ImageBased);
        qv.Exhibits.Add(new QuestionExhibit(ExhibitType.Image, "Chest X-Ray Anteroposterior", "https://assets.nurvia.app/cxr-4091.png"));
        qv.Options.Add(new QuestionOption(0, "Right lower lobe consolidation", true));
        qv.Options.Add(new QuestionOption(1, "Normal cardiac silhouette", false));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type06_MultipleImageSelection_Passes_With_Image_Choices()
    {
        var qv = CreateBaseVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(new QuestionOption(0, "ECG Strip 1: Normal Sinus Rhythm", false));
        qv.Options.Add(new QuestionOption(1, "ECG Strip 2: Ventricular Fibrillation", true));
        qv.Options.Add(new QuestionOption(2, "ECG Strip 3: Atrial Flutter", false));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type07_DragAndDrop_Passes_With_ContentJsonData_Or_Options()
    {
        var qv = CreateBaseVersion(QuestionType.DragAndDrop);
        qv.ContentJsonData = "{\"tokens\": [\"Regular Insulin\", \"NPH Insulin\"], \"targets\": [\"Clear\", \"Cloudy\"]}";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type08_OrderedResponse_Passes_With_At_Least_3_Steps()
    {
        var qv = CreateBaseVersion(QuestionType.OrderedResponse);
        qv.Options.Add(new QuestionOption(0, "Step 1: Check blood glucose level", true, displayOrder: 1));
        qv.Options.Add(new QuestionOption(1, "Step 2: Administer prescribed IV regular insulin", true, displayOrder: 2));
        qv.Options.Add(new QuestionOption(2, "Step 3: Reassess blood glucose in 30 minutes", true, displayOrder: 3));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type09_UnfoldingCaseStudy_Passes_With_Clinical_Exhibit()
    {
        var qv = CreateBaseVersion(QuestionType.UnfoldingCaseStudy);
        qv.Exhibits.Add(new QuestionExhibit(ExhibitType.Chart, "Electronic Health Record - Vital Signs", "BP: 88/54 mmHg, HR: 122 bpm, RR: 28/min, SpO2: 89%"));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type10_ExtendedResponse_Passes_With_Sufficient_Rationale_Rubric()
    {
        var qv = CreateBaseVersion(QuestionType.ExtendedResponse);
        qv.GeneralRationale = "Clinical evaluation rubric: Candidate must identify sepsis criteria (SIRS + source), describe urgent 1-hour bundle actions (blood cultures before antibiotics, lactate measurement, broad-spectrum IV antimicrobials, fluid resuscitation), and demonstrate therapeutic communication.";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type11_Matching_Passes_With_Options_Or_JsonData()
    {
        var qv = CreateBaseVersion(QuestionType.Matching);
        qv.ContentJsonData = "{\"pairs\": [{\"premise\": \"Furosemide\", \"match\": \"Loop Diuretic\"}, {\"premise\": \"Lisinopril\", \"match\": \"ACE Inhibitor\"}]}";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type12_Cloze_FillInTheBlank_Passes_With_Blank_In_Stem()
    {
        var qv = CreateBaseVersion(QuestionType.Cloze, "The nurse recognizes that normal adult serum potassium range is [blank] to 5.0 mEq/L.");
        qv.Options.Add(new QuestionOption(0, "3.5", true));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type13_MatrixGrid_Passes_With_Grid_Payload()
    {
        var qv = CreateBaseVersion(QuestionType.MatrixGrid);
        qv.ContentJsonData = "{\"rows\": [\"Crackles in lung bases\", \"Dry mucous membranes\"], \"columns\": [\"Fluid Volume Overload\", \"Fluid Volume Deficit\"]}";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type14_NumericCalculation_Passes_With_Target_Value()
    {
        var qv = CreateBaseVersion(QuestionType.NumericCalculation, "Calculate the infusion rate in mL/hr: Order 1,000 mL 0.9% Normal Saline to infuse over 8 hours.");
        qv.Options.Add(new QuestionOption(0, "125", true));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type15_TrueFalse_Passes_With_Exactly_Two_Options()
    {
        var qv = CreateBaseVersion(QuestionType.TrueFalse);
        qv.Options.Add(new QuestionOption(0, "True", true));
        qv.Options.Add(new QuestionOption(1, "False", false));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type16_TabularResponse_Passes_With_Table_Data()
    {
        var qv = CreateBaseVersion(QuestionType.TabularResponse);
        qv.ContentJsonData = "{\"headers\": [\"Time\", \"Temp (C)\", \"HR\", \"BP\"], \"rows\": [[\"08:00\", \"37.2\", \"78\", \"120/80\"], [\"12:00\", \"38.9\", \"112\", \"98/60\"]]}";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type17_ShortAnswer_Passes_With_Accepted_Keyword()
    {
        var qv = CreateBaseVersion(QuestionType.ShortAnswer, "Identify the emergency medication of choice for anaphylactic shock.");
        qv.Options.Add(new QuestionOption(0, "Epinephrine", true));

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void Type18_DynamicLab_BowTie_Passes_With_BowTie_Structure()
    {
        var qv = CreateBaseVersion(QuestionType.DynamicLabBowTie);
        qv.ContentJsonData = "{\"condition\": \"Diabetic Ketoacidosis\", \"actions\": [\"Initiate normal saline IV infusion\", \"Administer regular insulin IV bolus\"], \"parameters\": [\"Serum potassium\", \"Hourly blood glucose\"]}";

        var isValid = qv.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }
}
