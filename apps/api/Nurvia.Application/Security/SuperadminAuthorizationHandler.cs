using Microsoft.AspNetCore.Authorization;

namespace Nurvia.Application.Security;

public class SuperadminAuthorizationHandler : AuthorizationHandler<SuperadminRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SuperadminRequirement requirement)
    {
        if (context.User.IsInRole("Superadmin"))
        {
            context.Succeed(requirement);
        }
        
        return Task.CompletedTask;
    }
}

public class SuperadminRequirement : IAuthorizationRequirement
{
}