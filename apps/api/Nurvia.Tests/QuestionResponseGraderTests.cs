using Nurvia.Application.Questions;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// Pure unit tests for the authoritative deterministic grader. These run without a
/// database and cover every canonical question type, partial-credit fractions, and
/// the legacy "non-empty earns credit" fallback for historical content without keys.
/// </summary>
public class QuestionResponseGraderTests
{
    private static QuestionVersion NewVersion(QuestionType type, string? contentJson = null)
    {
        return new QuestionVersion(Guid.NewGuid(), 1, "Test stem for grading engine.", type, "tester")
        {
            ContentJsonData = contentJson
        };
    }

    private static QuestionOption Opt(int index, string text, bool correct, int displayOrder = 0)
    {
        return new QuestionOption(index, text, correct, null, displayOrder);
    }

    // ---------------------------------------------------------------
    // Empty / malformed responses never earn credit
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("null")]
    public void Evaluate_NullOrEmptyResponse_IsNeverCorrect(string? responseJson)
    {
        var qv = NewVersion(QuestionType.SingleChoice);
        qv.Options.Add(Opt(1, "A", true));

        var result = QuestionResponseGrader.Evaluate(qv, responseJson);

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MalformedJson_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.SingleChoice);
        qv.Options.Add(Opt(1, "A", true));

        var result = QuestionResponseGrader.Evaluate(qv, "{not valid json");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 1. Single-answer types: MultipleChoice / SingleChoice / TrueFalse / ImageBased
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(QuestionType.MultipleChoice)]
    [InlineData(QuestionType.SingleChoice)]
    [InlineData(QuestionType.TrueFalse)]
    [InlineData(QuestionType.ImageBased)]
    public void Evaluate_SingleAnswerType_CorrectOptionIndex(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "Wrong answer", false));
        qv.Options.Add(Opt(2, "Right answer", true));
        var correctId = qv.Options.Single(o => o.IsCorrect).Id;

        // by option index
        var byIndex = QuestionResponseGrader.Evaluate(qv, "2");
        // by option id (quoted guid)
        var byId = QuestionResponseGrader.Evaluate(qv, $"\"{correctId}\"");
        // by structured payload
        var byPayload = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionId\":\"{correctId}\"}}");

        Assert.True(byIndex.IsCorrect);
        Assert.True(byId.IsCorrect);
        Assert.True(byPayload.IsCorrect);
        Assert.All(new[] { byIndex, byId, byPayload }, r => Assert.Equal(1m, r.Fraction));
    }

    [Theory]
    [InlineData(QuestionType.MultipleChoice)]
    [InlineData(QuestionType.SingleChoice)]
    [InlineData(QuestionType.TrueFalse)]
    [InlineData(QuestionType.ImageBased)]
    public void Evaluate_SingleAnswerType_WrongOptionIndex_IsNotCorrect(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "Wrong answer", false));
        qv.Options.Add(Opt(2, "Right answer", true));

        var result = QuestionResponseGrader.Evaluate(qv, "1");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    [Fact]
    public void Evaluate_TrueFalse_ObjectPayloadWithOptionId_IsCorrect()
    {
        // The True/False renderer submits {"value":"<optionId>"}; the grader must
        // resolve the persisted identifier rather than returning no selection.
        var qv = NewVersion(QuestionType.TrueFalse);
        var wrong = Opt(1, "True", false);
        var right = Opt(2, "False", true);
        qv.Options.Add(wrong);
        qv.Options.Add(right);

        var correct = QuestionResponseGrader.Evaluate(qv, $"{{\"value\":\"{right.Id}\"}}");
        var incorrect = QuestionResponseGrader.Evaluate(qv, $"{{\"value\":\"{wrong.Id}\"}}");

        Assert.True(correct.IsCorrect);
        Assert.Equal(1m, correct.Fraction);
        Assert.False(incorrect.IsCorrect);
        Assert.Equal(0m, incorrect.Fraction);
    }

    [Fact]
    public void Evaluate_SingleAnswerType_ObjectPayloadWithIntegerStringValue_IsCorrect()
    {
        var qv = NewVersion(QuestionType.SingleChoice);
        qv.Options.Add(Opt(1, "Wrong answer", false));
        qv.Options.Add(Opt(2, "Right answer", true));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"value\":\"2\"}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 2. MultipleResponse (SATA) / MultipleImageSelection: exact set equality
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(QuestionType.MultipleResponse)]
    [InlineData(QuestionType.MultipleImageSelection)]
    public void Evaluate_SATA_ExactCorrectSet_IsCorrect(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "Option A", true));
        qv.Options.Add(Opt(2, "Option B", true));
        qv.Options.Add(Opt(3, "Option C", false));
        var correctIds = qv.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToList();

        var response = $"{{\"SelectedOptionIds\":[\"{correctIds[0]}\",\"{correctIds[1]}\"]}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Theory]
    [InlineData(QuestionType.MultipleResponse)]
    [InlineData(QuestionType.MultipleImageSelection)]
    public void Evaluate_SATA_PartialSelection_GetsProportionalFraction(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "Option A", true));
        qv.Options.Add(Opt(2, "Option B", true));
        qv.Options.Add(Opt(3, "Option C", true));
        qv.Options.Add(Opt(4, "Option D", false));
        var correctIds = qv.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToList();

        // Selected 2 of 3 correct answers -> fraction 2/3, but not fully correct.
        var response = $"{{\"SelectedOptionIds\":[\"{correctIds[0]}\",\"{correctIds[1]}\"]}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.6667m, result.Fraction);
    }

    [Theory]
    [InlineData(QuestionType.MultipleResponse)]
    [InlineData(QuestionType.MultipleImageSelection)]
    public void Evaluate_SATA_WrongSelection_IsNotCorrect(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "Option A", true));
        qv.Options.Add(Opt(2, "Option B", false));
        var wrongId = qv.Options.Single(o => !o.IsCorrect).Id;

        var result = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionIds\":[\"{wrongId}\"]}}");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 2b. MultipleImageSelection contract hardening: legacy payloads,
    //     duplicates, unknown identifiers, malformed shapes
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_MultipleImageSelection_LegacyScalarPayload_IsGradedAsOneSelection()
    {
        // Payloads persisted by the earlier single-selection renderer carry a
        // scalar "SelectedOptionId". They must be treated as a one-element
        // selection, never silently converted into a full correct answer.
        var qv = NewVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(Opt(1, "Panel A", false));
        qv.Options.Add(Opt(2, "Panel B", true));
        var correctId = qv.Options.Single(o => o.IsCorrect).Id;
        var wrongId = qv.Options.Single(o => !o.IsCorrect).Id;

        var legacyCorrect = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionId\":\"{correctId}\"}}");
        var legacyWrong = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionId\":\"{wrongId}\"}}");

        Assert.True(legacyCorrect.IsCorrect);
        Assert.Equal(1m, legacyCorrect.Fraction);
        Assert.False(legacyWrong.IsCorrect);
        Assert.Equal(0m, legacyWrong.Fraction);
    }

    [Fact]
    public void Evaluate_MultipleImageSelection_DuplicateSelections_AreDeduplicated()
    {
        var qv = NewVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(Opt(1, "Panel A", true));
        qv.Options.Add(Opt(2, "Panel B", false));
        var correctId = qv.Options.Single(o => o.IsCorrect).Id;

        var response = $"{{\"SelectedOptionIds\":[\"{correctId}\",\"{correctId}\"]}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MultipleImageSelection_UnknownIdentifiers_DoNotEarnCredit()
    {
        var qv = NewVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(Opt(1, "Panel A", true));
        qv.Options.Add(Opt(2, "Panel B", false));

        var unknownOnly = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionIds\":[\"{Guid.NewGuid()}\"]}}");
        var unknownAndWrong = QuestionResponseGrader.Evaluate(
            qv,
            $"{{\"SelectedOptionIds\":[\"{Guid.NewGuid()}\",\"{qv.Options.Single(o => !o.IsCorrect).Id}\"]}}");

        Assert.False(unknownOnly.IsCorrect);
        Assert.Equal(0m, unknownOnly.Fraction);
        Assert.False(unknownAndWrong.IsCorrect);
        Assert.Equal(0m, unknownAndWrong.Fraction);
    }

    [Fact]
    public void Evaluate_MultipleImageSelection_ExtraIncorrectSelection_IsNotFullyCorrect()
    {
        var qv = NewVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(Opt(1, "Panel A", true));
        qv.Options.Add(Opt(2, "Panel B", false));
        var correctId = qv.Options.Single(o => o.IsCorrect).Id;
        var wrongId = qv.Options.Single(o => !o.IsCorrect).Id;

        var result = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionIds\":[\"{correctId}\",\"{wrongId}\"]}}");

        Assert.False(result.IsCorrect);
    }

    [Theory]
    [InlineData("{\"SelectedOptionIds\":[]}")]
    [InlineData("{\"SelectedOptionIds\":\"not-an-array\"}")]
    [InlineData("{not valid json")]
    public void Evaluate_MultipleImageSelection_EmptyOrMalformedPayload_IsNotCorrect(string response)
    {
        var qv = NewVersion(QuestionType.MultipleImageSelection);
        qv.Options.Add(Opt(1, "Panel A", true));

        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 5. NumericCalculation: decimal comparison with tolerance
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_NumericCalculation_ExactValue_IsCorrect()
    {
        var qv = NewVersion(QuestionType.NumericCalculation);
        qv.Options.Add(Opt(1, "3.14", true));

        var result = QuestionResponseGrader.Evaluate(qv, "3.14");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_NumericCalculation_WithinTolerance_IsCorrect()
    {
        var qv = NewVersion(QuestionType.NumericCalculation);
        qv.Options.Add(Opt(1, "3.14", true));

        var result = QuestionResponseGrader.Evaluate(qv, "3.145");

        Assert.True(result.IsCorrect);
    }

    [Fact]
    public void Evaluate_NumericCalculation_StructuredPayload_IsCorrect()
    {
        var qv = NewVersion(QuestionType.NumericCalculation);
        qv.Options.Add(Opt(1, "75", true));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"NumericResponse\":\"75\"}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_NumericCalculation_WrongValue_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.NumericCalculation);
        qv.Options.Add(Opt(1, "3.14", true));

        var result = QuestionResponseGrader.Evaluate(qv, "4.20");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 4 / 17. Cloze / ShortAnswer: case-insensitive text match
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(QuestionType.Cloze)]
    [InlineData(QuestionType.ShortAnswer)]
    public void Evaluate_TextMatch_CaseInsensitive_IsCorrect(QuestionType type)
    {
        var qv = NewVersion(type);
        qv.Options.Add(Opt(1, "diabetes mellitus", true));

        var raw = QuestionResponseGrader.Evaluate(qv, "\"DIABETES MELLITUS\"");
        var structured = QuestionResponseGrader.Evaluate(qv, "{\"TextResponse\":\"Diabetes Mellitus\"}");

        Assert.True(raw.IsCorrect);
        Assert.True(structured.IsCorrect);
        Assert.Equal(1m, structured.Fraction);
    }

    [Fact]
    public void Evaluate_TextMatch_WrongText_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.Cloze);
        qv.Options.Add(Opt(1, "diabetes mellitus", true));

        var result = QuestionResponseGrader.Evaluate(qv, "\"hypertension\"");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    [Fact]
    public void Evaluate_ShortAnswer_LegacyPayload_IsStillGradable()
    {
        // {"ShortAnswer":"..."} was persisted by earlier renderer versions; the
        // grader must keep extracting the text instead of falling back to
        // comparing the raw JSON string against the answer key.
        var qv = NewVersion(QuestionType.ShortAnswer);
        qv.Options.Add(Opt(1, "naloxone", true));

        var legacy = QuestionResponseGrader.Evaluate(qv, "{\"ShortAnswer\":\"Naloxone\"}");
        var canonical = QuestionResponseGrader.Evaluate(qv, "{\"TextResponse\":\"  NALOXONE  \"}");

        Assert.True(legacy.IsCorrect);
        Assert.Equal(1m, legacy.Fraction);
        Assert.True(canonical.IsCorrect, "Whitespace must be normalized before comparison");
    }

    [Fact]
    public void Evaluate_ShortAnswer_EmptyResponse_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.ShortAnswer);
        qv.Options.Add(Opt(1, "naloxone", true));

        var empty = QuestionResponseGrader.Evaluate(qv, "{\"TextResponse\":\"\"}");
        var whitespace = QuestionResponseGrader.Evaluate(qv, "{\"TextResponse\":\"   \"}");

        Assert.False(empty.IsCorrect);
        Assert.False(whitespace.IsCorrect);
    }

    [Fact]
    public void Evaluate_ShortAnswer_MalformedPayload_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.ShortAnswer);
        qv.Options.Add(Opt(1, "naloxone", true));

        var malformed = QuestionResponseGrader.Evaluate(qv, "{not valid json");
        var unknownShape = QuestionResponseGrader.Evaluate(qv, "{\"unrelatedField\":\"naloxone\"}");

        Assert.False(malformed.IsCorrect);
        Assert.False(unknownShape.IsCorrect);
    }

    [Fact]
    public void Evaluate_ShortAnswer_MissingExpectedAnswer_IsNotCorrect()
    {
        // A question version without any IsCorrect option has no grading key.
        var qv = NewVersion(QuestionType.ShortAnswer);
        qv.Options.Add(Opt(1, "naloxone", false));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"TextResponse\":\"naloxone\"}");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 6. OrderedResponse: DisplayOrder sequence is the key
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_OrderedResponse_FullSequence_IsCorrect()
    {
        var qv = NewVersion(QuestionType.OrderedResponse);
        var a = Opt(1, "Assess the airway", true, displayOrder: 1);
        var b = Opt(2, "Administer oxygen", true, displayOrder: 2);
        var c = Opt(3, "Notify the provider", true, displayOrder: 3);
        qv.Options.Add(a);
        qv.Options.Add(b);
        qv.Options.Add(c);

        var response = $"{{\"OrderedOptionIds\":[\"{a.Id}\",\"{b.Id}\",\"{c.Id}\"]}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_OrderedResponse_PartialSequence_GetsProportionalFraction()
    {
        var qv = NewVersion(QuestionType.OrderedResponse);
        var a = Opt(1, "Step one", true, displayOrder: 1);
        var b = Opt(2, "Step two", true, displayOrder: 2);
        var c = Opt(3, "Step three", true, displayOrder: 3);
        qv.Options.Add(a);
        qv.Options.Add(b);
        qv.Options.Add(c);

        // First position right, remaining positions wrong -> 1/3.
        var response = $"{{\"OrderedOptionIds\":[\"{a.Id}\",\"{c.Id}\",\"{b.Id}\"]}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.3333m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 7. Matching: even-index premises -> following option is the response
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_Matching_AllPairsCorrect_IsCorrect()
    {
        var qv = NewVersion(QuestionType.Matching);
        var p1 = Opt(0, "Premise one", false);
        var r1 = Opt(1, "Response one", false);
        var p2 = Opt(2, "Premise two", false);
        var r2 = Opt(3, "Response two", false);
        foreach (var o in new[] { p1, r1, p2, r2 }) qv.Options.Add(o);

        var response = $"{{\"Pairs\":{{\"{p1.Id}\":\"{r1.Id}\",\"{p2.Id}\":\"{r2.Id}\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_Matching_PartialPairs_GetsProportionalFraction()
    {
        var qv = NewVersion(QuestionType.Matching);
        var p1 = Opt(0, "Premise one", false);
        var r1 = Opt(1, "Response one", false);
        var p2 = Opt(2, "Premise two", false);
        var r2 = Opt(3, "Response two", false);
        foreach (var o in new[] { p1, r1, p2, r2 }) qv.Options.Add(o);

        // One pair matched of two -> 1/2.
        var response = $"{{\"Pairs\":{{\"{p1.Id}\":\"{r1.Id}\",\"{p2.Id}\":\"{r1.Id}\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.5m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 16. TabularResponse: SelectedOptionId references a correct option
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_TabularResponse_CorrectSelection_IsCorrect()
    {
        var qv = NewVersion(QuestionType.TabularResponse);
        qv.Options.Add(Opt(1, "Increasing trend", false));
        qv.Options.Add(Opt(2, "Decreasing trend", true));
        var correctId = qv.Options.Single(o => o.IsCorrect).Id;

        var result = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionId\":\"{correctId}\"}}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_TabularResponse_WrongSelection_IsNotCorrect()
    {
        var qv = NewVersion(QuestionType.TabularResponse);
        qv.Options.Add(Opt(1, "Increasing trend", false));
        qv.Options.Add(Opt(2, "Decreasing trend", true));
        var wrongId = qv.Options.Single(o => !o.IsCorrect).Id;

        var result = QuestionResponseGrader.Evaluate(qv, $"{{\"SelectedOptionId\":\"{wrongId}\"}}");

        Assert.False(result.IsCorrect);
        Assert.Equal(0m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 11. MultipleTrueFalse: ContentJsonData "CorrectTrueFalse" key
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_MultipleTrueFalse_WithKey_AllCorrect_IsCorrect()
    {
        var s1 = Opt(1, "Statement one", false);
        var s2 = Opt(2, "Statement two", false);
        var qv = NewVersion(QuestionType.MultipleTrueFalse,
            $"{{\"CorrectTrueFalse\":{{\"{s1.Id}\":\"True\",\"{s2.Id}\":\"False\"}}}}");
        qv.Options.Add(s1);
        qv.Options.Add(s2);

        var response = $"{{\"TrueFalseMap\":{{\"{s1.Id}\":\"True\",\"{s2.Id}\":\"False\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MultipleTrueFalse_WithKey_Partial_GetsProportionalFraction()
    {
        var s1 = Opt(1, "Statement one", false);
        var s2 = Opt(2, "Statement two", false);
        var qv = NewVersion(QuestionType.MultipleTrueFalse,
            $"{{\"CorrectTrueFalse\":{{\"{s1.Id}\":\"True\",\"{s2.Id}\":\"False\"}}}}");
        qv.Options.Add(s1);
        qv.Options.Add(s2);

        var response = $"{{\"TrueFalseMap\":{{\"{s1.Id}\":\"True\",\"{s2.Id}\":\"True\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.5m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MultipleTrueFalse_WithoutKey_LegacyCreditApplies()
    {
        var qv = NewVersion(QuestionType.MultipleTrueFalse);
        qv.Options.Add(Opt(1, "Statement one", false));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"TrueFalseMap\":{\"anything\":\"True\"}}");

        // Legacy policy: a substantive non-empty response earns credit.
        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 8. MatrixGrid: ContentJsonData "CorrectSelections" key
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_MatrixGrid_WithKey_AllRowsCorrect_IsCorrect()
    {
        var row1 = Opt(1, "Row one", false);
        var row2 = Opt(2, "Row two", false);
        var qv = NewVersion(QuestionType.MatrixGrid,
            $"{{\"CorrectSelections\":{{\"{row1.Id}\":\"col-a\",\"{row2.Id}\":\"col-b\"}}}}");
        qv.Options.Add(row1);
        qv.Options.Add(row2);

        var response = $"{{\"MatrixSelections\":{{\"{row1.Id}\":\"col-a\",\"{row2.Id}\":\"col-b\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MatrixGrid_WithKey_Partial_GetsProportionalFraction()
    {
        var row1 = Opt(1, "Row one", false);
        var row2 = Opt(2, "Row two", false);
        var qv = NewVersion(QuestionType.MatrixGrid,
            $"{{\"CorrectSelections\":{{\"{row1.Id}\":\"col-a\",\"{row2.Id}\":\"col-b\"}}}}");
        qv.Options.Add(row1);
        qv.Options.Add(row2);

        var response = $"{{\"MatrixSelections\":{{\"{row1.Id}\":\"col-a\",\"{row2.Id}\":\"col-a\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.5m, result.Fraction);
    }

    [Fact]
    public void Evaluate_MatrixGrid_WithoutKey_LegacyCreditApplies()
    {
        var qv = NewVersion(QuestionType.MatrixGrid);
        qv.Options.Add(Opt(1, "Row one", false));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"MatrixSelections\":{\"x\":\"col-a\"}}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 7/14. DragAndDrop: ContentJsonData "CorrectBuckets" key
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_DragAndDrop_WithKey_AllItemsCorrect_IsCorrect()
    {
        var item1 = Opt(1, "Item one", false);
        var item2 = Opt(2, "Item two", false);
        var qv = NewVersion(QuestionType.DragAndDrop,
            $"{{\"CorrectBuckets\":{{\"{item1.Id}\":\"bucket-a\",\"{item2.Id}\":\"bucket-b\"}}}}");
        qv.Options.Add(item1);
        qv.Options.Add(item2);

        var response = $"{{\"Buckets\":{{\"{item1.Id}\":\"bucket-a\",\"{item2.Id}\":\"bucket-b\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_DragAndDrop_WithKey_Partial_GetsProportionalFraction()
    {
        var item1 = Opt(1, "Item one", false);
        var item2 = Opt(2, "Item two", false);
        var qv = NewVersion(QuestionType.DragAndDrop,
            $"{{\"CorrectBuckets\":{{\"{item1.Id}\":\"bucket-a\",\"{item2.Id}\":\"bucket-b\"}}}}");
        qv.Options.Add(item1);
        qv.Options.Add(item2);

        var response = $"{{\"Buckets\":{{\"{item1.Id}\":\"bucket-a\",\"{item2.Id}\":\"bucket-a\"}}}}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.5m, result.Fraction);
    }

    [Fact]
    public void Evaluate_DragAndDrop_WithoutKey_LegacyCreditApplies()
    {
        var qv = NewVersion(QuestionType.DragAndDrop);
        qv.Options.Add(Opt(1, "Item one", false));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"Buckets\":{\"x\":\"bucket-a\"}}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 10 / 18. BowTie: CorrectActions + CorrectCondition + CorrectParameters
    // ---------------------------------------------------------------

    [Fact]
    public void Evaluate_BowTie_WithKey_AllFiveSlotsCorrect_IsCorrect()
    {
        var qv = NewVersion(QuestionType.BowTie,
            "{\"CorrectActions\":[\"act-1\",\"act-2\"],\"CorrectCondition\":\"cond-1\",\"CorrectParameters\":[\"par-1\",\"par-2\"]}");
        qv.Options.Add(Opt(1, "Action token", false));

        var response = "{\"Actions\":[\"act-1\",\"act-2\"],\"Condition\":\"cond-1\",\"Parameters\":[\"par-1\",\"par-2\"]}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Fact]
    public void Evaluate_BowTie_WithKey_Partial_GetsProportionalFraction()
    {
        var qv = NewVersion(QuestionType.BowTie,
            "{\"CorrectActions\":[\"act-1\",\"act-2\"],\"CorrectCondition\":\"cond-1\",\"CorrectParameters\":[\"par-1\",\"par-2\"]}");
        qv.Options.Add(Opt(1, "Action token", false));

        // One action slot wrong out of five -> 4/5.
        var response = "{\"Actions\":[\"act-1\",\"act-wrong\"],\"Condition\":\"cond-1\",\"Parameters\":[\"par-1\",\"par-2\"]}";
        var result = QuestionResponseGrader.Evaluate(qv, response);

        Assert.False(result.IsCorrect);
        Assert.Equal(0.8m, result.Fraction);
    }

    [Fact]
    public void Evaluate_BowTie_WithoutKey_LegacyCreditApplies()
    {
        var qv = NewVersion(QuestionType.BowTie);
        qv.Options.Add(Opt(1, "Action token", false));

        var result = QuestionResponseGrader.Evaluate(qv, "{\"Actions\":[\"a\"],\"Condition\":\"c\",\"Parameters\":[\"p\"]}");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    // ---------------------------------------------------------------
    // 9 / 15. ClinicalCaseStudy / ExtendedResponse: legacy policy retained
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(QuestionType.ClinicalCaseStudy)]
    [InlineData(QuestionType.ExtendedResponse)]
    public void Evaluate_FreeFormTypes_NonEmptyResponse_LegacyCredit(QuestionType type)
    {
        var qv = NewVersion(type);

        var result = QuestionResponseGrader.Evaluate(qv, "\"This is my clinical rationale response.\"");

        Assert.True(result.IsCorrect);
        Assert.Equal(1m, result.Fraction);
    }

    [Theory]
    [InlineData(QuestionType.ClinicalCaseStudy)]
    [InlineData(QuestionType.ExtendedResponse)]
    public void Evaluate_FreeFormTypes_EmptyPayload_NoCredit(QuestionType type)
    {
        var qv = NewVersion(type);

        foreach (var response in new[] { "{}", "[]", "null", "" })
        {
            var result = QuestionResponseGrader.Evaluate(qv, response);
            Assert.False(result.IsCorrect);
            Assert.Equal(0m, result.Fraction);
        }
    }
}
