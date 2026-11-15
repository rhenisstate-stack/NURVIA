using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Billing;

namespace Nurvia.Application.Services;

public sealed record SubscriptionPlanDto(
    Guid Id,
    string Code,
    string Name,
    string Description,
    decimal MonthlyPriceUsd,
    string BillingInterval,
    IReadOnlyList<string> Features,
    bool IsActive);

public sealed record UserSubscriptionDto(
    Guid Id,
    string UserId,
    string? UserEmail,
    string? UserName,
    Guid PlanId,
    string PlanCode,
    string PlanName,
    string Status,
    string Source,
    DateTime StartsAtUtc,
    DateTime? ExpiresAtUtc,
    string? Notes);

public sealed record GrantEntitlementRequest(
    string TargetUserId,
    Guid PlanId,
    int DurationDays = 30,
    string? Notes = null);

public sealed record UpsertPlanRequest(
    string Code,
    string Name,
    string Description,
    decimal MonthlyPriceUsd,
    string BillingInterval,
    IReadOnlyList<string> Features,
    bool IsActive = true);

public interface ISubscriptionsService
{
    Task<IReadOnlyList<SubscriptionPlanDto>> GetPlansAsync(bool includeInactive, CancellationToken ct = default);
    Task<UserSubscriptionDto?> GetActiveSubscriptionAsync(string userId, CancellationToken ct = default);
    Task<(UserSubscriptionDto? Subscription, string? Error)> ActivateFreeTierAsync(string userId, CancellationToken ct = default);
    Task<IReadOnlyList<UserSubscriptionDto>> GetAllSubscriptionsAsync(CancellationToken ct = default);
    Task<(UserSubscriptionDto? Subscription, string? Error)> GrantEntitlementAsync(string adminUserId, GrantEntitlementRequest request, CancellationToken ct = default);
    Task<bool> RevokeEntitlementAsync(string adminUserId, Guid subscriptionId, CancellationToken ct = default);
    Task<(SubscriptionPlanDto? Plan, string? Error)> CreatePlanAsync(string adminUserId, UpsertPlanRequest request, CancellationToken ct = default);
    bool IsPaymentProviderConfigured();
    bool VerifyWebhookSignature(string payload, string? signatureHeader);
}

public class SubscriptionsService : ISubscriptionsService
{
    private readonly INurviaDbContext _db;
    private readonly IConfiguration _config;

    public SubscriptionsService(INurviaDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<IReadOnlyList<SubscriptionPlanDto>> GetPlansAsync(bool includeInactive, CancellationToken ct = default)
    {
        var query = _db.SubscriptionPlans.AsNoTracking();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var plans = await query.OrderBy(p => p.MonthlyPriceUsd).ToListAsync(ct);
        return plans.Select(MapPlan).ToList();
    }

    public async Task<UserSubscriptionDto?> GetActiveSubscriptionAsync(string userId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var sub = await _db.UserSubscriptions
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.Status == "Active" && (s.ExpiresAtUtc == null || s.ExpiresAtUtc > now))
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (sub is null) return null;

        var plan = await _db.SubscriptionPlans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == sub.PlanId, ct);
        return new UserSubscriptionDto(
            sub.Id, sub.UserId, null, null, sub.PlanId,
            plan?.Code ?? "UNKNOWN", plan?.Name ?? "Unknown Plan",
            sub.Status, sub.Source, sub.StartsAtUtc, sub.ExpiresAtUtc, sub.Notes);
    }

    public async Task<(UserSubscriptionDto? Subscription, string? Error)> ActivateFreeTierAsync(string userId, CancellationToken ct = default)
    {
        var freePlan = await _db.SubscriptionPlans
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code == "FREE" && p.IsActive, ct);
        if (freePlan is null)
            return (null, "Free Starter plan is not configured.");

        var now = DateTime.UtcNow;
        var existing = await _db.UserSubscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "Active" && (s.ExpiresAtUtc == null || s.ExpiresAtUtc > now), ct);
        if (existing is not null)
        {
            var current = await GetActiveSubscriptionAsync(userId, ct);
            return (current, null);
        }

        var sub = new UserSubscription
        {
            UserId = userId,
            PlanId = freePlan.Id,
            Status = "Active",
            Source = "FreeTier",
            StartsAtUtc = now,
            ExpiresAtUtc = null,
            Notes = "Self-activated Free Starter tier",
            CreatedAtUtc = now
        };
        _db.UserSubscriptions.Add(sub);
        await _db.SaveChangesAsync(ct);

        return (new UserSubscriptionDto(
            sub.Id, sub.UserId, null, null, freePlan.Id, freePlan.Code, freePlan.Name,
            sub.Status, sub.Source, sub.StartsAtUtc, sub.ExpiresAtUtc, sub.Notes), null);
    }

    public async Task<IReadOnlyList<UserSubscriptionDto>> GetAllSubscriptionsAsync(CancellationToken ct = default)
    {
        var subs = await _db.UserSubscriptions
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var plans = await _db.SubscriptionPlans.AsNoTracking().ToDictionaryAsync(p => p.Id, ct);
        var userIds = subs.Select(s => s.UserId).Distinct().ToList();
        var userGuids = userIds
            .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .ToList();
        var users = await _db.UserAccounts
            .AsNoTracking()
            .Where(u => userGuids.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id.ToString(), ct);

        return subs.Select(s =>
        {
            plans.TryGetValue(s.PlanId, out var plan);
            users.TryGetValue(s.UserId, out var user);
            return new UserSubscriptionDto(
                s.Id, s.UserId, user?.Email, user?.Name, s.PlanId,
                plan?.Code ?? "UNKNOWN", plan?.Name ?? "Unknown Plan",
                s.Status, s.Source, s.StartsAtUtc, s.ExpiresAtUtc, s.Notes);
        }).ToList();
    }

    public async Task<(UserSubscriptionDto? Subscription, string? Error)> GrantEntitlementAsync(
        string adminUserId,
        GrantEntitlementRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.TargetUserId))
            return (null, "Target user ID or email is required.");

        var target = request.TargetUserId.Trim();
        var hasGuid = Guid.TryParse(target, out var targetGuid);
        var user = await _db.UserAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(u => (hasGuid && u.Id == targetGuid) || u.NormalizedEmail == target.ToUpperInvariant(), ct);
        if (user is null)
            return (null, "Target user account not found.");

        var plan = await _db.SubscriptionPlans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.PlanId, ct);
        if (plan is null)
            return (null, "Subscription plan not found.");

        var now = DateTime.UtcNow;
        var days = Math.Clamp(request.DurationDays, 1, 3650);
        var targetUserIdStr = user.Id.ToString();

        // Revoke any prior active subscription before granting new entitlement
        var priorActive = await _db.UserSubscriptions
            .Where(s => s.UserId == targetUserIdStr && s.Status == "Active")
            .ToListAsync(ct);
        foreach (var prior in priorActive)
        {
            prior.Status = "Replaced";
        }

        var sub = new UserSubscription
        {
            UserId = targetUserIdStr,
            PlanId = plan.Id,
            Status = "Active",
            Source = "AdminGrant",
            StartsAtUtc = now,
            ExpiresAtUtc = now.AddDays(days),
            GrantedByUserId = adminUserId,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? $"Granted by admin for {days} days" : request.Notes.Trim(),
            CreatedAtUtc = now
        };
        _db.UserSubscriptions.Add(sub);
        _db.AuditLogs.Add(new AuditLog(
            "UserSubscription",
            sub.Id.ToString(),
            "EntitlementGranted",
            adminUserId,
            adminUserId,
            "Administrator",
            $"{{\"targetUserId\":\"{targetUserIdStr}\",\"planCode\":\"{plan.Code}\",\"durationDays\":{days}}}"));

        await _db.SaveChangesAsync(ct);

        return (new UserSubscriptionDto(
            sub.Id, sub.UserId, user.Email, user.Name, plan.Id, plan.Code, plan.Name,
            sub.Status, sub.Source, sub.StartsAtUtc, sub.ExpiresAtUtc, sub.Notes), null);
    }

    public async Task<bool> RevokeEntitlementAsync(string adminUserId, Guid subscriptionId, CancellationToken ct = default)
    {
        var sub = await _db.UserSubscriptions.FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);
        if (sub is null) return false;

        sub.Status = "Revoked";
        sub.ExpiresAtUtc = DateTime.UtcNow;
        _db.AuditLogs.Add(new AuditLog(
            "UserSubscription",
            sub.Id.ToString(),
            "EntitlementRevoked",
            adminUserId,
            adminUserId,
            "Administrator",
            $"{{\"targetUserId\":\"{sub.UserId}\"}}"));

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<(SubscriptionPlanDto? Plan, string? Error)> CreatePlanAsync(
        string adminUserId,
        UpsertPlanRequest request,
        CancellationToken ct = default)
    {
        var code = request.Code?.Trim().ToUpperInvariant() ?? string.Empty;
        var name = request.Name?.Trim() ?? string.Empty;
        if (code.Length < 2 || code.Length > 60)
            return (null, "Plan code must be between 2 and 60 characters.");
        if (name.Length < 2 || name.Length > 160)
            return (null, "Plan name must be between 2 and 160 characters.");
        if (request.MonthlyPriceUsd < 0)
            return (null, "Monthly price cannot be negative.");

        if (await _db.SubscriptionPlans.AnyAsync(p => p.Code == code, ct))
            return (null, $"A plan with code '{code}' already exists.");

        var plan = new SubscriptionPlan
        {
            Code = code,
            Name = name,
            Description = request.Description?.Trim() ?? string.Empty,
            MonthlyPriceUsd = request.MonthlyPriceUsd,
            BillingInterval = string.IsNullOrWhiteSpace(request.BillingInterval) ? "Monthly" : request.BillingInterval.Trim(),
            FeaturesText = string.Join("\n", (request.Features ?? Array.Empty<string>()).Select(f => f.Trim()).Where(f => f.Length > 0)),
            IsActive = request.IsActive,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.SubscriptionPlans.Add(plan);
        _db.AuditLogs.Add(new AuditLog(
            "SubscriptionPlan",
            plan.Id.ToString(),
            "SubscriptionPlanCreated",
            adminUserId,
            adminUserId,
            "Administrator",
            $"{{\"code\":\"{plan.Code}\"}}"));
        await _db.SaveChangesAsync(ct);

        return (MapPlan(plan), null);
    }

    public bool IsPaymentProviderConfigured() =>
        !string.IsNullOrWhiteSpace(_config["Billing:ProviderApiKey"]) &&
        !string.IsNullOrWhiteSpace(_config["Billing:WebhookSecret"]);

    public bool VerifyWebhookSignature(string payload, string? signatureHeader)
    {
        var secret = _config["Billing:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(signatureHeader))
            return false;

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var computed = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
        var provided = signatureHeader.Trim().ToLowerInvariant();
        if (provided.StartsWith("sha256="))
            provided = provided["sha256=".Length..];

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(provided));
    }

    private static SubscriptionPlanDto MapPlan(SubscriptionPlan p) => new(
        p.Id,
        p.Code,
        p.Name,
        p.Description,
        p.MonthlyPriceUsd,
        p.BillingInterval,
        p.FeaturesText.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        p.IsActive);
}
