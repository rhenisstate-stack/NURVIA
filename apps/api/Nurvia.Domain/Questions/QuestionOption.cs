using Nurvia.Domain.Common;

namespace Nurvia.Domain.Questions;

public class QuestionOption : Entity
{
    public Guid QuestionVersionId { get; set; }
    public int OptionIndex { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? SpecificRationale { get; set; }
    public int DisplayOrder { get; set; }

    public QuestionVersion? QuestionVersion { get; set; }

    public QuestionOption() { }

    public QuestionOption(int optionIndex, string optionText, bool isCorrect, string? specificRationale = null, int displayOrder = 0)
    {
        OptionIndex = optionIndex;
        OptionText = optionText;
        IsCorrect = isCorrect;
        SpecificRationale = specificRationale;
        DisplayOrder = displayOrder;
    }
}
