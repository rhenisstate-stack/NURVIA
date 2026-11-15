using Nurvia.Domain.Common;

namespace Nurvia.Domain.Billing;

public class SubscriptionPlan : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal MonthlyPriceUsd { get; set; }
    public string BillingInterval { get; set; } = "Monthly";
    public string FeaturesText { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public SubscriptionPlan() { }
}

public class UserSubscription : Entity
{
    public string UserId { get; set; } = string.Empty;
    public Guid PlanId { get; set; }
    public string Status { get; set; } = "Active"; // Active, Expired, Revoked, PendingPayment
    public string Source { get; set; } = "FreeTier"; // FreeTier, AdminGrant, ExternalWebhook
    public DateTime StartsAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAtUtc { get; set; }
    public string? GrantedByUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public UserSubscription() { }
}
