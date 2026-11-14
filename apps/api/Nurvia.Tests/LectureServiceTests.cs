using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nurvia.Api.Controllers;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Lectures;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Lectures;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class LectureServiceTests
{
    private sealed class StubAuditService : IAuditService
    {
        public Task LogAsync(
            string entityType,
            string entityId,
            string action,
            string actorId,
            string actorName,
            string actorRole,
            string summary,
            CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private static NurviaDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase($"nurvia-lectures-{Guid.NewGuid()}")
            .Options;

        return new NurviaDbContext(options);
    }

    private static CurrentUser AnonymousUser() => new()
    {
        IsAuthenticated = false,
        Role = string.Empty,
        Name = "Anonymous"
    };

    private static CurrentUser AuthenticatedUser(string role) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Name = $"Test {role}",
        Email = $"{role.ToLowerInvariant()}@nurvia.test",
        Role = role,
        IsAuthenticated = true
    };

    private static LecturesController CreateController(ILectureService service, string? role)
    {
        var controller = new LecturesController(service);
        var httpContext = new DefaultHttpContext();

        if (role != null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, $"Test {role}"),
                new(ClaimTypes.Email, $"{role.ToLowerInvariant()}@nurvia.test"),
            };

            if (!string.IsNullOrWhiteSpace(role))
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }

        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        return controller;
    }

    [Fact]
    public async Task LectureSeeder_SeedsAllTwelvePublishedLecturesIdempotently()
    {
        await using var context = CreateInMemoryContext();

        await LectureSeeder.SeedAsync(context);
        await LectureSeeder.SeedAsync(context); // Must be idempotent

        var lectures = await context.Lectures
            .OrderBy(l => l.Number)
            .ToListAsync();

        Assert.Equal(12, lectures.Count);
        Assert.Equal(Enumerable.Range(1, 12), lectures.Select(l => l.Number));
        Assert.All(lectures, l => Assert.Equal(ContentStatus.Published, l.Status));
        Assert.All(lectures.Where(l => l.Number <= 3), l => Assert.Equal(LectureAccessLevel.Public, l.AccessLevel));
        Assert.All(lectures.Where(l => l.Number >= 4), l => Assert.Equal(LectureAccessLevel.AuthenticatedLearner, l.AccessLevel));
    }

    [Fact]
    public async Task GetPublishedCatalogue_PublicVisitor_WithholdsProtectedHighYieldConcepts()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context);
        var service = new LectureService(context, new StubAuditService());

        var catalogue = await service.GetPublishedCatalogueAsync(AnonymousUser());

        Assert.Equal(12, catalogue.Count);
        Assert.All(catalogue.Where(l => l.Number <= 3), item => Assert.NotEmpty(item.HighYieldConcepts));
        Assert.All(catalogue.Where(l => l.Number >= 4), item => Assert.Empty(item.HighYieldConcepts));
    }

    [Fact]
    public async Task GetPublishedCatalogue_AuthenticatedLearner_ReceivesAllHighYieldConcepts()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context);
        var service = new LectureService(context, new StubAuditService());

        var catalogue = await service.GetPublishedCatalogueAsync(AuthenticatedUser("Learner"));

        Assert.Equal(12, catalogue.Count);
        Assert.All(catalogue, item => Assert.NotEmpty(item.HighYieldConcepts));
    }

    [Fact]
    public async Task GetPublishedBySlug_EnforcesAccessPolicyForPublicAndProtectedLectures()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context);
        var service = new LectureService(context, new StubAuditService());

        var publicLecture = await service.GetPublishedBySlugAsync("acid-base-ventilator-alarms", AnonymousUser());
        Assert.NotNull(publicLecture);
        Assert.NotEmpty(publicLecture!.BodyMarkdown);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetPublishedBySlugAsync("cardiac-telemetry-chest-tubes", AnonymousUser()));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetPublishedBySlugAsync("cardiac-telemetry-chest-tubes", AuthenticatedUser("")));

        var learnerLecture = await service.GetPublishedBySlugAsync(
            "cardiac-telemetry-chest-tubes",
            AuthenticatedUser("Learner"));
        Assert.NotNull(learnerLecture);
        Assert.NotEmpty(learnerLecture!.BodyMarkdown);
    }

    [Fact]
    public async Task LectureLifecycle_TransitionsAndPublishedImmutabilityAreEnforced()
    {
        await using var context = CreateInMemoryContext();
        var service = new LectureService(context, new StubAuditService());

        var draft = await service.CreateDraftAsync(
            new CreateLectureRequest
            {
                Number = 1,
                Slug = "test-lecture",
                Title = "Test Lecture",
                Category = "Critical Care",
                Summary = "Summary text",
                BodyMarkdown = "## Body",
                HighYieldConcepts = new List<string> { "Concept 1" },
                AccessLevel = LectureAccessLevel.Public
            },
            "Author One");

        Assert.Equal(ContentStatus.Draft, draft.Status);

        var pending = await service.SubmitForReviewAsync(draft.Id, "Author One");
        Assert.Equal(ContentStatus.PendingReview, pending.Status);

        var approved = await service.ReviewAsync(
            draft.Id,
            new ReviewLectureRequest { Decision = ReviewDecision.Approved, Comments = "Clinically accurate" },
            "rev-1",
            "Reviewer One");
        Assert.Equal(ContentStatus.Approved, approved.Status);

        var published = await service.PublishAsync(draft.Id, "Publisher One");
        Assert.Equal(ContentStatus.Published, published.Status);

        await Assert.ThrowsAsync<DomainException>(() =>
            service.UpdateDraftAsync(
                draft.Id,
                new UpdateLectureRequest
                {
                    Slug = "test-lecture",
                    Title = "Mutated",
                    Category = "Critical Care",
                    Summary = "Summary text",
                    BodyMarkdown = "## Mutated",
                    HighYieldConcepts = new List<string> { "Concept 1" },
                    AccessLevel = LectureAccessLevel.Public
                },
                "Author One"));

        var archived = await service.ArchiveAsync(draft.Id, "Publisher One");
        Assert.Equal(ContentStatus.Archived, archived.Status);
    }

    [Fact]
    public async Task LecturesController_EnforcesRoleBoundariesAcrossManagementEndpoints()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context);
        var service = new LectureService(context, new StubAuditService());

        // Anonymous cannot access protected lecture or management
        var anonController = CreateController(service, null);
        var anonProtected = await anonController.GetPublishedLecture("cardiac-telemetry-chest-tubes", CancellationToken.None);
        Assert.IsType<UnauthorizedObjectResult>(anonProtected.Result);

        var anonMgmt = await anonController.GetManagementLectures(CancellationToken.None);
        Assert.IsType<UnauthorizedObjectResult>(anonMgmt.Result);

        // Learner cannot access management or create/publish
        var learnerController = CreateController(service, "Learner");
        var learnerMgmt = await learnerController.GetManagementLectures(CancellationToken.None);
        var learnerMgmtObj = Assert.IsType<ObjectResult>(learnerMgmt.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, learnerMgmtObj.StatusCode);

        // Author cannot review or publish
        var authorController = CreateController(service, "Author");
        var authorReview = await authorController.Review(
            Guid.NewGuid(),
            new ReviewLectureRequest { Decision = ReviewDecision.Approved },
            CancellationToken.None);
        var authorReviewObj = Assert.IsType<ObjectResult>(authorReview.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, authorReviewObj.StatusCode);

        var authorPublish = await authorController.Publish(Guid.NewGuid(), CancellationToken.None);
        var authorPublishObj = Assert.IsType<ObjectResult>(authorPublish.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, authorPublishObj.StatusCode);
    }
}
