using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Community;

namespace Nurvia.Application.Services;

public sealed record CommunityReplyDto(
    Guid Id,
    Guid PostId,
    string AuthorName,
    string Content,
    bool IsOwnedByCaller,
    DateTime CreatedAtUtc);

public sealed record CommunityPostDto(
    Guid Id,
    string ChannelId,
    string ChannelName,
    string AuthorName,
    string CohortLabel,
    string Title,
    string Content,
    int ReplyCount,
    int LikeCount,
    bool LikedByCaller,
    bool IsOwnedByCaller,
    DateTime CreatedAtUtc,
    IReadOnlyList<CommunityReplyDto>? Replies = null);

public sealed record CreateCommunityPostRequest(
    string ChannelId,
    string CohortLabel,
    string Title,
    string Content);

public sealed record CreateCommunityReplyRequest(string Content);

public interface ICommunityService
{
    Task<IReadOnlyList<CommunityPostDto>> GetPostsAsync(string? callerUserId, string? channelId, string? search, CancellationToken ct = default);
    Task<CommunityPostDto?> GetPostDetailAsync(string? callerUserId, Guid postId, CancellationToken ct = default);
    Task<(CommunityPostDto? Post, string? Error)> CreatePostAsync(string userId, string userName, CreateCommunityPostRequest request, CancellationToken ct = default);
    Task<(CommunityReplyDto? Reply, string? Error, bool NotFound)> AddReplyAsync(string userId, string userName, Guid postId, string content, CancellationToken ct = default);
    Task<(bool Liked, int LikeCount, bool NotFound)> ToggleLikeAsync(string userId, Guid postId, CancellationToken ct = default);
    Task<bool> DeletePostAsync(string userId, bool isAdmin, Guid postId, CancellationToken ct = default);
}

public class CommunityService : ICommunityService
{
    private static readonly Dictionary<string, string> Channels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["nclex-cohorts"] = "NCLEX 2026 Test-Taker Cohorts",
        ["ati-hesi-debriefs"] = "ATI & HESI Specialty Debriefs",
        ["clinical-cases"] = "NGN Unfolding Case Study Debriefs",
        ["wellness-support"] = "Nursing School Resilience & Mental Health"
    };

    private readonly INurviaDbContext _db;

    public CommunityService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CommunityPostDto>> GetPostsAsync(
        string? callerUserId,
        string? channelId,
        string? search,
        CancellationToken ct = default)
    {
        var query = _db.CommunityPosts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(channelId) && !string.Equals(channelId, "all", StringComparison.OrdinalIgnoreCase))
        {
            var cid = channelId.Trim().ToLower();
            query = query.Where(p => p.ChannelId.ToLower() == cid);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(term) ||
                p.Content.ToLower().Contains(term) ||
                p.ChannelName.ToLower().Contains(term));
        }

        var posts = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Take(50)
            .ToListAsync(ct);

        var postIds = posts.Select(p => p.Id).ToList();
        var replyCounts = await _db.CommunityReplies
            .AsNoTracking()
            .Where(r => postIds.Contains(r.PostId))
            .GroupBy(r => r.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, ct);

        var likeCounts = await _db.CommunityPostLikes
            .AsNoTracking()
            .Where(l => postIds.Contains(l.PostId))
            .GroupBy(l => l.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, ct);

        var callerLikes = string.IsNullOrEmpty(callerUserId)
            ? new HashSet<Guid>()
            : (await _db.CommunityPostLikes
                .AsNoTracking()
                .Where(l => l.UserId == callerUserId && postIds.Contains(l.PostId))
                .Select(l => l.PostId)
                .ToListAsync(ct)).ToHashSet();

        return posts.Select(p => new CommunityPostDto(
            p.Id,
            p.ChannelId,
            p.ChannelName,
            p.AuthorName,
            p.CohortLabel,
            p.Title,
            p.Content,
            replyCounts.GetValueOrDefault(p.Id, 0),
            likeCounts.GetValueOrDefault(p.Id, 0),
            callerLikes.Contains(p.Id),
            callerUserId != null && p.AuthorUserId == callerUserId,
            p.CreatedAtUtc)).ToList();
    }

    public async Task<CommunityPostDto?> GetPostDetailAsync(string? callerUserId, Guid postId, CancellationToken ct = default)
    {
        var p = await _db.CommunityPosts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == postId, ct);
        if (p is null) return null;

        var replies = await _db.CommunityReplies
            .AsNoTracking()
            .Where(r => r.PostId == postId)
            .OrderBy(r => r.CreatedAtUtc)
            .Select(r => new CommunityReplyDto(
                r.Id, r.PostId, r.AuthorName, r.Content,
                callerUserId != null && r.AuthorUserId == callerUserId,
                r.CreatedAtUtc))
            .ToListAsync(ct);

        var likeCount = await _db.CommunityPostLikes.CountAsync(l => l.PostId == postId, ct);
        var liked = callerUserId != null && await _db.CommunityPostLikes.AnyAsync(l => l.PostId == postId && l.UserId == callerUserId, ct);

        return new CommunityPostDto(
            p.Id, p.ChannelId, p.ChannelName, p.AuthorName, p.CohortLabel,
            p.Title, p.Content, replies.Count, likeCount, liked,
            callerUserId != null && p.AuthorUserId == callerUserId,
            p.CreatedAtUtc, replies);
    }

    public async Task<(CommunityPostDto? Post, string? Error)> CreatePostAsync(
        string userId,
        string userName,
        CreateCommunityPostRequest request,
        CancellationToken ct = default)
    {
        var title = request.Title?.Trim() ?? string.Empty;
        var content = request.Content?.Trim() ?? string.Empty;
        if (title.Length < 4 || title.Length > 240)
            return (null, "Discussion title must be between 4 and 240 characters.");
        if (content.Length < 10 || content.Length > 4000)
            return (null, "Discussion content must be between 10 and 4000 characters.");

        var channelId = Channels.ContainsKey(request.ChannelId ?? string.Empty)
            ? request.ChannelId!.Trim().ToLowerInvariant()
            : "nclex-cohorts";

        var post = new CommunityPost
        {
            ChannelId = channelId,
            ChannelName = Channels[channelId],
            AuthorUserId = userId,
            AuthorName = string.IsNullOrWhiteSpace(userName) ? "Nursing Learner" : userName.Trim(),
            CohortLabel = string.IsNullOrWhiteSpace(request.CohortLabel) ? "RN Pre-Licensure Track" : request.CohortLabel.Trim(),
            Title = title,
            Content = content,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.CommunityPosts.Add(post);
        await _db.SaveChangesAsync(ct);

        return (new CommunityPostDto(
            post.Id, post.ChannelId, post.ChannelName, post.AuthorName, post.CohortLabel,
            post.Title, post.Content, 0, 0, false, true, post.CreatedAtUtc), null);
    }

    public async Task<(CommunityReplyDto? Reply, string? Error, bool NotFound)> AddReplyAsync(
        string userId,
        string userName,
        Guid postId,
        string content,
        CancellationToken ct = default)
    {
        var text = content?.Trim() ?? string.Empty;
        if (text.Length < 2 || text.Length > 2000)
            return (null, "Reply must be between 2 and 2000 characters.", false);

        var exists = await _db.CommunityPosts.AnyAsync(p => p.Id == postId, ct);
        if (!exists)
            return (null, "Discussion post not found.", true);

        var reply = new CommunityReply
        {
            PostId = postId,
            AuthorUserId = userId,
            AuthorName = string.IsNullOrWhiteSpace(userName) ? "Nursing Learner" : userName.Trim(),
            Content = text,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.CommunityReplies.Add(reply);
        await _db.SaveChangesAsync(ct);

        return (new CommunityReplyDto(reply.Id, reply.PostId, reply.AuthorName, reply.Content, true, reply.CreatedAtUtc), null, false);
    }

    public async Task<(bool Liked, int LikeCount, bool NotFound)> ToggleLikeAsync(
        string userId,
        Guid postId,
        CancellationToken ct = default)
    {
        var exists = await _db.CommunityPosts.AnyAsync(p => p.Id == postId, ct);
        if (!exists)
            return (false, 0, true);

        var existing = await _db.CommunityPostLikes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId, ct);

        bool liked;
        if (existing is not null)
        {
            _db.CommunityPostLikes.Remove(existing);
            liked = false;
        }
        else
        {
            _db.CommunityPostLikes.Add(new CommunityPostLike
            {
                PostId = postId,
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow
            });
            liked = true;
        }

        await _db.SaveChangesAsync(ct);
        var count = await _db.CommunityPostLikes.CountAsync(l => l.PostId == postId, ct);
        return (liked, count, false);
    }

    public async Task<bool> DeletePostAsync(string userId, bool isAdmin, Guid postId, CancellationToken ct = default)
    {
        var post = await _db.CommunityPosts.FirstOrDefaultAsync(p => p.Id == postId, ct);
        if (post is null) return false;
        if (!isAdmin && post.AuthorUserId != userId) return false;

        var replies = await _db.CommunityReplies.Where(r => r.PostId == postId).ToListAsync(ct);
        var likes = await _db.CommunityPostLikes.Where(l => l.PostId == postId).ToListAsync(ct);
        if (replies.Count > 0) _db.CommunityReplies.RemoveRange(replies);
        if (likes.Count > 0) _db.CommunityPostLikes.RemoveRange(likes);
        _db.CommunityPosts.Remove(post);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
