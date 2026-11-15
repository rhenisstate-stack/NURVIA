using System.Collections.Concurrent;
using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Nurvia.Application.Common;

namespace Nurvia.Api.Security;

public sealed class AuthRateLimitOptions
{
    public const string SectionName = "RateLimiting";

    public int LoginPermitLimitPerIp { get; set; } = 10;
    public int LoginPermitLimitPerAccount { get; set; } = 5;
    public int LoginWindowSeconds { get; set; } = 60;

    public int RegisterPermitLimitPerIp { get; set; } = 5;
    public int RegisterWindowSeconds { get; set; } = 60;

    public int PasswordResetPermitLimitPerIp { get; set; } = 5;
    public int PasswordResetPermitLimitPerAccount { get; set; } = 3;
    public int PasswordResetWindowSeconds { get; set; } = 300;
}

public interface IAccountRateLimiter
{
    (bool Allowed, int RetryAfterSeconds) TryAcquireLogin(string? email, string? partitionScope = null);
    (bool Allowed, int RetryAfterSeconds) TryAcquirePasswordReset(string? email, string? partitionScope = null);
}

public sealed class AccountRateLimiter : IAccountRateLimiter, IDisposable
{
    private readonly AuthRateLimitOptions _options;
    private readonly PartitionedRateLimiter<string> _loginLimiter;
    private readonly PartitionedRateLimiter<string> _passwordResetLimiter;

    public AccountRateLimiter(IOptions<AuthRateLimitOptions> options)
    {
        _options = options.Value;
        _loginLimiter = CreateFixedWindowLimiter(
            Math.Max(1, _options.LoginPermitLimitPerAccount),
            TimeSpan.FromSeconds(Math.Max(1, _options.LoginWindowSeconds)));
        _passwordResetLimiter = CreateFixedWindowLimiter(
            Math.Max(1, _options.PasswordResetPermitLimitPerAccount),
            TimeSpan.FromSeconds(Math.Max(1, _options.PasswordResetWindowSeconds)));
    }

    public (bool Allowed, int RetryAfterSeconds) TryAcquireLogin(string? email, string? partitionScope = null) =>
        TryAcquire(_loginLimiter, NormalizeKey("login", email, partitionScope), Math.Max(1, _options.LoginWindowSeconds));

    public (bool Allowed, int RetryAfterSeconds) TryAcquirePasswordReset(string? email, string? partitionScope = null) =>
        TryAcquire(_passwordResetLimiter, NormalizeKey("reset", email, partitionScope), Math.Max(1, _options.PasswordResetWindowSeconds));

    private static (bool Allowed, int RetryAfterSeconds) TryAcquire(
        PartitionedRateLimiter<string> limiter,
        string key,
        int defaultWindowSeconds)
    {
        using var lease = limiter.AttemptAcquire(key, 1);
        if (lease.IsAcquired)
            return (true, 0);

        var retryAfter = defaultWindowSeconds;
        if (lease.TryGetMetadata(MetadataName.RetryAfter, out var retrySpan))
            retryAfter = Math.Max(1, (int)Math.Ceiling(retrySpan.TotalSeconds));

        return (false, retryAfter);
    }

    private static string NormalizeKey(string prefix, string? email, string? partitionScope)
    {
        var normalized = string.IsNullOrWhiteSpace(email)
            ? "__empty__"
            : email.Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(partitionScope)
            ? $"{prefix}:{normalized}"
            : $"{prefix}:{partitionScope.Trim()}:{normalized}";
    }

    private static PartitionedRateLimiter<string> CreateFixedWindowLimiter(int permitLimit, TimeSpan window) =>
        PartitionedRateLimiter.Create<string, string>(key =>
            RateLimitPartition.GetFixedWindowLimiter(
                key,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = permitLimit,
                    Window = window,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0,
                    AutoReplenishment = true
                }));

    public void Dispose()
    {
        _loginLimiter.Dispose();
        _passwordResetLimiter.Dispose();
    }
}

public static class AuthRateLimitingExtensions
{
    public const string LoginIpPolicy = "auth-login-ip";
    public const string RegisterIpPolicy = "auth-register-ip";
    public const string PasswordResetIpPolicy = "auth-reset-ip";
    public const string TestPartitionHeaderName = "X-Nurvia-Test-Partition";

    public static IServiceCollection AddNurviaRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var section = configuration.GetSection(AuthRateLimitOptions.SectionName);
        services.Configure<AuthRateLimitOptions>(section);

        var opts = section.Get<AuthRateLimitOptions>() ?? new AuthRateLimitOptions();

        services.AddSingleton<IAccountRateLimiter, AccountRateLimiter>();

        // Configure ForwardedHeaders safely: only trust explicitly configured KnownProxies;
        // never clear KnownNetworks/KnownProxies globally, preventing X-Forwarded-For spoofing.
        services.Configure<ForwardedHeadersOptions>(forwarded =>
        {
            forwarded.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            var proxies = configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>();
            if (proxies is { Length: > 0 })
            {
                foreach (var proxy in proxies)
                {
                    if (IPAddress.TryParse(proxy, out var ip))
                        forwarded.KnownProxies.Add(ip);
                }
            }
        });

        services.AddRateLimiter(rateLimiter =>
        {
            rateLimiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            rateLimiter.OnRejected = async (context, cancellationToken) =>
            {
                var retryAfterSeconds = 60;
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));

                context.HttpContext.Response.Headers.RetryAfter = retryAfterSeconds.ToString();
                context.HttpContext.Response.ContentType = "application/json";
                await context.HttpContext.Response.WriteAsJsonAsync(
                    ApiResponse<object>.Error("Too many requests. Please try again later."),
                    cancellationToken);
            };

            rateLimiter.AddPolicy(LoginIpPolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientIpPartitionKey(context),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = Math.Max(1, opts.LoginPermitLimitPerIp),
                        Window = TimeSpan.FromSeconds(Math.Max(1, opts.LoginWindowSeconds)),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));

            rateLimiter.AddPolicy(RegisterIpPolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientIpPartitionKey(context),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = Math.Max(1, opts.RegisterPermitLimitPerIp),
                        Window = TimeSpan.FromSeconds(Math.Max(1, opts.RegisterWindowSeconds)),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));

            rateLimiter.AddPolicy(PasswordResetIpPolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientIpPartitionKey(context),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = Math.Max(1, opts.PasswordResetPermitLimitPerIp),
                        Window = TimeSpan.FromSeconds(Math.Max(1, opts.PasswordResetWindowSeconds)),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));
        });

        return services;
    }

    /// <summary>
    /// Returns an explicit test-only rate-limiter partition scope from <see cref="TestPartitionHeaderName"/>
    /// ONLY when running in Development or Test environments. Always returns null in Production/Staging.
    /// </summary>
    public static string? GetTestPartitionKey(HttpContext context)
    {
        var env = context.RequestServices?.GetService<IHostEnvironment>();
        if (env is null || (!env.IsDevelopment() && !env.IsEnvironment("Test")))
            return null;

        if (!context.Request.Headers.TryGetValue(TestPartitionHeaderName, out var values))
            return null;

        var raw = values.FirstOrDefault()?.Trim();
        if (string.IsNullOrEmpty(raw))
            return null;

        return raw.Length > 64 ? raw[..64] : raw;
    }

    public static string GetClientIpPartitionKey(HttpContext context)
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var testPartition = GetTestPartitionKey(context);
        return testPartition is null ? ip : $"{ip}:test:{testPartition}";
    }
}
