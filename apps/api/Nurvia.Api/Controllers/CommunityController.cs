using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

public sealed record ToggleLikeResponse(bool Liked, int LikeCount);

[ApiController]
[Route("api/community")]
public sealed class CommunityController : ControllerBase
{
    private readonly ICommunityService _service;

    public CommunityController(ICommunityService service)
    {
        _service = service;
    }

    [HttpGet("posts")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CommunityPostDto>>>> GetPosts(
        [FromQuery] string? channelId = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        var posts = await _service.GetPostsAsync(user.IsAuthenticated ? user.Id : null, channelId, search, ct);
        return Ok(ApiResponse<IReadOnlyList<CommunityPostDto>>.Ok(posts));
    }

    [HttpGet("posts/{id:guid}")]
    public async Task<ActionResult<ApiResponse<CommunityPostDto>>> GetPost(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        var post = await _service.GetPostDetailAsync(user.IsAuthenticated ? user.Id : null, id, ct);
        if (post is null)
            return NotFound(ApiResponse<CommunityPostDto>.Error("Discussion post not found."));

        return Ok(ApiResponse<CommunityPostDto>.Ok(post));
    }

    [HttpPost("posts")]
    public async Task<ActionResult<ApiResponse<CommunityPostDto>>> CreatePost(
        [FromBody] CreateCommunityPostRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<CommunityPostDto>.Error("Authentication is required."));

        var (post, error) = await _service.CreatePostAsync(user.Id, user.Name, request, ct);
        if (error is not null || post is null)
            return BadRequest(ApiResponse<CommunityPostDto>.Error(error ?? "Unable to create discussion post."));

        return Ok(ApiResponse<CommunityPostDto>.Ok(post, "Discussion published."));
    }

    [HttpPost("posts/{id:guid}/replies")]
    public async Task<ActionResult<ApiResponse<CommunityReplyDto>>> AddReply(
        Guid id,
        [FromBody] CreateCommunityReplyRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<CommunityReplyDto>.Error("Authentication is required."));

        var (reply, error, notFound) = await _service.AddReplyAsync(user.Id, user.Name, id, request.Content, ct);
        if (notFound)
            return NotFound(ApiResponse<CommunityReplyDto>.Error(error ?? "Discussion post not found."));
        if (error is not null || reply is null)
            return BadRequest(ApiResponse<CommunityReplyDto>.Error(error ?? "Unable to post reply."));

        return Ok(ApiResponse<CommunityReplyDto>.Ok(reply, "Reply posted."));
    }

    [HttpPost("posts/{id:guid}/like")]
    public async Task<ActionResult<ApiResponse<ToggleLikeResponse>>> ToggleLike(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ToggleLikeResponse>.Error("Authentication is required."));

        var (liked, likeCount, notFound) = await _service.ToggleLikeAsync(user.Id, id, ct);
        if (notFound)
            return NotFound(ApiResponse<ToggleLikeResponse>.Error("Discussion post not found."));

        return Ok(ApiResponse<ToggleLikeResponse>.Ok(new ToggleLikeResponse(liked, likeCount)));
    }

    [HttpDelete("posts/{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeletePost(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var isAdmin = HttpContext.HasRole("Administrator", "Superadmin");
        var deleted = await _service.DeletePostAsync(user.Id, isAdmin, id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Discussion post not found or not authorized."));

        return Ok(ApiResponse<string>.Ok("Discussion deleted."));
    }
}
