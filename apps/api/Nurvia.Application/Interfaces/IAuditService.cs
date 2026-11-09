namespace Nurvia.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string entityType, string entityId, string action, string actorId, string actorName, string actorRole, string changesSummary, CancellationToken ct = default);
}
