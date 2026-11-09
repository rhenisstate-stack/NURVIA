using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

public class QuestionValidationTests
{
    [Theory]
    [InlineData("")]
    [InlineData("Too short")]
    [InlineData("         ")]
    public void Validate_StemUnderTenChars_ReturnsValidationError(string shortStem)
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, shortStem, QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "This is a sufficiently long clinical rationale for validation."
        };
        version.Options.Add(new QuestionOption(1, "Option A", true));
        version.Options.Add(new QuestionOption(2, "Option B", false));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Question stem must contain at least 10 characters"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("Short rationale")]
    public void Validate_RationaleUnderFifteenChars_ReturnsValidationError(string shortRationale)
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "A patient presents with signs of acute chest discomfort.", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = shortRationale
        };
        version.Options.Add(new QuestionOption(1, "Option A", true));
        version.Options.Add(new QuestionOption(2, "Option B", false));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Comprehensive clinical rationale must contain at least 15 characters"));
    }

    [Fact]
    public void Validate_MultipleChoice_WithZeroCorrectAnswers_FailsValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "A patient presents with signs of acute chest discomfort.", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "Comprehensive clinical rationale explaining pathophysiology and intervention."
        };
        version.Options.Add(new QuestionOption(1, "Option A", false));
        version.Options.Add(new QuestionOption(2, "Option B", false));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("must have exactly one correct answer"));
    }

    [Fact]
    public void Validate_MultipleChoice_WithMultipleCorrectAnswers_FailsValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "A patient presents with signs of acute chest discomfort.", QuestionType.MultipleChoice, "Author")
        {
            GeneralRationale = "Comprehensive clinical rationale explaining pathophysiology and intervention."
        };
        version.Options.Add(new QuestionOption(1, "Option A", true));
        version.Options.Add(new QuestionOption(2, "Option B", true));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("must have exactly one correct answer"));
    }

    [Fact]
    public void Validate_SATA_WithLessThanThreeOptions_FailsValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "Select all findings that require immediate intervention.", QuestionType.MultipleResponse, "Author")
        {
            GeneralRationale = "Comprehensive clinical rationale explaining multi-system assessment findings."
        };
        version.Options.Add(new QuestionOption(1, "Option A", true));
        version.Options.Add(new QuestionOption(2, "Option B", true));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("require at least 3 answer choices"));
    }

    [Fact]
    public void Validate_TrueFalse_WithNotTwoOptions_FailsValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "True or False statement regarding standard infection precautions.", QuestionType.TrueFalse, "Author")
        {
            GeneralRationale = "Comprehensive clinical rationale regarding CDC transmission guidelines."
        };
        version.Options.Add(new QuestionOption(1, "True", true));
        version.Options.Add(new QuestionOption(2, "False", false));
        version.Options.Add(new QuestionOption(3, "Maybe", false)); // 3 options is invalid for True/False

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("must have exactly 2 choices"));
    }

    [Fact]
    public void Validate_ClinicalCaseStudy_WithoutExhibits_FailsValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "Review the client EHR data to prioritize care for septic shock.", QuestionType.ClinicalCaseStudy, "Author")
        {
            GeneralRationale = "Comprehensive rationale explaining SIRS criteria and fluid resuscitation protocol."
        };
        version.Options.Add(new QuestionOption(1, "Administer 30 mL/kg crystalloid bolus", true));
        version.Options.Add(new QuestionOption(2, "Wait 4 hours before drawing blood cultures", false));

        var isValid = version.Validate(out var errors);

        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("must include at least one clinical chart exhibit"));
    }

    [Fact]
    public void Validate_ClinicalCaseStudy_WithExhibit_PassesValidation()
    {
        var version = new QuestionVersion(Guid.NewGuid(), 1, "Review the client EHR data to prioritize care for septic shock.", QuestionType.ClinicalCaseStudy, "Author")
        {
            GeneralRationale = "Comprehensive rationale explaining SIRS criteria and fluid resuscitation protocol."
        };
        version.Options.Add(new QuestionOption(1, "Administer 30 mL/kg crystalloid bolus", true));
        version.Options.Add(new QuestionOption(2, "Wait 4 hours before drawing blood cultures", false));
        version.Exhibits.Add(new QuestionExhibit(ExhibitType.LabResults, "STAT Labs", "Lactate: 4.2 mmol/L, WBC: 18,500/uL", 1));

        var isValid = version.Validate(out var errors);

        Assert.True(isValid);
        Assert.Empty(errors);
    }
}
