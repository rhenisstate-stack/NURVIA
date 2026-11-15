using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/care-plans")]
public sealed class CarePlansController : ControllerBase
{
    private readonly ICarePlansService _service;

    public CarePlansController(ICarePlansService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CarePlanDto>>>> GetAll(
        [FromQuery] string? specialty = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        var plans = await _service.GetCarePlansAsync(user.IsAuthenticated ? user.Id : null, specialty, search, ct);
        return Ok(ApiResponse<IReadOnlyList<CarePlanDto>>.Ok(plans));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CarePlanDto>>> Create(
        [FromBody] CreateCarePlanRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<CarePlanDto>.Error("Authentication is required."));

        var (plan, error) = await _service.CreateAsync(user.Id, request, ct);
        if (error is not null || plan is null)
            return BadRequest(ApiResponse<CarePlanDto>.Error(error ?? "Unable to create care plan."));

        return Ok(ApiResponse<CarePlanDto>.Ok(plan, "Care plan saved."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var deleted = await _service.DeleteAsync(user.Id, id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Personal care plan not found."));

        return Ok(ApiResponse<string>.Ok("Care plan deleted."));
    }
}
