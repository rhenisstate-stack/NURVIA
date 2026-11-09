using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Auditing;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly INurviaDbContext _context;

    public AuditLogsController(INurviaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLog>>>> GetLogs(
        [FromQuery] string? entityType,
        [FromQuery] string? entityId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var query = _context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (!string.IsNullOrWhiteSpace(entityId))
            query = query.Where(a => a.EntityId == entityId);

        var total = await query.CountAsync(ct);

        var logs = await query
            .OrderByDescending(a => a.TimestampUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return Ok(ApiResponse<PagedResult<AuditLog>>.Ok(new PagedResult<AuditLog>(logs, total, pageNumber, pageSize)));
    }
}
