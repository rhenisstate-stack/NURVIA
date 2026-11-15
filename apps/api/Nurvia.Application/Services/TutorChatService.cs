using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Tutor;

namespace Nurvia.Application.Services;

public sealed record TutorChatMessageDto(
    Guid Id,
    string Role,
    string Content,
    DateTime CreatedAtUtc);

public sealed record TutorChatSessionDto(
    Guid Id,
    string Title,
    string Pathway,
    string Topic,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    IReadOnlyList<TutorChatMessageDto>? Messages = null);

public sealed record CreateTutorSessionRequest(string? Title, string? Pathway, string? Topic);
public sealed record SendTutorMessageRequest(string Message);

public interface ITutorChatService
{
    Task<IReadOnlyList<TutorChatSessionDto>> GetSessionsAsync(string userId, CancellationToken ct = default);
    Task<TutorChatSessionDto?> GetSessionAsync(string userId, Guid sessionId, CancellationToken ct = default);
    Task<(TutorChatSessionDto? Session, string? Error)> CreateSessionAsync(string userId, CreateTutorSessionRequest request, CancellationToken ct = default);
    Task<(TutorChatSessionDto? Session, string? Error, bool NotFound, bool ProviderUnavailable)> SendMessageAsync(string userId, Guid sessionId, string message, CancellationToken ct = default);
    Task<bool> DeleteSessionAsync(string userId, Guid sessionId, CancellationToken ct = default);
}

public class TutorChatService : ITutorChatService
{
    private readonly INurviaDbContext _db;
    private readonly IConfiguration _config;

    public TutorChatService(INurviaDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<IReadOnlyList<TutorChatSessionDto>> GetSessionsAsync(string userId, CancellationToken ct = default)
    {
        return await _db.TutorChatSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAtUtc)
            .Select(s => new TutorChatSessionDto(s.Id, s.Title, s.Pathway, s.Topic, s.CreatedAtUtc, s.UpdatedAtUtc, null))
            .ToListAsync(ct);
    }

    public async Task<TutorChatSessionDto?> GetSessionAsync(string userId, Guid sessionId, CancellationToken ct = default)
    {
        var session = await _db.TutorChatSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session is null) return null;

        var messages = await _db.TutorChatMessages
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.CreatedAtUtc)
            .Select(m => new TutorChatMessageDto(m.Id, m.Role, m.Content, m.CreatedAtUtc))
            .ToListAsync(ct);

        return new TutorChatSessionDto(
            session.Id, session.Title, session.Pathway, session.Topic,
            session.CreatedAtUtc, session.UpdatedAtUtc, messages);
    }

    public async Task<(TutorChatSessionDto? Session, string? Error)> CreateSessionAsync(
        string userId,
        CreateTutorSessionRequest request,
        CancellationToken ct = default)
    {
        var title = string.IsNullOrWhiteSpace(request.Title)
            ? "Clinical Judgment Session"
            : request.Title.Trim();
        if (title.Length > 240) title = title[..240];

        var session = new TutorChatSession
        {
            UserId = userId,
            Title = title,
            Pathway = string.IsNullOrWhiteSpace(request.Pathway) ? "RN" : request.Pathway.Trim(),
            Topic = string.IsNullOrWhiteSpace(request.Topic) ? "General Nursing" : request.Topic.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.TutorChatSessions.Add(session);
        _db.TutorChatMessages.Add(new TutorChatMessage
        {
            SessionId = session.Id,
            Role = "Assistant",
            Content = $"Welcome to your NURVIA Socratic Clinical Tutor ({session.Pathway} · {session.Topic}). Describe a clinical scenario, lab finding, or priority-of-care question, and I will guide your reasoning using the NCSBN Clinical Judgment Measurement Model without giving away ungrounded answers.",
            CreatedAtUtc = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        var created = await GetSessionAsync(userId, session.Id, ct);
        return (created, null);
    }

    public async Task<(TutorChatSessionDto? Session, string? Error, bool NotFound, bool ProviderUnavailable)> SendMessageAsync(
        string userId,
        Guid sessionId,
        string message,
        CancellationToken ct = default)
    {
        var text = message?.Trim() ?? string.Empty;
        if (text.Length < 2 || text.Length > 4000)
            return (null, "Message must be between 2 and 4000 characters.", false, false);

        var session = await _db.TutorChatSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session is null)
            return (null, "Tutor session not found.", true, false);

        // Fail closed if an external LLM provider is explicitly required but unconfigured
        var requireExternal = _config.GetValue<bool>("AiTutor:RequireExternalProvider");
        var externalApiKey = _config["AiTutor:ApiKey"];
        if (requireExternal && string.IsNullOrWhiteSpace(externalApiKey))
        {
            return (null, "External AI Tutor provider is required by configuration but AiTutor:ApiKey is not configured.", false, true);
        }

        // Ground response in persisted NURVIA study guides, care plans, and published lectures
        var keywords = text.ToLowerInvariant()
            .Split(new[] { ' ', ',', '.', '?', '!', ':', ';', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 4)
            .Distinct()
            .Take(5)
            .ToList();

        var matchedGuides = new List<string>();
        var matchedCarePlans = new List<string>();
        var matchedLectures = new List<string>();

        if (keywords.Count > 0)
        {
            var first = keywords[0];
            matchedGuides = await _db.StudyGuides
                .AsNoTracking()
                .Where(g => g.IsPublished && (g.Title.ToLower().Contains(first) || g.Summary.ToLower().Contains(first) || g.Category.ToLower().Contains(first)))
                .Select(g => g.Title)
                .Take(2)
                .ToListAsync(ct);

            matchedCarePlans = await _db.CarePlans
                .AsNoTracking()
                .Where(c => c.IsSystemPlan && (c.Title.ToLower().Contains(first) || c.Diagnosis.ToLower().Contains(first) || c.Specialty.ToLower().Contains(first)))
                .Select(c => $"{c.Title}: {c.Rationale}")
                .Take(2)
                .ToListAsync(ct);

            matchedLectures = await _db.Lectures
                .AsNoTracking()
                .Where(l => l.Status == ContentStatus.Published && (l.Title.ToLower().Contains(first) || l.Summary.ToLower().Contains(first)))
                .Select(l => $"Lecture {l.Number}: {l.Title}")
                .Take(2)
                .ToListAsync(ct);
        }

        var responseLines = new List<string>
        {
            $"Let's reason through your {session.Pathway} clinical question step by step using the Clinical Judgment framework:",
            "1. **Recognize Cues:** What are the most urgent physiological abnormalities (Airway, Breathing, Circulation, or acute safety risks) in this scenario?",
            "2. **Analyze & Prioritize:** Which finding poses the most immediate threat to perfusion, oxygenation, or client safety?",
            "3. **Take Action:** Before choosing an intervention, verify whether assessment is needed first or if immediate bedside stabilization is required."
        };

        if (matchedCarePlans.Count > 0)
            responseLines.Add($"**Relevant NURVIA Care Plan Context:** {string.Join(" | ", matchedCarePlans)}");
        if (matchedGuides.Count > 0)
            responseLines.Add($"**Related Study Guides in NURVIA:** {string.Join(", ", matchedGuides)}");
        if (matchedLectures.Count > 0)
            responseLines.Add($"**Related Published Lectures:** {string.Join(", ", matchedLectures)}");

        responseLines.Add("Reply with your prioritized nursing action and rationale, and we will evaluate it together.");

        var now = DateTime.UtcNow;
        _db.TutorChatMessages.Add(new TutorChatMessage
        {
            SessionId = sessionId,
            Role = "User",
            Content = text,
            CreatedAtUtc = now
        });
        _db.TutorChatMessages.Add(new TutorChatMessage
        {
            SessionId = sessionId,
            Role = "Assistant",
            Content = string.Join("\n\n", responseLines),
            CreatedAtUtc = now.AddMilliseconds(10)
        });
        session.UpdatedAtUtc = now;

        await _db.SaveChangesAsync(ct);
        var updated = await GetSessionAsync(userId, sessionId, ct);
        return (updated, null, false, false);
    }

    public async Task<bool> DeleteSessionAsync(string userId, Guid sessionId, CancellationToken ct = default)
    {
        var session = await _db.TutorChatSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session is null) return false;

        var messages = await _db.TutorChatMessages.Where(m => m.SessionId == sessionId).ToListAsync(ct);
        if (messages.Count > 0) _db.TutorChatMessages.RemoveRange(messages);
        _db.TutorChatSessions.Remove(session);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
