using System.Text;
using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/study-guides")]
public sealed class StudyGuidesController : ControllerBase
{
    private readonly IStudyGuidesService _service;

    public StudyGuidesController(IStudyGuidesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StudyGuideSummaryDto>>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? pathway = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var isStaff = HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin");
        var guides = await _service.GetGuidesAsync(isStaff, category, pathway, search, ct);
        return Ok(ApiResponse<IReadOnlyList<StudyGuideSummaryDto>>.Ok(guides));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StudyGuideDetailDto>>> GetById(Guid id, CancellationToken ct = default)
    {
        var isStaff = HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin");
        var guide = await _service.GetByIdAsync(id, isStaff, ct);
        if (guide is null)
            return NotFound(ApiResponse<StudyGuideDetailDto>.Error("Study guide not found."));

        return Ok(ApiResponse<StudyGuideDetailDto>.Ok(guide));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Sign in is required to download study guides."));

        var isStaff = HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin");
        var guide = await _service.GetByIdAsync(id, isStaff, ct);
        if (guide is null)
            return NotFound(ApiResponse<string>.Error("Study guide not found."));

        var safeFilename = $"{guide.Slug}.md";
        var bytes = Encoding.UTF8.GetBytes(guide.ContentMarkdown);
        return File(bytes, "text/markdown; charset=utf-8", safeFilename);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<StudyGuideDetailDto>>> Create(
        [FromBody] CreateStudyGuideRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<StudyGuideDetailDto>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Author", "Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<StudyGuideDetailDto>.Error("Author or administrator access is required."));

        var (guide, error) = await _service.CreateAsync(user.Id, request, ct);
        if (error is not null || guide is null)
            return BadRequest(ApiResponse<StudyGuideDetailDto>.Error(error ?? "Unable to create study guide."));

        return Ok(ApiResponse<StudyGuideDetailDto>.Ok(guide, "Study guide created."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<string>.Error("Administrator access is required."));

        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Study guide not found."));

        return Ok(ApiResponse<string>.Ok("Study guide deleted."));
    }
}
