using Nurvia.Application.Security;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// Unit tests for the backend role-assignment policy and the Superadmin
/// authorization invariants. These tests enforce the non-negotiable rule that
/// only a Superadmin may assign the Superadmin role.
/// </summary>
public class SuperadminAuthorizationTests
{
    // ---------------------------------------------------------------
    // Role-assignment policy matrix (Phase 2 required behavior)
    // ---------------------------------------------------------------

    [Theory]
    [InlineData(null, "Superadmin")]
    [InlineData("", "Superadmin")]
    [InlineData(" ", "Superadmin")]
    public void Unauthenticated_Or_Missing_Caller_Cannot_Assign_Any_Role(string? callerRole, string requestedRole)
    {
        Assert.False(RoleAssignmentPolicy.CanAssign(callerRole, requestedRole));
    }

    [Theory]
    [InlineData("Learner", "Superadmin")]
    [InlineData("Instructor", "Superadmin")]
    [InlineData("Author", "Superadmin")]
    [InlineData("Reviewer", "Superadmin")]
    [InlineData("Publisher", "Superadmin")]
    [InlineData("Learner", "Administrator")]
    [InlineData("Instructor", "Administrator")]
    [InlineData("Reviewer", "Administrator")]
    [InlineData("Publisher", "Administrator")]
    [InlineData("Instructor", "Author")]
    [InlineData("Reviewer", "Author")]
    [InlineData("Author", "Administrator")]
    public void Non_Administrative_Caller_Cannot_Assign_Roles(string callerRole, string requestedRole)
    {
        Assert.False(RoleAssignmentPolicy.CanAssign(callerRole, requestedRole));
    }

    [Fact]
    public void Administrator_Can_Assign_Permitted_Non_Superadmin_Roles()
    {
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Learner"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Instructor"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Author"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Reviewer"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Publisher"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Administrator", "Administrator"));
    }

    [Theory]
    [InlineData("Superadmin")]
    [InlineData("superadmin")]
    [InlineData("SUPERADMIN")]
    [InlineData("sUpErAdMiN")]
    public void Administrator_Cannot_Assign_Superadmin_Regardless_Of_Casing(string requestedRole)
    {
        Assert.False(RoleAssignmentPolicy.CanAssign("Administrator", requestedRole));
        Assert.False(RoleAssignmentPolicy.CanAssign("administrator", requestedRole));
        Assert.False(RoleAssignmentPolicy.CanAssign("ADMINISTRATOR", requestedRole));
    }

    [Fact]
    public void Superadmin_May_Assign_All_Roles_Including_Superadmin()
    {
        Assert.True(RoleAssignmentPolicy.CanAssign("Superadmin", "Superadmin"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Superadmin", "Administrator"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Superadmin", "Learner"));
        Assert.True(RoleAssignmentPolicy.CanAssign("Superadmin", "Author"));
    }

    [Theory]
    [InlineData("Root")]
    [InlineData("Owner")]
    [InlineData("God")]
    [InlineData("Learner ")]
    [InlineData("")]
    public void Unknown_Or_Invalid_Role_Identifiers_Are_Rejected(string requestedRole)
    {
        Assert.False(RoleAssignmentPolicy.CanAssign("Superadmin", requestedRole));
        Assert.False(RoleAssignmentPolicy.CanAssign("Administrator", requestedRole));
    }

    // ---------------------------------------------------------------
    // Superadmin role semantics (hasRole matrix)
    // ---------------------------------------------------------------

    [Fact]
    public void Superadmin_Role_Passes_All_Role_Checks()
    {
        var superadminUser = new CurrentUser
        {
            Id = "usr-superadmin-01",
            Name = "System Owner",
            Email = "superadmin@nurvia.internal",
            Role = "Superadmin",
            IsAuthenticated = true
        };

        Assert.True(superadminUser.HasRole("Superadmin"));
        Assert.True(superadminUser.HasRole("Administrator"));
        Assert.True(superadminUser.HasRole("Author"));
        Assert.True(superadminUser.HasRole("Reviewer"));
        Assert.True(superadminUser.HasRole("Publisher"));
    }

    [Fact]
    public void Administrator_Role_Never_Acts_As_Superadmin()
    {
        var adminUser = new CurrentUser
        {
            Id = "usr-admin-01",
            Name = "Lead Nurse Educator",
            Email = "admin@nurvia.internal",
            Role = "Administrator",
            IsAuthenticated = true
        };

        Assert.True(adminUser.HasRole("Author"));
        Assert.True(adminUser.HasRole("Reviewer"));
        Assert.True(adminUser.HasRole("Administrator"));

        // Non-negotiable security invariant: a regular administrator cannot
        // perform Superadmin-only actions.
        Assert.False(adminUser.HasRole("Superadmin"));
    }
}
