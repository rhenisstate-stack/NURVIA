using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;

namespace Nurvia.Domain.Questions;

public class QuestionExhibit : Entity
{
    public Guid QuestionVersionId { get; set; }
    public ExhibitType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    public QuestionVersion? QuestionVersion { get; set; }

    public QuestionExhibit() { }

    public QuestionExhibit(ExhibitType type, string title, string content, int displayOrder = 0)
    {
        Type = type;
        Title = title;
        Content = content;
        DisplayOrder = displayOrder;
    }
}
