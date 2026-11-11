using Nurvia.Application.Security;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// Unit tests for the runtime Superadmin bootstrap environment restrictions
/// (Phase 8 environment matrix). Bootstrap must never accidentally activate
/// outside an explicitly opted-in Development or Test environment.
/// </summary>
public class BootstrapConfigurationValidatorTests
{
    private const string Name = "Platform Owner";
    private const string Email = "owner@nurvia.internal";
    private const string Password = "BootstrapOwner-2026!";

    [Fact]
    public void Development_With_Explicit_OptIn_Is_Permitted()
    {
        Assert.Empty(BootstrapConfigurationValidator.Validate("Development", Name, Email, Password));
    }

    [Fact]
    public void Development_Without_OptIn_Is_Disabled_And_Permits_Normal_Startup()
    {
        Assert.Empty(BootstrapConfigurationValidator.Validate("Development", null, null, null));
        Assert.Empty(BootstrapConfigurationValidator.Validate("Development", "", "", ""));
    }

    [Fact]
    public void Test_Environment_Is_Permitted()
    {
        Assert.Empty(BootstrapConfigurationValidator.Validate("Test", Name, Email, Password));
    }

    [Theory]
    [InlineData("Staging")]
    [InlineData("staging")]
    [InlineData("STAGING")]
    public void Staging_With_Bootstrap_Enabled_Is_Rejected(string environment)
    {
        var errors = BootstrapConfigurationValidator.Validate(environment, Name, Email, Password);
        Assert.NotEmpty(errors);
    }

    [Fact]
    public void Production_With_Bootstrap_Enabled_Is_Rejected()
    {
        var errors = BootstrapConfigurationValidator.Validate("Production", Name, Email, Password);
        Assert.NotEmpty(errors);
    }

    [Fact]
    public void Production_With_Credentials_But_Disabled_Intent_Is_Still_Rejected()
    {
        // Credentials configured while the operator considers bootstrap "disabled":
        // startup must still be rejected so a dormant credential set can never
        // silently activate in production.
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate("Production", Name, Email, Password));
    }

    [Fact]
    public void Production_Without_Bootstrap_Configuration_Permits_Normal_Startup()
    {
        Assert.Empty(BootstrapConfigurationValidator.Validate("Production", null, null, null));
        Assert.Empty(BootstrapConfigurationValidator.Validate("Production", "", "", ""));
    }

    [Theory]
    [InlineData("Production")]
    [InlineData("Staging")]
    [InlineData("Development")]
    public void Partial_Configuration_Is_Always_Rejected(string environment)
    {
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate(environment, Name, null, null));
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate(environment, null, Email, null));
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate(environment, null, null, Password));
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate(environment, Name, Email, null));
    }

    [Fact]
    public void Short_Password_Is_Rejected_In_Permitted_Environments()
    {
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate("Development", Name, Email, "short"));
    }

    [Fact]
    public void Unspecified_Environment_Is_Rejected_When_Configured()
    {
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate(null, Name, Email, Password));
        Assert.NotEmpty(BootstrapConfigurationValidator.Validate("", Name, Email, Password));
    }
}
