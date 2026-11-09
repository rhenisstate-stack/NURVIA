using Nurvia.Application.Interfaces;
using Nurvia.Domain.Auditing;

namespace Nurvia.Application.Services;

public class AuditService : IAuditService
{
    private readonly INurviaDbContext _context;

    public AuditService(INurviaDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string entityType, string entityId, string action, string actorId, string actorName, string actorRole, string changesSummary, CancellationToken ct = default)
    {
        var log = new AuditLog(entityType, entityId, action, actorId, actorName, actorRole, changesSummary);
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(ct);
    }
}
