using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/flashcards")]
public sealed class FlashcardsController : ControllerBase
{
    private readonly IFlashcardsService _service;

    public FlashcardsController(IFlashcardsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FlashcardDto>>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] bool dueOnly = false,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<FlashcardDto>>.Error("Authentication is required."));

        var cards = await _service.GetFlashcardsAsync(user.Id, category, dueOnly, ct);
        return Ok(ApiResponse<IReadOnlyList<FlashcardDto>>.Ok(cards));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<FlashcardDto>>> Create(
        [FromBody] CreateFlashcardRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<FlashcardDto>.Error("Authentication is required."));

        var (card, error) = await _service.CreateAsync(user.Id, request, ct);
        if (error is not null || card is null)
            return BadRequest(ApiResponse<FlashcardDto>.Error(error ?? "Unable to create flashcard."));

        return Ok(ApiResponse<FlashcardDto>.Ok(card, "Flashcard created."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var deleted = await _service.DeleteAsync(user.Id, id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Personal flashcard not found."));

        return Ok(ApiResponse<string>.Ok("Flashcard deleted."));
    }

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<ApiResponse<FlashcardDto>>> Review(
        Guid id,
        [FromBody] ReviewFlashcardRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<FlashcardDto>.Error("Authentication is required."));

        var (card, error, notFound) = await _service.ReviewAsync(user.Id, id, request.Rating, ct);
        if (notFound)
            return NotFound(ApiResponse<FlashcardDto>.Error(error ?? "Flashcard not found."));
        if (error is not null || card is null)
            return BadRequest(ApiResponse<FlashcardDto>.Error(error ?? "Unable to record review."));

        return Ok(ApiResponse<FlashcardDto>.Ok(card, "Review scheduled."));
    }
}
