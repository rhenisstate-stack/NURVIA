using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Services;

public sealed record SavedQuestionDto(
    Guid Id,
    Guid QuestionId,
    Guid? ExamId,
    string Stem,
    string Subject,
    string Topic,
    string QuestionType,
    string? Notes,
    DateTime SavedAtUtc);

public sealed record StudyPlanTaskDto(
    Guid Id,
    string Title,
    DateTime ScheduledForUtc,
    int DurationMinutes,
    Guid? ExamId,
    string? ExamTitle,
    bool IsCompleted,
    DateTime? CompletedAtUtc,
    DateTime CreatedAtUtc);

public sealed record CreateStudyPlanTaskRequest(
    string Title,
    DateTime ScheduledForUtc,
    int DurationMinutes,
    Guid? ExamId = null);

public sealed record UpdateStudyPlanTaskRequest(
    string? Title = null,
    DateTime? ScheduledForUtc = null,
    int? DurationMinutes = null,
    Guid? ExamId = null,
    bool? IsCompleted = null);

public interface ISavedQuestionsService
{
    Task<IReadOnlyList<SavedQuestionDto>> GetSavedQuestionsAsync(string userId, CancellationToken ct = default);
    Task<SavedQuestionDto?> SaveQuestionAsync(string userId, Guid questionId, Guid? examId, string? notes, CancellationToken ct = default);
    Task<bool> RemoveSavedQuestionAsync(string userId, Guid questionId, CancellationToken ct = default);
}

public interface IStudyPlannerService
{
    Task<IReadOnlyList<StudyPlanTaskDto>> GetTasksAsync(string userId, CancellationToken ct = default);
    Task<(StudyPlanTaskDto? Task, string? Error)> CreateTaskAsync(string userId, CreateStudyPlanTaskRequest request, CancellationToken ct = default);
    Task<(StudyPlanTaskDto? Task, string? Error, bool NotFound)> UpdateTaskAsync(string userId, Guid taskId, UpdateStudyPlanTaskRequest request, CancellationToken ct = default);
    Task<bool> DeleteTaskAsync(string userId, Guid taskId, CancellationToken ct = default);
}

public sealed class SavedQuestionsService : ISavedQuestionsService
{
    private readonly INurviaDbContext _db;

    public SavedQuestionsService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SavedQuestionDto>> GetSavedQuestionsAsync(string userId, CancellationToken ct = default)
    {
        var saved = await _db.SavedQuestions
            .AsNoTracking()
            .Include(s => s.Question)
            .ThenInclude(q => q!.CurrentVersion)
            .Where(s => s.UserId == userId && s.Question != null)
            .OrderByDescending(s => s.SavedAtUtc)
            .ToListAsync(ct);

        return saved.Select(s => new SavedQuestionDto(
            s.Id,
            s.QuestionId,
            s.ExamId,
            s.Question!.CurrentVersion?.Stem ?? s.Question.Code,
            s.Question.Subject,
            s.Question.Topic,
            s.Question.CurrentVersion?.QuestionType.ToString() ?? "MultipleChoice",
            s.Notes,
            s.SavedAtUtc)).ToList();
    }

    public async Task<SavedQuestionDto?> SaveQuestionAsync(
        string userId,
        Guid questionId,
        Guid? examId,
        string? notes,
        CancellationToken ct = default)
    {
        var question = await _db.Questions
            .AsNoTracking()
            .Include(q => q.CurrentVersion)
            .FirstOrDefaultAsync(q => q.Id == questionId && q.Status == ContentStatus.Published, ct);

        if (question is null)
            return null;

        var stem = question.CurrentVersion?.Stem ?? question.Code;
        var qType = question.CurrentVersion?.QuestionType.ToString() ?? "MultipleChoice";

        var existing = await _db.SavedQuestions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.QuestionId == questionId, ct);

        if (existing is not null)
        {
            if (examId.HasValue) existing.ExamId = examId;
            if (notes is not null) existing.Notes = notes.Trim();
            await _db.SaveChangesAsync(ct);

            return new SavedQuestionDto(
                existing.Id,
                question.Id,
                existing.ExamId,
                stem,
                question.Subject,
                question.Topic,
                qType,
                existing.Notes,
                existing.SavedAtUtc);
        }

        var entity = new SavedQuestion(userId, questionId, examId, notes?.Trim());
        _db.SavedQuestions.Add(entity);
        await _db.SaveChangesAsync(ct);

        return new SavedQuestionDto(
            entity.Id,
            question.Id,
            entity.ExamId,
            stem,
            question.Subject,
            question.Topic,
            qType,
            entity.Notes,
            entity.SavedAtUtc);
    }

    public async Task<bool> RemoveSavedQuestionAsync(string userId, Guid questionId, CancellationToken ct = default)
    {
        var existing = await _db.SavedQuestions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.QuestionId == questionId, ct);

        if (existing is null)
            return false;

        _db.SavedQuestions.Remove(existing);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public sealed class StudyPlannerService : IStudyPlannerService
{
    private readonly INurviaDbContext _db;

    public StudyPlannerService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<StudyPlanTaskDto>> GetTasksAsync(string userId, CancellationToken ct = default)
    {
        var tasks = await _db.StudyPlanTasks
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.ScheduledForUtc)
            .ToListAsync(ct);

        var examIds = tasks.Where(t => t.ExamId.HasValue).Select(t => t.ExamId!.Value).Distinct().ToList();
        var examTitles = examIds.Count > 0
            ? await _db.Exams.AsNoTracking()
                .Where(e => examIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, e => e.Title, ct)
            : new Dictionary<Guid, string>();

        return tasks.Select(t => new StudyPlanTaskDto(
            t.Id,
            t.Title,
            t.ScheduledForUtc,
            t.DurationMinutes,
            t.ExamId,
            t.ExamId.HasValue && examTitles.TryGetValue(t.ExamId.Value, out var title) ? title : null,
            t.IsCompleted,
            t.CompletedAtUtc,
            t.CreatedAtUtc)).ToList();
    }

    public async Task<(StudyPlanTaskDto? Task, string? Error)> CreateTaskAsync(
        string userId,
        CreateStudyPlanTaskRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return (null, "Task title is required.");

        if (request.DurationMinutes is < 5 or > 600)
            return (null, "Duration must be between 5 and 600 minutes.");

        string? examTitle = null;
        if (request.ExamId.HasValue)
        {
            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == request.ExamId.Value && e.Status == ExamStatus.Published, ct);
            if (exam is null)
                return (null, "Selected exam was not found or is not published.");
            examTitle = exam.Title;
        }

        var task = new StudyPlanTask
        {
            UserId = userId,
            Title = request.Title.Trim(),
            ScheduledForUtc = request.ScheduledForUtc.Kind == DateTimeKind.Utc
                ? request.ScheduledForUtc
                : request.ScheduledForUtc.ToUniversalTime(),
            DurationMinutes = request.DurationMinutes,
            ExamId = request.ExamId,
            IsCompleted = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.StudyPlanTasks.Add(task);
        await _db.SaveChangesAsync(ct);

        return (new StudyPlanTaskDto(
            task.Id,
            task.Title,
            task.ScheduledForUtc,
            task.DurationMinutes,
            task.ExamId,
            examTitle,
            task.IsCompleted,
            task.CompletedAtUtc,
            task.CreatedAtUtc), null);
    }

    public async Task<(StudyPlanTaskDto? Task, string? Error, bool NotFound)> UpdateTaskAsync(
        string userId,
        Guid taskId,
        UpdateStudyPlanTaskRequest request,
        CancellationToken ct = default)
    {
        var task = await _db.StudyPlanTasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, ct);

        if (task is null)
            return (null, "Study plan task not found.", true);

        if (request.Title is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return (null, "Task title cannot be empty.", false);
            task.Title = request.Title.Trim();
        }

        if (request.ScheduledForUtc.HasValue)
        {
            var dt = request.ScheduledForUtc.Value;
            task.ScheduledForUtc = dt.Kind == DateTimeKind.Utc ? dt : dt.ToUniversalTime();
        }

        if (request.DurationMinutes.HasValue)
        {
            if (request.DurationMinutes.Value is < 5 or > 600)
                return (null, "Duration must be between 5 and 600 minutes.", false);
            task.DurationMinutes = request.DurationMinutes.Value;
        }

        if (request.ExamId.HasValue)
        {
            var examExists = await _db.Exams.AsNoTracking()
                .AnyAsync(e => e.Id == request.ExamId.Value && e.Status == ExamStatus.Published, ct);
            if (!examExists)
                return (null, "Selected exam was not found or is not published.", false);
            task.ExamId = request.ExamId.Value;
        }

        if (request.IsCompleted.HasValue)
        {
            task.IsCompleted = request.IsCompleted.Value;
            task.CompletedAtUtc = request.IsCompleted.Value ? DateTime.UtcNow : null;
        }

        await _db.SaveChangesAsync(ct);

        string? examTitle = null;
        if (task.ExamId.HasValue)
        {
            examTitle = await _db.Exams.AsNoTracking()
                .Where(e => e.Id == task.ExamId.Value)
                .Select(e => e.Title)
                .FirstOrDefaultAsync(ct);
        }

        return (new StudyPlanTaskDto(
            task.Id,
            task.Title,
            task.ScheduledForUtc,
            task.DurationMinutes,
            task.ExamId,
            examTitle,
            task.IsCompleted,
            task.CompletedAtUtc,
            task.CreatedAtUtc), null, false);
    }

    public async Task<bool> DeleteTaskAsync(string userId, Guid taskId, CancellationToken ct = default)
    {
        var task = await _db.StudyPlanTasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, ct);

        if (task is null)
            return false;

        _db.StudyPlanTasks.Remove(task);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
