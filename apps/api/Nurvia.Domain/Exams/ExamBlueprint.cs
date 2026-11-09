using Nurvia.Domain.Common;

namespace Nurvia.Domain.Exams;

public class ExamBlueprint : Entity
{
    public Guid ExamVersionId { get; set; }
    public int TargetQuestionCount { get; set; } = 50;
    public string? SubjectDistributionJson { get; set; }
    public string? CognitiveDistributionJson { get; set; }
    public string? DifficultyDistributionJson { get; set; }

    public ExamVersion? ExamVersion { get; set; }

    public ExamBlueprint() { }

    public ExamBlueprint(Guid examVersionId, int targetQuestionCount)
    {
        ExamVersionId = examVersionId;
        TargetQuestionCount = targetQuestionCount;
    }
}
