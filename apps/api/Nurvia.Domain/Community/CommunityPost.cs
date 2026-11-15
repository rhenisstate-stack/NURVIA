using Nurvia.Domain.Common;

namespace Nurvia.Domain.Community;

public class CommunityPost : Entity
{
    public string ChannelId { get; set; } = "nclex-cohorts";
    public string ChannelName { get; set; } = "NCLEX 2026 Test-Taker Cohorts";
    public string AuthorUserId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string CohortLabel { get; set; } = "RN Pre-Licensure Track";
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public CommunityPost() { }
}

public class CommunityReply : Entity
{
    public Guid PostId { get; set; }
    public string AuthorUserId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public CommunityReply() { }
}

public class CommunityPostLike : Entity
{
    public Guid PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public CommunityPostLike() { }
}
