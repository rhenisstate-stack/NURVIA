using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Learning;

namespace Nurvia.Application.Services;

public sealed record CarePlanDto(
    Guid Id,
    string Title,
    string Specialty,
    string Diagnosis,
    string RelatedTo,
    IReadOnlyList<string> Outcomes,
    IReadOnlyList<string> Interventions,
    string Rationale,
    bool IsSystemPlan,
    bool IsOwnedByCaller,
    DateTime CreatedAtUtc);

public sealed record CreateCarePlanRequest(
    string Title,
    string Specialty,
    string Diagnosis,
    string RelatedTo,
    IReadOnlyList<string> Outcomes,
    IReadOnlyList<string> Interventions,
    string Rationale);

public interface ICarePlansService
{
    Task<IReadOnlyList<CarePlanDto>> GetCarePlansAsync(string? userId, string? specialty, string? search, CancellationToken ct = default);
    Task<(CarePlanDto? Plan, string? Error)> CreateAsync(string userId, CreateCarePlanRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string userId, Guid id, CancellationToken ct = default);
}

public class CarePlansService : ICarePlansService
{
    private readonly INurviaDbContext _db;

    public CarePlansService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CarePlanDto>> GetCarePlansAsync(
        string? userId,
        string? specialty,
        string? search,
        CancellationToken ct = default)
    {
        var query = _db.CarePlans
            .AsNoTracking()
            .Where(c => c.IsSystemPlan || (userId != null && c.OwnerUserId == userId));

        if (!string.IsNullOrWhiteSpace(specialty) && !string.Equals(specialty, "All", StringComparison.OrdinalIgnoreCase))
        {
            var spec = specialty.Trim().ToLower();
            query = query.Where(c => c.Specialty.ToLower() == spec);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(term) ||
                c.Diagnosis.ToLower().Contains(term) ||
                c.RelatedTo.ToLower().Contains(term) ||
                c.Specialty.ToLower().Contains(term));
        }

        var plans = await query
            .OrderByDescending(c => !c.IsSystemPlan)
            .ThenBy(c => c.Specialty)
            .ThenBy(c => c.Title)
            .ToListAsync(ct);

        return plans.Select(p => MapToDto(p, userId)).ToList();
    }

    public async Task<(CarePlanDto? Plan, string? Error)> CreateAsync(
        string userId,
        CreateCarePlanRequest request,
        CancellationToken ct = default)
    {
        var title = request.Title?.Trim() ?? string.Empty;
        var diagnosis = request.Diagnosis?.Trim() ?? string.Empty;
        if (title.Length < 3 || title.Length > 200)
            return (null, "Care plan title must be between 3 and 200 characters.");
        if (diagnosis.Length < 5 || diagnosis.Length > 500)
            return (null, "Nursing diagnosis must be between 5 and 500 characters.");

        var outcomes = (request.Outcomes ?? Array.Empty<string>())
            .Select(o => o.Trim()).Where(o => o.Length > 0).ToList();
        var interventions = (request.Interventions ?? Array.Empty<string>())
            .Select(i => i.Trim()).Where(i => i.Length > 0).ToList();

        if (outcomes.Count == 0 || interventions.Count == 0)
            return (null, "At least one outcome and one intervention are required.");

        var entity = new CarePlan
        {
            OwnerUserId = userId,
            Title = title,
            Specialty = string.IsNullOrWhiteSpace(request.Specialty) ? "Med-Surg" : request.Specialty.Trim(),
            Diagnosis = diagnosis,
            RelatedTo = request.RelatedTo?.Trim() ?? string.Empty,
            OutcomesText = string.Join("\n", outcomes),
            InterventionsText = string.Join("\n", interventions),
            Rationale = request.Rationale?.Trim() ?? string.Empty,
            IsSystemPlan = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.CarePlans.Add(entity);
        await _db.SaveChangesAsync(ct);

        return (MapToDto(entity, userId), null);
    }

    public async Task<bool> DeleteAsync(string userId, Guid id, CancellationToken ct = default)
    {
        var entity = await _db.CarePlans
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsSystemPlan && c.OwnerUserId == userId, ct);
        if (entity is null)
            return false;

        _db.CarePlans.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static CarePlanDto MapToDto(CarePlan p, string? userId) => new(
        p.Id,
        p.Title,
        p.Specialty,
        p.Diagnosis,
        p.RelatedTo,
        p.OutcomesText.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        p.InterventionsText.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        p.Rationale,
        p.IsSystemPlan,
        userId != null && p.OwnerUserId == userId,
        p.CreatedAtUtc);
}
