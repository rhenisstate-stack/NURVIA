using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

public sealed record AdminSystemStatusDto(
    string Environment,
    string DatabaseStatus,
    int PendingMigrationsCount,
    string AiTutorProvider,
    string EmailDeliveryMode,
    DateTime CheckedAtUtc);

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminDashboardService _adminService;
    private readonly INurviaDbContext _db;
    private readonly IHostEnvironment _env;
    private readonly IEmailSender _emailSender;

    public AdminController(
        IAdminDashboardService adminService,
        INurviaDbContext db,
        IHostEnvironment env,
        IEmailSender emailSender)
    {
        _adminService = adminService;
        _db = db;
        _env = env;
        _emailSender = emailSender;
    }

    private ActionResult<ApiResponse<T>>? EnsureStaff<T>()
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<T>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Author", "Reviewer", "Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<T>.Error("Staff or administrator access is required."));

        return null;
    }

    private ActionResult<ApiResponse<T>>? EnsureAdmin<T>()
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<T>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<T>.Error("Administrator or Superadmin access is required."));

        return null;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<AdminOverviewDto>>> GetOverview(CancellationToken ct)
    {
        if (EnsureStaff<AdminOverviewDto>() is { } denied) return denied;
        var result = await _adminService.GetOverviewAsync(ct);
        return Ok(ApiResponse<AdminOverviewDto>.Ok(result));
    }

    [HttpGet("learners")]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminLearnerSummaryDto>>>> GetLearners(
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        if (EnsureAdmin<PagedResult<AdminLearnerSummaryDto>>() is { } denied) return denied;
        var result = await _adminService.GetLearnersAsync(search, pageNumber, pageSize, ct);
        return Ok(ApiResponse<PagedResult<AdminLearnerSummaryDto>>.Ok(result));
    }

    [HttpGet("question-types")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AdminQuestionTypeInfoDto>>>> GetQuestionTypes(CancellationToken ct)
    {
        if (EnsureStaff<IReadOnlyList<AdminQuestionTypeInfoDto>>() is { } denied) return denied;
        var result = await _adminService.GetQuestionTypesAsync(ct);
        return Ok(ApiResponse<IReadOnlyList<AdminQuestionTypeInfoDto>>.Ok(result));
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<ApiResponse<AdminAnalyticsDto>>> GetAnalytics(CancellationToken ct)
    {
        if (EnsureAdmin<AdminAnalyticsDto>() is { } denied) return denied;
        var result = await _adminService.GetAnalyticsAsync(ct);
        return Ok(ApiResponse<AdminAnalyticsDto>.Ok(result));
    }

    [HttpGet("taxonomy")]
    public async Task<ActionResult<ApiResponse<AdminTaxonomyDto>>> GetTaxonomy(CancellationToken ct)
    {
        if (EnsureStaff<AdminTaxonomyDto>() is { } denied) return denied;
        var result = await _adminService.GetTaxonomyAsync(ct);
        return Ok(ApiResponse<AdminTaxonomyDto>.Ok(result));
    }

    [HttpGet("system-status")]
    public async Task<ActionResult<ApiResponse<AdminSystemStatusDto>>> GetSystemStatus(CancellationToken ct)
    {
        if (EnsureAdmin<AdminSystemStatusDto>() is { } denied) return denied;

        var dbAvailable = false;
        var pendingMigrations = 0;
        if (_db is DbContext efContext)
        {
            dbAvailable = await efContext.Database.CanConnectAsync(ct);
            if (dbAvailable)
            {
                var pending = await efContext.Database.GetPendingMigrationsAsync(ct);
                pendingMigrations = pending.Count();
            }
        }

        var dto = new AdminSystemStatusDto(
            _env.EnvironmentName,
            dbAvailable ? "Available" : "Unavailable",
            pendingMigrations,
            "GroundedFallbackAiTutorProvider",
            _emailSender.GetType().Name,
            DateTime.UtcNow);

        return Ok(ApiResponse<AdminSystemStatusDto>.Ok(dto));
    }
}
