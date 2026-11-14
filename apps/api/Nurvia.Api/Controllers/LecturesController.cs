using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Lectures;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/lectures")]
public class LecturesController : ControllerBase
{
    private readonly ILectureService _lectureService;

    public LecturesController(ILectureService lectureService)
    {
        _lectureService = lectureService;
    }

    // -----------------------------------------------------
    // PUBLIC CATALOGUE
    // GET /api/lectures
    // -----------------------------------------------------

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LectureCatalogueItemDto>>>> GetCatalogue(
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        var result = await _lectureService.GetPublishedCatalogueAsync(user, ct);

        return Ok(ApiResponse<IReadOnlyList<LectureCatalogueItemDto>>.Ok(
            result,
            "Published lecture catalogue retrieved successfully."));
    }

    // -----------------------------------------------------
    // INDIVIDUAL PUBLISHED LECTURE
    // GET /api/lectures/{slug}
    //
    // Access is enforced by LectureService.
    // Public lectures are available anonymously.
    // Protected lectures require an authenticated user
    // with an allowed learner/staff role.
    // -----------------------------------------------------

    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<LectureContentDto>>> GetPublishedLecture(
        string slug,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        try
        {
            var result = await _lectureService.GetPublishedBySlugAsync(
                slug,
                user,
                ct);

            if (result == null)
            {
                return NotFound(
                    ApiResponse<LectureContentDto>.Error(
                        $"Published lecture '{slug}' was not found."));
            }

            return Ok(ApiResponse<LectureContentDto>.Ok(
                result,
                "Lecture retrieved successfully."));
        }
        catch (UnauthorizedAccessException ex)
        {
            if (!user.IsAuthenticated)
            {
                return Unauthorized(
                    ApiResponse<LectureContentDto>.Error(ex.Message));
            }

            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureContentDto>.Error(ex.Message));
        }
    }

    // -----------------------------------------------------
    // CONTENT MANAGEMENT READ ENDPOINTS
    // -----------------------------------------------------

    [HttpGet("management")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LectureManagementDto>>>> GetManagementLectures(
        CancellationToken ct)
    {
        if (!HttpContext.GetCurrentUser().IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<IReadOnlyList<LectureManagementDto>>.Error(
                    "Authentication is required to access lecture management."));
        }

        if (!CanManageContent())
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<IReadOnlyList<LectureManagementDto>>.Error(
                    "You do not have permission to manage lecture content."));
        }

        var result = await _lectureService.GetAllForManagementAsync(ct);

        return Ok(ApiResponse<IReadOnlyList<LectureManagementDto>>.Ok(
            result,
            "Lecture management records retrieved successfully."));
    }

    [HttpGet("management/{id:guid}", Name = "GetLectureManagementById")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> GetManagementLecture(
        Guid id,
        CancellationToken ct)
    {
        if (!HttpContext.GetCurrentUser().IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to access lecture management."));
        }

        if (!CanManageContent())
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "You do not have permission to manage lecture content."));
        }

        var result = await _lectureService.GetByIdForManagementAsync(id, ct);

        if (result == null)
        {
            return NotFound(
                ApiResponse<LectureManagementDto>.Error(
                    $"Lecture with ID '{id}' was not found."));
        }

        return Ok(ApiResponse<LectureManagementDto>.Ok(result));
    }

    // -----------------------------------------------------
    // AUTHORING
    // -----------------------------------------------------

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> CreateDraft(
        [FromBody] CreateLectureRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to create lecture drafts."));
        }

        if (!HttpContext.HasRole("Author", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Authors and Administrators can create lecture drafts."));
        }

        try
        {
            var result = await _lectureService.CreateDraftAsync(
                request,
                user.Name,
                ct);

            return CreatedAtRoute(
                "GetLectureManagementById",
                new { id = result.Id },
                ApiResponse<LectureManagementDto>.Ok(
                    result,
                    "Lecture draft created successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> UpdateDraft(
        Guid id,
        [FromBody] UpdateLectureRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to edit lecture drafts."));
        }

        if (!HttpContext.HasRole("Author", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Authors and Administrators can edit lecture drafts."));
        }

        try
        {
            var result = await _lectureService.UpdateDraftAsync(
                id,
                request,
                user.Name,
                ct);

            return Ok(ApiResponse<LectureManagementDto>.Ok(
                result,
                "Lecture draft updated successfully."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(
                    ApiResponse<LectureManagementDto>.Error(ex.Message));
            }

            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/submit-for-review")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> SubmitForReview(
        Guid id,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to submit lectures for review."));
        }

        if (!HttpContext.HasRole("Author", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Authors and Administrators can submit lectures for review."));
        }

        try
        {
            var result = await _lectureService.SubmitForReviewAsync(
                id,
                user.Name,
                ct);

            return Ok(ApiResponse<LectureManagementDto>.Ok(
                result,
                "Lecture submitted for review successfully."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(
                    ApiResponse<LectureManagementDto>.Error(ex.Message));
            }

            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    // -----------------------------------------------------
    // REVIEW
    // -----------------------------------------------------

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> Review(
        Guid id,
        [FromBody] ReviewLectureRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to review lectures."));
        }

        if (!HttpContext.HasRole("Reviewer", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Reviewers and Administrators can review lectures."));
        }

        try
        {
            var result = await _lectureService.ReviewAsync(
                id,
                request,
                user.Id,
                user.Name,
                ct);

            return Ok(ApiResponse<LectureManagementDto>.Ok(
                result,
                $"Lecture review recorded as {request.Decision}."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(
                    ApiResponse<LectureManagementDto>.Error(ex.Message));
            }

            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    // -----------------------------------------------------
    // PUBLISH
    // -----------------------------------------------------

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> Publish(
        Guid id,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to publish lectures."));
        }

        if (!HttpContext.HasRole("Publisher", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Publishers and Administrators can publish lectures."));
        }

        try
        {
            var result = await _lectureService.PublishAsync(
                id,
                user.Name,
                ct);

            return Ok(ApiResponse<LectureManagementDto>.Ok(
                result,
                "Lecture published successfully."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(
                    ApiResponse<LectureManagementDto>.Error(ex.Message));
            }

            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    // -----------------------------------------------------
    // ARCHIVE
    // -----------------------------------------------------

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<ApiResponse<LectureManagementDto>>> Archive(
        Guid id,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();

        if (!user.IsAuthenticated)
        {
            return Unauthorized(
                ApiResponse<LectureManagementDto>.Error(
                    "Authentication is required to archive lectures."));
        }

        if (!HttpContext.HasRole("Publisher", "Administrator"))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<LectureManagementDto>.Error(
                    "Only Publishers and Administrators can archive lectures."));
        }

        try
        {
            var result = await _lectureService.ArchiveAsync(
                id,
                user.Name,
                ct);

            return Ok(ApiResponse<LectureManagementDto>.Ok(
                result,
                "Lecture archived successfully."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(
                    ApiResponse<LectureManagementDto>.Error(ex.Message));
            }

            return BadRequest(
                ApiResponse<LectureManagementDto>.Error(ex.Message));
        }
    }

    // -----------------------------------------------------
    // SHARED AUTHORIZATION HELPER
    // -----------------------------------------------------

    private bool CanManageContent()
    {
        return HttpContext.HasRole(
            "Author",
            "Reviewer",
            "Publisher",
            "Administrator",
            "Superadmin");
    }
}
