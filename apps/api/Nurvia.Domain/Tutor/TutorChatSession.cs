using Nurvia.Domain.Common;

namespace Nurvia.Domain.Tutor;

public class TutorChatSession : Entity
{
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = "Clinical Reasoning Session";
    public string Pathway { get; set; } = "RN";
    public string Topic { get; set; } = "General Nursing";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public TutorChatSession() { }
}

public class TutorChatMessage : Entity
{
    public Guid SessionId { get; set; }
    public string Role { get; set; } = "User"; // "User" | "Assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public TutorChatMessage() { }
}
