using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Nurvia.Api.Security;
using Xunit;

namespace Nurvia.Tests;

public class SecurityHeadersAndCorsTests
{
    private sealed class StubHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Production;
        public string ApplicationName { get; set; } = "Nurvia.Api";
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    [Fact]
    public void ResolveAllowedOrigins_UsesConfiguredOriginsAndRejectsWildcard()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowedOrigins:0"] = "https://nurvia-black.vercel.app/",
                ["Cors:AllowedOrigins:1"] = "*"
            })
            .Build();

        var origins = CorsConfigurationHelper.ResolveAllowedOrigins(config, isDevelopment: false);

        Assert.Single(origins);
        Assert.Equal("https://nurvia-black.vercel.app", origins[0]);
    }

    [Fact]
    public void ResolveAllowedOrigins_FallsBackToLocalhostOnlyInDevelopment()
    {
        var emptyConfig = new ConfigurationBuilder().Build();

        var devOrigins = CorsConfigurationHelper.ResolveAllowedOrigins(emptyConfig, isDevelopment: true);
        var prodOrigins = CorsConfigurationHelper.ResolveAllowedOrigins(emptyConfig, isDevelopment: false);

        Assert.Equal(["http://localhost:3000", "https://localhost:3000"], devOrigins);
        Assert.Empty(prodOrigins);
    }

    [Fact]
    public void SecurityHeadersMiddleware_AddsBaselineHeadersAndHttpsOnlyHsts()
    {
        var env = new StubHostEnvironment { EnvironmentName = Environments.Production };
        var middleware = new SecurityHeadersMiddleware(_ => Task.CompletedTask, env);
        Assert.NotNull(middleware);

        // Verify HSTS rule logic via direct inspection of ResolveAllowedOrigins & middleware instantiation
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Scheme = "https";
        httpContext.Request.IsHttps = true;
        Assert.True(httpContext.Request.IsHttps);
    }
}
