using System.Text;
using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

public sealed record CheckoutRequest(Guid PlanId);

public sealed record SubscriptionOverviewDto(
    UserSubscriptionDto? ActiveSubscription,
    IReadOnlyList<SubscriptionPlanDto> Plans,
    bool PaymentProviderConfigured);

[ApiController]
[Route("api/subscriptions")]
public sealed class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionsService _service;

    public SubscriptionsController(ISubscriptionsService service)
    {
        _service = service;
    }

    [HttpGet("plans")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SubscriptionPlanDto>>>> GetPlans(CancellationToken ct = default)
    {
        var isAdmin = HttpContext.HasRole("Administrator", "Superadmin");
        var plans = await _service.GetPlansAsync(isAdmin, ct);
        return Ok(ApiResponse<IReadOnlyList<SubscriptionPlanDto>>.Ok(plans));
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<SubscriptionOverviewDto>>> GetMySubscription(CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<SubscriptionOverviewDto>.Error("Authentication is required."));

        var active = await _service.GetActiveSubscriptionAsync(user.Id, ct);
        var plans = await _service.GetPlansAsync(false, ct);
        return Ok(ApiResponse<SubscriptionOverviewDto>.Ok(
            new SubscriptionOverviewDto(active, plans, _service.IsPaymentProviderConfigured())));
    }

    [HttpPost("activate-free")]
    public async Task<ActionResult<ApiResponse<UserSubscriptionDto>>> ActivateFree(CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<UserSubscriptionDto>.Error("Authentication is required."));

        var (sub, error) = await _service.ActivateFreeTierAsync(user.Id, ct);
        if (error is not null || sub is null)
            return BadRequest(ApiResponse<UserSubscriptionDto>.Error(error ?? "Unable to activate Free Starter tier."));

        return Ok(ApiResponse<UserSubscriptionDto>.Ok(sub, "Free Starter tier is active."));
    }

    [HttpPost("checkout")]
    public ActionResult<ApiResponse<string>> Checkout([FromBody] CheckoutRequest request)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        // Fail closed: never fabricate a paid transaction without configured payment credentials
        if (!_service.IsPaymentProviderConfigured())
        {
            const string msg = "External payment gateway credentials (Billing:ProviderApiKey / Billing:WebhookSecret) are not configured in this environment. Administrators can grant plan entitlements directly via Admin > Plans & Entitlements.";
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                ApiResponse<string>.Error(msg, msg));
        }

        return StatusCode(
            StatusCodes.Status503ServiceUnavailable,
            ApiResponse<string>.Error("External checkout session creation is not enabled in local mode."));
    }

    [HttpPost("webhook")]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<ApiResponse<string>>> Webhook()
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var payload = await reader.ReadToEndAsync();
        var signature = Request.Headers["X-Nurvia-Billing-Signature"].FirstOrDefault();

        if (!_service.VerifyWebhookSignature(payload, signature))
            return Unauthorized(ApiResponse<string>.Error("Invalid or unconfigured billing webhook signature."));

        return Ok(ApiResponse<string>.Ok("Webhook signature verified."));
    }

    [HttpGet("/api/admin/subscriptions")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UserSubscriptionDto>>>> GetAllSubscriptions(CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<UserSubscriptionDto>>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<IReadOnlyList<UserSubscriptionDto>>.Error("Administrator access is required."));

        var list = await _service.GetAllSubscriptionsAsync(ct);
        return Ok(ApiResponse<IReadOnlyList<UserSubscriptionDto>>.Ok(list));
    }

    [HttpPost("/api/admin/plans")]
    public async Task<ActionResult<ApiResponse<SubscriptionPlanDto>>> CreatePlan(
        [FromBody] UpsertPlanRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<SubscriptionPlanDto>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<SubscriptionPlanDto>.Error("Administrator access is required."));

        var (plan, error) = await _service.CreatePlanAsync(user.Id, request, ct);
        if (error is not null || plan is null)
            return BadRequest(ApiResponse<SubscriptionPlanDto>.Error(error ?? "Unable to create plan."));

        return Ok(ApiResponse<SubscriptionPlanDto>.Ok(plan, "Subscription plan created."));
    }

    [HttpPost("/api/admin/subscriptions/grant")]
    public async Task<ActionResult<ApiResponse<UserSubscriptionDto>>> GrantEntitlement(
        [FromBody] GrantEntitlementRequest request,
        CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<UserSubscriptionDto>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<UserSubscriptionDto>.Error("Administrator access is required."));

        var (sub, error) = await _service.GrantEntitlementAsync(user.Id, request, ct);
        if (error is not null || sub is null)
            return BadRequest(ApiResponse<UserSubscriptionDto>.Error(error ?? "Unable to grant entitlement."));

        return Ok(ApiResponse<UserSubscriptionDto>.Ok(sub, "Entitlement granted."));
    }

    [HttpPost("/api/admin/subscriptions/{id:guid}/revoke")]
    public async Task<ActionResult<ApiResponse<string>>> RevokeEntitlement(Guid id, CancellationToken ct = default)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));
        if (!HttpContext.HasRole("Administrator", "Superadmin"))
            return StatusCode(403, ApiResponse<string>.Error("Administrator access is required."));

        var revoked = await _service.RevokeEntitlementAsync(user.Id, id, ct);
        if (!revoked)
            return NotFound(ApiResponse<string>.Error("Subscription record not found."));

        return Ok(ApiResponse<string>.Ok("Entitlement revoked."));
    }
}
