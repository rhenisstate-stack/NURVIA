using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.StudyLibrary;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/study-library")]
public class StudyLibraryController : ControllerBase
{
    private readonly IStudyLibraryService _studyLibraryService;
    private readonly IMemoryCache _cache;

    private const string FiltersCacheKey = "study_library:filters";
    private const string SummaryCacheKey = "study_library:summary";

    public StudyLibraryController(IStudyLibraryService studyLibraryService, IMemoryCache cache)
    {
        _studyLibraryService = studyLibraryService;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<StudySetCardDto>>>> GetCatalog(
        [FromQuery] StudyLibraryFilterRequest filter,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        var learnerId = user.IsAuthenticated ? user.Id : null;

        if (filter.SavedOnly && !user.IsAuthenticated)
            return Unauthorized(ApiResponse<PagedResult<StudySetCardDto>>.Error("Authentication is required to view saved study sets."));

        var result = await _studyLibraryService.GetCatalogAsync(filter, learnerId, ct);
        return Ok(ApiResponse<PagedResult<StudySetCardDto>>.Ok(result));
    }

    [HttpGet("filters")]
    public async Task<ActionResult<ApiResponse<StudyLibraryFiltersDto>>> GetFilters(CancellationToken ct)
    {
        var result = await _cache.GetOrCreateAsync(FiltersCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
            return await _studyLibraryService.GetFiltersAsync(ct);
        });

        return Ok(ApiResponse<StudyLibraryFiltersDto>.Ok(result!));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<StudyLibrarySummaryDto>>> GetSummary(CancellationToken ct)
    {
        var result = await _cache.GetOrCreateAsync(SummaryCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
            return await _studyLibraryService.GetSummaryAsync(ct);
        });

        return Ok(ApiResponse<StudyLibrarySummaryDto>.Ok(result!));
    }

    [HttpGet("{examId:guid}")]
    public async Task<ActionResult<ApiResponse<StudySetDetailDto>>> GetDetail(Guid examId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        var learnerId = user.IsAuthenticated ? user.Id : null;

        var detail = await _studyLibraryService.GetStudySetDetailAsync(examId, learnerId, ct);
        if (detail == null)
            return NotFound(ApiResponse<StudySetDetailDto>.Error("Published study set not found."));

        return Ok(ApiResponse<StudySetDetailDto>.Ok(detail));
    }

    [HttpGet("saved")]
    public async Task<ActionResult<ApiResponse<List<StudySetCardDto>>>> GetSaved(CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<List<StudySetCardDto>>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Learner", "Superadmin"))
            return Forbid();

        var saved = await _studyLibraryService.GetSavedStudySetsAsync(user.Id, ct);
        return Ok(ApiResponse<List<StudySetCardDto>>.Ok(saved));
    }

    [HttpPost("saved/{examId:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> SaveStudySet(Guid examId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Learner", "Superadmin"))
            return Forbid();

        try
        {
            await _studyLibraryService.SaveStudySetAsync(examId, user.Id, ct);
            return Ok(ApiResponse<string>.Ok("Saved", "Study set saved to your personal library."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<string>.Error(ex.Message));
        }
    }

    [HttpDelete("saved/{examId:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> RemoveSavedStudySet(Guid examId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Learner", "Superadmin"))
            return Forbid();

        await _studyLibraryService.RemoveSavedStudySetAsync(examId, user.Id, ct);
        return Ok(ApiResponse<string>.Ok("Removed", "Study set removed from your personal library."));
    }

    [HttpGet("{examId:guid}/reviews")]
    public async Task<ActionResult<ApiResponse<PagedResult<ExamReviewDto>>>> GetReviews(
        Guid examId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var reviews = await _studyLibraryService.GetReviewsAsync(examId, pageNumber, pageSize, ct);
        return Ok(ApiResponse<PagedResult<ExamReviewDto>>.Ok(reviews));
    }

    [HttpPost("{examId:guid}/reviews")]
    public async Task<ActionResult<ApiResponse<ExamReviewDto>>> SubmitReview(
        Guid examId,
        [FromBody] SubmitExamReviewRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamReviewDto>.Error("Authentication is required."));

        if (!HttpContext.HasRole("Learner", "Superadmin"))
            return Forbid();

        try
        {
            var review = await _studyLibraryService.SubmitReviewAsync(examId, user.Id, user.Name, request, ct);
            return Ok(ApiResponse<ExamReviewDto>.Ok(review, "Review submitted successfully."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<ExamReviewDto>.Error(ex.Message));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamReviewDto>.Error(ex.Message));
        }
    }
}
