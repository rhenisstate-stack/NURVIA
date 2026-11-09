using Nurvia.Domain.Common;
using Nurvia.Domain.Questions;

namespace Nurvia.Domain.Exams;

public class ExamQuestion : Entity
{
    public Guid ExamVersionId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid QuestionVersionId { get; set; }
    public int OrderIndex { get; set; }
    public int Points { get; set; } = 1;

    public ExamVersion? ExamVersion { get; set; }
    public Question? Question { get; set; }
    public QuestionVersion? QuestionVersion { get; set; }

    public ExamQuestion() { }

    public ExamQuestion(Guid examVersionId, Guid questionId, Guid questionVersionId, int orderIndex, int points = 1)
    {
        ExamVersionId = examVersionId;
        QuestionId = questionId;
        QuestionVersionId = questionVersionId;
        OrderIndex = orderIndex;
        Points = points;
    }
}
