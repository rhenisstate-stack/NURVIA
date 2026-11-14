using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Nurvia.Api.Common;
using Xunit;

namespace Nurvia.Tests;

public class UserContextTests
{
    [Fact]
    public void Unauthenticated_Request_Returns_Empty_Role_And_No_Access()
    {
        var context = new DefaultHttpContext();

        var currentUser = context.GetCurrentUser();

        Assert.False(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(currentUser.HasRole("Learner"));
        Assert.False(currentUser.HasRole("Author"));
        Assert.False(currentUser.HasRole("Administrator"));
    }

    [Fact]
    public void Authenticated_Identity_Without_Role_Claim_Does_Not_Default_To_Learner()
    {
        var context = CreateAuthenticatedContext();

        var currentUser = context.GetCurrentUser();

        Assert.True(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(currentUser.HasRole("Learner"));
        Assert.False(currentUser.HasRole("Author"));
        Assert.False(currentUser.HasRole("Administrator"));
        Assert.False(context.HasRole("Learner"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t")]
    public void Authenticated_Identity_With_Blank_Role_Claim_Has_No_Role_Access(string role)
    {
        var context = CreateAuthenticatedContext(role);

        var currentUser = context.GetCurrentUser();

        Assert.True(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(currentUser.HasRole("Learner"));
        Assert.False(currentUser.HasRole("Author"));
        Assert.False(currentUser.HasRole("Administrator"));
        Assert.False(context.HasRole("Learner"));
    }

    [Fact]
    public void Authenticated_Identity_With_Learner_Role_Claim_Retains_Learner_Access()
    {
        var context = CreateAuthenticatedContext("Learner");

        var currentUser = context.GetCurrentUser();

        Assert.True(currentUser.IsAuthenticated);
        Assert.Equal("Learner", currentUser.Role);
        Assert.True(currentUser.HasRole("Learner"));
        Assert.True(context.HasRole("Learner"));
        Assert.False(currentUser.HasRole("Author"));
        Assert.False(currentUser.HasRole("Administrator"));
    }

    private static DefaultHttpContext CreateAuthenticatedContext(string? role = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "test-user-01"),
            new(ClaimTypes.Name, "Security Test User"),
            new(ClaimTypes.Email, "security-test@nurvia.internal")
        };

        if (role is not null)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var identity = new ClaimsIdentity(claims, authenticationType: "Test");
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };

        return context;
    }
}
