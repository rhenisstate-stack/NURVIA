using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;

namespace Nurvia.Api.Security;

public class JwtBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IJwtService _jwtService;
    private readonly INurviaDbContext _context;

    public JwtBearerAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IJwtService jwtService,
        INurviaDbContext context)
        : base(options, logger, encoder)
    {
        _jwtService = jwtService;
        _context = context;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var token = Request.Cookies["nurvia_session"];
        if (string.IsNullOrWhiteSpace(token) &&
            Request.Headers.TryGetValue("Authorization", out var authHeader) &&
            !string.IsNullOrWhiteSpace(authHeader))
        {
            var headerValue = authHeader.ToString().Trim();
            if (headerValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                token = headerValue["Bearer ".Length..].Trim();
        }

        if (string.IsNullOrWhiteSpace(token))
            return AuthenticateResult.NoResult();

        var principal = _jwtService.ValidateToken(token);

        if (principal == null)
            return AuthenticateResult.Fail("Invalid or expired authentication token.");

        var identity = principal.Identity as ClaimsIdentity;
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (identity == null || !Guid.TryParse(subject, out var userId))
            return AuthenticateResult.Fail("Invalid authenticated user.");

        var account = await _context.UserAccounts.SingleOrDefaultAsync(
            user => user.Id == userId && user.IsActive, Context.RequestAborted);
        if (account == null)
            return AuthenticateResult.Fail("The account is no longer active.");

        foreach (var claimType in new[]
                 {
                     ClaimTypes.NameIdentifier, "sub", ClaimTypes.Name, ClaimTypes.Email, ClaimTypes.Role
                 })
        {
            foreach (var claim in identity.FindAll(claimType).ToList())
                identity.RemoveClaim(claim);
        }

        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()));
        identity.AddClaim(new Claim("sub", account.Id.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.Name, account.Name));
        identity.AddClaim(new Claim(ClaimTypes.Email, account.Email));
        identity.AddClaim(new Claim(ClaimTypes.Role, account.Role));

        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return AuthenticateResult.Success(ticket);
    }
}
