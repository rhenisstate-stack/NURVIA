namespace Nurvia.Api.Security;

public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _environment;

    public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment environment)
    {
        _next = next;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            headers.TryAdd("X-Content-Type-Options", "nosniff");
            headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
            headers.TryAdd("X-Frame-Options", "DENY");
            headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

            var isSwaggerDev = _environment.IsDevelopment() &&
                               context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase);

            if (!isSwaggerDev)
            {
                headers.TryAdd("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
            }

            if (!_environment.IsDevelopment() && context.Request.IsHttps)
            {
                headers.TryAdd("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}

public static class CorsConfigurationHelper
{
    public static string[] ResolveAllowedOrigins(IConfiguration configuration, bool isDevelopment)
    {
        var arrayOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        if (arrayOrigins is { Length: > 0 })
        {
            return arrayOrigins
                .Where(o => !string.IsNullOrWhiteSpace(o) && o.Trim() != "*")
                .Select(o => o.Trim().TrimEnd('/'))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        var csvOrigins = configuration["Cors:AllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(csvOrigins))
        {
            return csvOrigins
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(o => o != "*")
                .Select(o => o.TrimEnd('/'))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        return isDevelopment
            ? ["http://localhost:3000", "https://localhost:3000"]
            : [];
    }
}
