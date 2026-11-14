using System.Text.Json;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Questions;

/// <summary>
/// Authoritative, deterministic grading for every question type.
///
/// Returns whether a learner response matches the approved answer key and, through
/// <see cref="QuestionResponseGradingResult.Fraction"/>, the earned share (0–1) of
/// the question's points for multi-part question types.
///
/// Grading keys by question type:
///   - Single-answer types (MultipleChoice/SingleChoice, TrueFalse, ImageBased):
///     the selected option's IsCorrect flag.
///   - MultipleResponse (SATA) / MultipleImageSelection: exact set equality against
///     the options flagged correct (fraction reports the selected-correct ratio).
///   - NumericCalculation: decimal comparison with 0.01 tolerance against the
///     correct option's value.
///   - Cloze / ShortAnswer: case-insensitive text match against correct options.
///   - OrderedResponse: the submitted sequence must equal the options' DisplayOrder
///     sequence (options are authored in correct priority order).
///   - Matching: premises occupy even option positions; each premise's correct
///     response is the option directly following it.
///   - TabularResponse: the SelectedOptionId must reference a correct option.
///   - MultipleTrueFalse, MatrixGrid, DragAndDrop, BowTie: the approved key is read
///     from the question version's ContentJsonData ("CorrectTrueFalse",
///     "CorrectSelections", "CorrectBuckets", "CorrectActions" + "CorrectCondition"
///     + "CorrectParameters"). When an approved key is absent the legacy policy
///     applies (a non-empty response earns credit) so historical question content
///     is never silently re-scored as incorrect.
///   - ExtendedResponse / ClinicalCaseStudy: legacy policy retained (a non-empty
///     response earns credit); these types require human evaluation outside the
///     automated engine.
/// </summary>
public static class QuestionResponseGrader
{
    public static QuestionResponseGradingResult Evaluate(QuestionVersion qv, string? responseJson)
    {
        if (string.IsNullOrWhiteSpace(responseJson) || responseJson == "null")
            return new QuestionResponseGradingResult(false, 0m);

        try
        {
            switch (qv.QuestionType)
            {
                case QuestionType.MultipleChoice:
                case QuestionType.SingleChoice:
                case QuestionType.TrueFalse:
                case QuestionType.ImageBased:
                {
                    var selectedOpt = FindSelectedOption(qv.Options, responseJson);
                    var correct = selectedOpt?.IsCorrect == true;
                    return new QuestionResponseGradingResult(correct, correct ? 1m : 0m);
                }

                case QuestionType.MultipleResponse: // SATA
                case QuestionType.MultipleImageSelection:
                {
                    var chosenOpts = FindSelectedOptions(qv.Options, responseJson);
                    var correctOpts = qv.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                    var chosenIds = chosenOpts.Select(o => o.Id).ToHashSet();
                    if (chosenIds.Count == 0 || correctOpts.Count == 0)
                        return new QuestionResponseGradingResult(false, 0m);

                    var fraction = Math.Round((decimal)chosenIds.Count(id => correctOpts.Contains(id)) / correctOpts.Count, 4);
                    return new QuestionResponseGradingResult(chosenIds.SetEquals(correctOpts), fraction);
                }

                case QuestionType.NumericCalculation:
                {
                    var trimmedResponse = responseJson.Trim('"', ' ', '\'');
                    if (trimmedResponse.StartsWith("{"))
                    {
                        using var numDoc = JsonDocument.Parse(trimmedResponse);
                        if (numDoc.RootElement.TryGetProperty("NumericResponse", out var prop) ||
                            numDoc.RootElement.TryGetProperty("numericResponse", out prop) ||
                            numDoc.RootElement.TryGetProperty("value", out prop))
                        {
                            trimmedResponse = prop.ToString().Trim('"', ' ', '\'');
                        }
                    }
                    var targetOption = qv.Options.FirstOrDefault(o => o.IsCorrect)?.OptionText?.Trim();
                    bool numericCorrect;
                    if (targetOption != null && decimal.TryParse(targetOption, out var targetNum) && decimal.TryParse(trimmedResponse, out var candidateNum))
                    {
                        numericCorrect = Math.Abs(targetNum - candidateNum) < 0.01m;
                    }
                    else
                    {
                        numericCorrect = string.Equals(trimmedResponse, targetOption, StringComparison.OrdinalIgnoreCase);
                    }
                    return new QuestionResponseGradingResult(numericCorrect, numericCorrect ? 1m : 0m);
                }

                case QuestionType.Cloze:
                case QuestionType.ShortAnswer:
                {
                    string textResponse;
                    var trimmedText = responseJson.Trim('"', ' ', '\'');
                    if (trimmedText.StartsWith("{"))
                    {
                        // Parse before lowercasing: TryGetProperty is case-sensitive.
                        // "ShortAnswer"/"shortAnswer" are legacy payloads persisted by
                        // earlier renderer versions and remain gradable for in-flight
                        // attempts; new submissions use the canonical "TextResponse".
                        using var txtDoc = JsonDocument.Parse(trimmedText);
                        if (txtDoc.RootElement.TryGetProperty("TextResponse", out var tprop) ||
                            txtDoc.RootElement.TryGetProperty("textResponse", out tprop) ||
                            txtDoc.RootElement.TryGetProperty("ShortAnswer", out tprop) ||
                            txtDoc.RootElement.TryGetProperty("shortAnswer", out tprop) ||
                            txtDoc.RootElement.TryGetProperty("value", out tprop))
                        {
                            textResponse = tprop.GetString()?.Trim().ToLowerInvariant() ?? "";
                        }
                        else
                        {
                            textResponse = trimmedText.ToLowerInvariant();
                        }
                    }
                    else
                    {
                        textResponse = trimmedText.ToLowerInvariant();
                    }
                    var textCorrect = qv.Options.Any(o => o.IsCorrect && o.OptionText.Trim().ToLowerInvariant() == textResponse);
                    return new QuestionResponseGradingResult(textCorrect, textCorrect ? 1m : 0m);
                }

                case QuestionType.OrderedResponse:
                {
                    var orderedIds = ParseStringList(responseJson, "OrderedOptionIds", "orderedOptionIds");
                    var keyOrder = qv.Options.OrderBy(o => o.DisplayOrder).Select(o => o.Id.ToString()).ToList();
                    if (orderedIds.Count == 0 || keyOrder.Count == 0)
                        return new QuestionResponseGradingResult(false, 0m);

                    int positionalMatches = orderedIds
                        .Where((id, idx) => idx < keyOrder.Count && string.Equals(id, keyOrder[idx], StringComparison.OrdinalIgnoreCase))
                        .Count();
                    var fraction = Math.Round((decimal)positionalMatches / keyOrder.Count, 4);
                    return new QuestionResponseGradingResult(positionalMatches == keyOrder.Count && orderedIds.Count == keyOrder.Count, fraction);
                }

                case QuestionType.Matching:
                {
                    var pairs = ParseStringDictionary(responseJson, "Pairs", "pairs");
                    var options = qv.Options.OrderBy(o => o.OptionIndex).ToList();
                    if (pairs.Count == 0 || options.Count < 2)
                        return new QuestionResponseGradingResult(false, 0m);

                    // Canonical key: premises occupy the even option positions and each
                    // premise's correct response is the option directly following it.
                    int premises = options.Count / 2;
                    int correctPairs = 0;
                    for (int i = 0; i < premises; i++)
                    {
                        var premiseId = options[i * 2].Id.ToString();
                        var correctResponseId = options[i * 2 + 1].Id.ToString();
                        if (pairs.TryGetValue(premiseId, out var chosen) &&
                            string.Equals(chosen, correctResponseId, StringComparison.OrdinalIgnoreCase))
                        {
                            correctPairs++;
                        }
                    }
                    var fraction = Math.Round((decimal)correctPairs / premises, 4);
                    return new QuestionResponseGradingResult(correctPairs == premises, fraction);
                }

                case QuestionType.TabularResponse:
                {
                    var selectedOpt = FindSelectedOption(qv.Options, responseJson);
                    var correct = selectedOpt?.IsCorrect == true;
                    return new QuestionResponseGradingResult(correct, correct ? 1m : 0m);
                }

                case QuestionType.MultipleTrueFalse:
                {
                    var selections = ParseStringDictionary(responseJson, "TrueFalseMap", "trueFalseMap");
                    var key = ParseContentKeyMap(qv.ContentJsonData, "CorrectTrueFalse", "TrueFalseMap", "Correct");
                    if (key == null)
                        return LegacyCredit(responseJson);

                    int correctStatements = 0;
                    foreach (var (optionId, expected) in key)
                    {
                        if (selections.TryGetValue(optionId, out var chosen) &&
                            string.Equals(chosen, expected, StringComparison.OrdinalIgnoreCase))
                        {
                            correctStatements++;
                        }
                    }
                    var fraction = key.Count == 0 ? 0m : Math.Round((decimal)correctStatements / key.Count, 4);
                    return new QuestionResponseGradingResult(correctStatements == key.Count, fraction);
                }

                case QuestionType.MatrixGrid:
                {
                    var selections = ParseStringDictionary(responseJson, "MatrixSelections", "matrixSelections");
                    var key = ParseContentKeyMap(qv.ContentJsonData, "CorrectSelections", "MatrixSelections", "Correct");
                    if (key == null)
                        return LegacyCredit(responseJson);

                    int correctRows = 0;
                    foreach (var (rowId, expected) in key)
                    {
                        if (selections.TryGetValue(rowId, out var chosen) &&
                            string.Equals(chosen, expected, StringComparison.OrdinalIgnoreCase))
                        {
                            correctRows++;
                        }
                    }
                    var fraction = key.Count == 0 ? 0m : Math.Round((decimal)correctRows / key.Count, 4);
                    return new QuestionResponseGradingResult(correctRows == key.Count, fraction);
                }

                case QuestionType.DragAndDrop:
                {
                    var classifications = ParseStringDictionary(responseJson, "Buckets", "buckets");
                    var key = ParseContentKeyMap(qv.ContentJsonData, "CorrectBuckets", "Buckets", "Correct");
                    if (key == null)
                        return LegacyCredit(responseJson);

                    int correctItems = 0;
                    foreach (var (itemId, expected) in key)
                    {
                        if (classifications.TryGetValue(itemId, out var chosen) &&
                            string.Equals(chosen, expected, StringComparison.OrdinalIgnoreCase))
                        {
                            correctItems++;
                        }
                    }
                    var fraction = key.Count == 0 ? 0m : Math.Round((decimal)correctItems / key.Count, 4);
                    return new QuestionResponseGradingResult(correctItems == key.Count, fraction);
                }

                case QuestionType.BowTie: // Also DynamicLabBowTie (same enum value)
                {
                    var parsed = ParseJsonObject(responseJson);
                    var key = ParseJsonObject(qv.ContentJsonData);
                    var keyActions = GetStringList(key, "CorrectActions", "correctActions") ?? new List<string>();
                    var keyCondition = GetSingleString(key, "CorrectCondition", "correctCondition");
                    var keyParameters = GetStringList(key, "CorrectParameters", "correctParameters") ?? new List<string>();

                    if (keyActions.Count == 0 && string.IsNullOrEmpty(keyCondition) && keyParameters.Count == 0)
                        return LegacyCredit(responseJson); // No approved key authored: legacy policy.

                    const int totalSlots = 5; // 2 actions + 1 condition + 2 parameters
                    int correctSlots = 0;

                    var learnerActions = GetStringList(parsed, "Actions", "actions") ?? new List<string>();
                    correctSlots += learnerActions.Count(id => keyActions.Contains(id, StringComparer.OrdinalIgnoreCase))
                                  - Math.Max(0, learnerActions.Count - keyActions.Count);

                    var learnerCondition = GetSingleString(parsed, "Condition", "condition");
                    if (!string.IsNullOrEmpty(keyCondition) &&
                        string.Equals(learnerCondition, keyCondition, StringComparison.OrdinalIgnoreCase))
                    {
                        correctSlots++;
                    }

                    var learnerParameters = GetStringList(parsed, "Parameters", "parameters") ?? new List<string>();
                    correctSlots += learnerParameters.Count(id => keyParameters.Contains(id, StringComparer.OrdinalIgnoreCase))
                                  - Math.Max(0, learnerParameters.Count - keyParameters.Count);

                    correctSlots = Math.Max(0, correctSlots);
                    var fraction = Math.Round((decimal)correctSlots / totalSlots, 4);
                    return new QuestionResponseGradingResult(correctSlots == totalSlots, fraction);
                }

                default:
                    // Extended Response, Clinical Case Study, and any future type keep
                    // the legacy policy: a non-empty response earns credit and requires
                    // human/AI-assisted evaluation outside the automated engine.
                    return LegacyCredit(responseJson);
            }
        }
        catch
        {
            return new QuestionResponseGradingResult(false, 0m);
        }
    }

    public readonly record struct QuestionResponseGradingResult(bool IsCorrect, decimal Fraction);

    /// <summary>Legacy scoring policy: any substantive non-empty response earns full credit.</summary>
    private static QuestionResponseGradingResult LegacyCredit(string? responseJson)
    {
        var full = !string.IsNullOrWhiteSpace(responseJson) && responseJson != "[]" && responseJson != "{}";
        return new QuestionResponseGradingResult(full, full ? 1m : 0m);
    }

    /// <summary>Reads a string-to-string key map from the approved ContentJsonData; null when no key was authored.</summary>
    private static Dictionary<string, string>? ParseContentKeyMap(string? contentJsonData, params string[] propertyNames)
    {
        if (string.IsNullOrWhiteSpace(contentJsonData))
            return null;

        try
        {
            using var doc = JsonDocument.Parse(contentJsonData);
            foreach (var name in propertyNames)
            {
                if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty(name, out var prop) &&
                    prop.ValueKind == JsonValueKind.Object)
                {
                    var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var item in prop.EnumerateObject())
                    {
                        map[item.Name] = item.Value.ValueKind == JsonValueKind.String
                            ? item.Value.GetString() ?? ""
                            : item.Value.ToString();
                    }
                    return map;
                }
            }
        }
        catch
        {
            return null;
        }

        return null;
    }

    private static Dictionary<string, string> ParseStringDictionary(string responseJson, params string[] propertyNames)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        using var doc = JsonDocument.Parse(responseJson.Trim());
        if (doc.RootElement.ValueKind != JsonValueKind.Object)
            return result;

        foreach (var name in propertyNames)
        {
            if (doc.RootElement.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Object)
            {
                foreach (var item in prop.EnumerateObject())
                {
                    result[item.Name] = item.Value.ValueKind == JsonValueKind.String
                        ? item.Value.GetString() ?? ""
                        : item.Value.ToString();
                }
                break;
            }
        }
        return result;
    }

    private static List<string> ParseStringList(string responseJson, params string[] propertyNames)
    {
        var result = new List<string>();
        using var doc = JsonDocument.Parse(responseJson.Trim());
        if (doc.RootElement.ValueKind != JsonValueKind.Object)
            return result;

        foreach (var name in propertyNames)
        {
            if (doc.RootElement.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in prop.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                        result.Add(item.GetString() ?? "");
                    else
                        result.Add(item.ToString());
                }
                break;
            }
        }
        return result;
    }

    private static JsonElement ParseJsonObject(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return default;
        using var doc = JsonDocument.Parse(json.Trim());
        return doc.RootElement.Clone();
    }

    private static List<string>? GetStringList(JsonElement obj, params string[] propertyNames)
    {
        if (obj.ValueKind != JsonValueKind.Object)
            return null;
        foreach (var name in propertyNames)
        {
            if (obj.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                var list = new List<string>();
                foreach (var item in prop.EnumerateArray())
                {
                    list.Add(item.ValueKind == JsonValueKind.String ? item.GetString() ?? "" : item.ToString());
                }
                return list;
            }
        }
        return null;
    }

    private static string? GetSingleString(JsonElement obj, params string[] propertyNames)
    {
        if (obj.ValueKind != JsonValueKind.Object)
            return null;
        foreach (var name in propertyNames)
        {
            if (obj.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
                return prop.GetString();
        }
        return null;
    }

    private static QuestionOption? FindSelectedOption(IEnumerable<QuestionOption> options, string responseJson)
    {
        var trimmed = responseJson.Trim();

        // 1. Direct integer (OptionIndex)
        if (int.TryParse(trimmed, out var intIdx))
            return options.FirstOrDefault(o => o.OptionIndex == intIdx);

        // 2. Direct Guid (Option ID)
        if (Guid.TryParse(trimmed.Trim('"'), out var guidId))
            return options.FirstOrDefault(o => o.Id == guidId);

        // 3. JSON Document
        using var doc = JsonDocument.Parse(trimmed);
        if (doc.RootElement.ValueKind == JsonValueKind.Number)
        {
            var idx = doc.RootElement.GetInt32();
            return options.FirstOrDefault(o => o.OptionIndex == idx);
        }

        if (doc.RootElement.ValueKind == JsonValueKind.String)
        {
            var str = doc.RootElement.GetString()?.Trim();
            if (Guid.TryParse(str, out var g))
                return options.FirstOrDefault(o => o.Id == g);
            if (int.TryParse(str, out var parsedIdx))
                return options.FirstOrDefault(o => o.OptionIndex == parsedIdx);
            return options.FirstOrDefault(o => string.Equals(o.OptionText, str, StringComparison.OrdinalIgnoreCase));
        }

        if (doc.RootElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var propName in new[] { "SelectedOptionId", "selectedOptionId", "OptionId", "optionId" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p))
                {
                    if (p.ValueKind == JsonValueKind.String && Guid.TryParse(p.GetString(), out var g))
                        return options.FirstOrDefault(o => o.Id == g);
                    if (p.ValueKind == JsonValueKind.Number)
                    {
                        var idx = p.GetInt32();
                        return options.FirstOrDefault(o => o.OptionIndex == idx);
                    }
                }
            }

            foreach (var propName in new[] { "OptionIndex", "optionIndex", "SelectedOptionIndex", "selectedOptionIndex", "value", "Value" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p))
                {
                    if (p.ValueKind == JsonValueKind.Number)
                    {
                        var idx = p.GetInt32();
                        return options.FirstOrDefault(o => o.OptionIndex == idx);
                    }
                    if (p.ValueKind == JsonValueKind.String && int.TryParse(p.GetString(), out var parsedIdx))
                        return options.FirstOrDefault(o => o.OptionIndex == parsedIdx);
                }
            }
        }

        return null;
    }

    private static List<QuestionOption> FindSelectedOptions(IEnumerable<QuestionOption> options, string responseJson)
    {
        var result = new List<QuestionOption>();
        var trimmed = responseJson.Trim();

        using var doc = JsonDocument.Parse(trimmed);
        JsonElement arrayEl = default;

        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
            arrayEl = doc.RootElement;
        }
        else if (doc.RootElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var propName in new[] { "SelectedOptionIds", "selectedOptionIds", "OptionIds", "optionIds", "SelectedIndices", "selectedIndices", "values", "Values" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p) && p.ValueKind == JsonValueKind.Array)
                {
                    arrayEl = p;
                    break;
                }
            }
        }

        if (arrayEl.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in arrayEl.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Number)
                {
                    var idx = item.GetInt32();
                    var opt = options.FirstOrDefault(o => o.OptionIndex == idx);
                    if (opt != null) result.Add(opt);
                }
                else if (item.ValueKind == JsonValueKind.String)
                {
                    var str = item.GetString()?.Trim();
                    if (Guid.TryParse(str, out var g))
                    {
                        var opt = options.FirstOrDefault(o => o.Id == g);
                        if (opt != null) result.Add(opt);
                    }
                    else if (int.TryParse(str, out var idx))
                    {
                        var opt = options.FirstOrDefault(o => o.OptionIndex == idx);
                        if (opt != null) result.Add(opt);
                    }
                }
            }

            return result;
        }

        // Backward compatibility: payloads persisted by the earlier single-selection
        // renderer carry one scalar identifier ({"SelectedOptionId":"<id>"}). They are
        // treated as a one-element selection. Any other object shape (including the
        // canonical property holding a non-array value) yields no selections and is
        // graded incorrect rather than being silently credited.
        foreach (var propName in new[] { "SelectedOptionId", "selectedOptionId" })
        {
            if (doc.RootElement.TryGetProperty(propName, out var scalar) &&
                scalar.ValueKind == JsonValueKind.String)
            {
                var str = scalar.GetString()?.Trim();
                if (Guid.TryParse(str, out var legacyGuid))
                {
                    var opt = options.FirstOrDefault(o => o.Id == legacyGuid);
                    if (opt != null) result.Add(opt);
                }
                else if (int.TryParse(str, out var legacyIdx))
                {
                    var opt = options.FirstOrDefault(o => o.OptionIndex == legacyIdx);
                    if (opt != null) result.Add(opt);
                }

                break;
            }
        }

        return result;
    }
}
