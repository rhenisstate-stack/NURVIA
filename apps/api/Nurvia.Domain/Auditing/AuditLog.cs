using Nurvia.Domain.Common;

namespace Nurvia.Domain.Auditing;

public class AuditLog : Entity
{
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // e.g. "CreateQuestion", "PublishQuestion", "ApproveExam"
    public string ActorId { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public string ChangesSummary { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    public AuditLog() { }

    public AuditLog(string entityType, string entityId, string action, string actorId, string actorName, string actorRole, string changesSummary)
    {
        EntityType = entityType;
        EntityId = entityId;
        Action = action;
        ActorId = actorId;
        ActorName = actorName;
        ActorRole = actorRole;
        ChangesSummary = changesSummary;
        TimestampUtc = DateTime.UtcNow;
    }
}
