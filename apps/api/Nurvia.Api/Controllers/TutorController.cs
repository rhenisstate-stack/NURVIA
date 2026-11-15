using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/tutor")]
public sealed class TutorController : ControllerBase
{
    private readonly ITutorChatService _service;

    public TutorController(ITutorChatService service)
    {
        _service = service;
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TutorChatSessionDto>>>> GetSessions(CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<TutorChatSessionDto>>.Error("Authentication is required."));

        var sessions = await _service.GetSessionsAsync(user.Id, ct);
        return Ok(ApiResponse<IReadOnlyList<TutorChatSessionDto>>.Ok(sessions));
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<ApiResponse<TutorChatSessionDto>>> CreateSession(
        [FromBody] CreateTutorSessionRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<TutorChatSessionDto>.Error("Authentication is required."));

        var (session, error) = await _service.CreateSessionAsync(user.Id, request, ct);
        if (error is not null || session is null)
            return BadRequest(ApiResponse<TutorChatSessionDto>.Error(error ?? "Unable to start tutor session."));

        return Ok(ApiResponse<TutorChatSessionDto>.Ok(session, "Tutor session created."));
    }

    [HttpGet("sessions/{id:guid}")]
    public async Task<ActionResult<ApiResponse<TutorChatSessionDto>>> GetSession(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<TutorChatSessionDto>.Error("Authentication is required."));

        var session = await _service.GetSessionAsync(user.Id, id, ct);
        if (session is null)
            return NotFound(ApiResponse<TutorChatSessionDto>.Error("Tutor session not found."));

        return Ok(ApiResponse<TutorChatSessionDto>.Ok(session));
    }

    [HttpPost("sessions/{id:guid}/messages")]
    public async Task<ActionResult<ApiResponse<TutorChatSessionDto>>> SendMessage(
        Guid id,
        [FromBody] SendTutorMessageRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<TutorChatSessionDto>.Error("Authentication is required."));

        var (session, error, notFound, providerUnavailable) = await _service.SendMessageAsync(user.Id, id, request.Message, ct);
        if (notFound)
            return NotFound(ApiResponse<TutorChatSessionDto>.Error(error ?? "Tutor session not found."));
        if (providerUnavailable)
            return StatusCode(503, ApiResponse<TutorChatSessionDto>.Error(error ?? "External AI provider is not configured."));
        if (error is not null || session is null)
            return BadRequest(ApiResponse<TutorChatSessionDto>.Error(error ?? "Unable to send message."));

        return Ok(ApiResponse<TutorChatSessionDto>.Ok(session));
    }

    [HttpDelete("sessions/{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteSession(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var deleted = await _service.DeleteSessionAsync(user.Id, id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Tutor session not found."));

        return Ok(ApiResponse<string>.Ok("Tutor session deleted."));
    }
}
