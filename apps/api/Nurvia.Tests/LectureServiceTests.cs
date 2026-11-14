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

    private static CurrentUser AuthenticatedUser(string role, string? name = null) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Name = name ?? $"Test {role}",
        Email = $"{role.ToLowerInvariant()}@nurvia.test",
        Role = role,
        IsAuthenticated = true
    };

    private static LecturesController CreateController(ILectureService service, string? role, string? name = null)
    {
        var controller = new LecturesController(service);
        var httpContext = new DefaultHttpContext();

        if (role != null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, name ?? $"Test {role}"),
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
    public async Task LectureSeeder_DefaultStartup_SeedsTwelveDraftsIdempotentlyAndPreservesExisting()
    {
        await using var context = CreateInMemoryContext();

        // Pre-existing admin-authored lecture 1 that was rejected
        var existing = new Lecture(
            1,
            "acid-base-ventilator-alarms",
            "Custom Lecture 1",
            "Critical Care",
            "Custom summary",
            "## Custom body",
            new[] { "Custom concept" },
            LectureAccessLevel.Public,
            "Admin Author");
        existing.SubmitForReview("Admin Author");
        existing.Reject("rev-1", "Reviewer", "Needs citations");
        context.Lectures.Add(existing);
        await context.SaveChangesAsync();

        await LectureSeeder.SeedAsync(context);
        await LectureSeeder.SeedAsync(context); // Repeated execution must be idempotent

        var lectures = await context.Lectures
            .OrderBy(l => l.Number)
            .ToListAsync();

        Assert.Equal(12, lectures.Count);
        Assert.Equal(Enumerable.Range(1, 12), lectures.Select(l => l.Number));
        // Existing rejected lecture must not be overwritten or promoted
        Assert.Equal("Custom Lecture 1", lectures[0].Title);
        Assert.Equal(ContentStatus.Rejected, lectures[0].Status);
        // Newly seeded lectures default to Draft (never auto-published on default startup)
        Assert.All(lectures.Skip(1), l => Assert.Equal(ContentStatus.Draft, l.Status));
        Assert.All(lectures.Where(l => l.Number <= 3), l => Assert.Equal(LectureAccessLevel.Public, l.AccessLevel));
        Assert.All(lectures.Where(l => l.Number >= 4), l => Assert.Equal(LectureAccessLevel.AuthenticatedLearner, l.AccessLevel));
    }

    [Theory]
    [InlineData(false, "")]
    [InlineData(true, "")]
    [InlineData(true, "   ")]
    [InlineData(true, "InvalidRole")]
    [InlineData(true, "Author")]
    [InlineData(true, "Reviewer")]
    [InlineData(true, "Publisher")]
    public async Task GetPublishedCatalogue_NonLearnerCallers_WithholdsProtectedHighYieldConcepts(
        bool isAuthenticated,
        string role)
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);
        var service = new LectureService(context, new StubAuditService());

        var caller = isAuthenticated ? AuthenticatedUser(role) : AnonymousUser();
        var catalogue = await service.GetPublishedCatalogueAsync(caller);

        Assert.Equal(12, catalogue.Count);
        Assert.All(catalogue.Where(l => l.Number <= 3), item => Assert.NotEmpty(item.HighYieldConcepts));
        Assert.All(catalogue.Where(l => l.Number >= 4), item => Assert.Empty(item.HighYieldConcepts));
    }

    [Fact]
    public async Task GetPublishedCatalogue_AuthenticatedLearner_ReceivesAllHighYieldConcepts()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);
        var service = new LectureService(context, new StubAuditService());

        var catalogue = await service.GetPublishedCatalogueAsync(AuthenticatedUser("Learner"));

        Assert.Equal(12, catalogue.Count);
        Assert.All(catalogue, item => Assert.NotEmpty(item.HighYieldConcepts));
    }

    [Fact]
    public async Task GetPublishedBySlug_EnforcesAccessPolicyForPublicAndProtectedLectures()
    {
        await using var context = CreateInMemoryContext();
        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);
        var service = new LectureService(context, new StubAuditService());

        var publicLecture = await service.GetPublishedBySlugAsync("acid-base-ventilator-alarms", AnonymousUser());
        Assert.NotNull(publicLecture);
        Assert.NotEmpty(publicLecture!.BodyMarkdown);

        // Anonymous, role-less, invalid-role, and non-learner staff cannot use learner endpoint for lectures 4-12
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetPublishedBySlugAsync("cardiac-telemetry-chest-tubes", AnonymousUser()));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetPublishedBySlugAsync("cardiac-telemetry-chest-tubes", AuthenticatedUser("")));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetPublishedBySlugAsync("cardiac-telemetry-chest-tubes", AuthenticatedUser("Author")));

        var learnerLecture = await service.GetPublishedBySlugAsync(
            "cardiac-telemetry-chest-tubes",
            AuthenticatedUser("Learner"));
        Assert.NotNull(learnerLecture);
        Assert.NotEmpty(learnerLecture!.BodyMarkdown);
    }

    [Fact]
    public async Task LectureLifecycle_TransitionsRejectionSelfApprovalAndImmutabilityAreEnforced()
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

        // Duplicate number or slug rejected
        await Assert.ThrowsAsync<DomainException>(() =>
            service.CreateDraftAsync(
                new CreateLectureRequest
                {
                    Number = 1,
                    Slug = "other-slug",
                    Title = "Dup Num",
                    Category = "Critical Care",
                    Summary = "Summary",
                    BodyMarkdown = "## Body",
                    HighYieldConcepts = new List<string> { "Concept" },
                    AccessLevel = LectureAccessLevel.Public
                },
                "Author One"));

        await Assert.ThrowsAsync<DomainException>(() =>
            service.CreateDraftAsync(
                new CreateLectureRequest
                {
                    Number = 2,
                    Slug = "test-lecture",
                    Title = "Dup Slug",
                    Category = "Critical Care",
                    Summary = "Summary",
                    BodyMarkdown = "## Body",
                    HighYieldConcepts = new List<string> { "Concept" },
                    AccessLevel = LectureAccessLevel.Public
                },
                "Author One"));

        // Illegal transitions from Draft
        await Assert.ThrowsAsync<DomainException>(() => service.PublishAsync(draft.Id, "Publisher One"));
        await Assert.ThrowsAsync<DomainException>(() => service.ArchiveAsync(draft.Id, "Publisher One"));

        var pending = await service.SubmitForReviewAsync(draft.Id, "Author One");
        Assert.Equal(ContentStatus.PendingReview, pending.Status);

        // Self-approval blocked
        await Assert.ThrowsAsync<DomainException>(() =>
            service.ReviewAsync(
                draft.Id,
                new ReviewLectureRequest { Decision = ReviewDecision.Approved, Comments = "Self" },
                "auth-1",
                "Author One"));

        // Rejection and re-edit
        var rejected = await service.ReviewAsync(
            draft.Id,
            new ReviewLectureRequest { Decision = ReviewDecision.Rejected, Comments = "Expand ABG table" },
            "rev-1",
            "Reviewer One");
        Assert.Equal(ContentStatus.Rejected, rejected.Status);

        // Cannot publish rejected lecture
        await Assert.ThrowsAsync<DomainException>(() => service.PublishAsync(draft.Id, "Publisher One"));

        var updated = await service.UpdateDraftAsync(
            draft.Id,
            new UpdateLectureRequest
            {
                Slug = "test-lecture",
                Title = "Test Lecture Revised",
                Category = "Critical Care",
                Summary = "Summary text",
                BodyMarkdown = "## Revised Body",
                HighYieldConcepts = new List<string> { "Concept 1" },
                AccessLevel = LectureAccessLevel.Public
            },
            "Author One");
        Assert.Equal(ContentStatus.Draft, updated.Status);

        await service.SubmitForReviewAsync(draft.Id, "Author One");
        var approved = await service.ReviewAsync(
            draft.Id,
            new ReviewLectureRequest { Decision = ReviewDecision.Approved, Comments = "Clinically accurate" },
            "rev-1",
            "Reviewer One");
        Assert.Equal(ContentStatus.Approved, approved.Status);

        var published = await service.PublishAsync(draft.Id, "Publisher One");
        Assert.Equal(ContentStatus.Published, published.Status);

        // Published content is immutable
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
        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);
        var service = new LectureService(context, new StubAuditService());

        // Anonymous -> 401
        var anonController = CreateController(service, null);
        Assert.IsType<UnauthorizedObjectResult>((await anonController.GetPublishedLecture("cardiac-telemetry-chest-tubes", CancellationToken.None)).Result);
        Assert.IsType<UnauthorizedObjectResult>((await anonController.GetManagementLectures(CancellationToken.None)).Result);

        // Learner -> 403 on management
        var learnerController = CreateController(service, "Learner");
        var learnerMgmt = Assert.IsType<ObjectResult>((await learnerController.GetManagementLectures(CancellationToken.None)).Result);
        Assert.Equal(StatusCodes.Status403Forbidden, learnerMgmt.StatusCode);

        // Author -> can access management preview, cannot review/publish/archive
        var authorController = CreateController(service, "Author");
        Assert.IsType<OkObjectResult>((await authorController.GetManagementLectures(CancellationToken.None)).Result);

        var authorReview = Assert.IsType<ObjectResult>((await authorController.Review(
            Guid.NewGuid(),
            new ReviewLectureRequest { Decision = ReviewDecision.Approved },
            CancellationToken.None)).Result);
        Assert.Equal(StatusCodes.Status403Forbidden, authorReview.StatusCode);

        var authorPublish = Assert.IsType<ObjectResult>((await authorController.Publish(Guid.NewGuid(), CancellationToken.None)).Result);
        Assert.Equal(StatusCodes.Status403Forbidden, authorPublish.StatusCode);

        var authorArchive = Assert.IsType<ObjectResult>((await authorController.Archive(Guid.NewGuid(), CancellationToken.None)).Result);
        Assert.Equal(StatusCodes.Status403Forbidden, authorArchive.StatusCode);

        // Reviewer -> cannot publish or archive
        var reviewerController = CreateController(service, "Reviewer");
        var reviewerPublish = Assert.IsType<ObjectResult>((await reviewerController.Publish(Guid.NewGuid(), CancellationToken.None)).Result);
        Assert.Equal(StatusCodes.Status403Forbidden, reviewerPublish.StatusCode);
    }

    [Fact]
    public async Task LectureSeeder_PreservesPublishedArchivedAndEditedRecords_AndRepairsPartialSeedWithoutDuplicates()
    {
        await using var context = CreateInMemoryContext();

        // Pre-existing published lecture with custom edits on #2
        var published = new Lecture(
            2,
            "endocrine-diabetes-thyroid-adrenal",
            "Edited Endocrine Title",
            "Endocrinology",
            "Edited summary",
            "## Edited body",
            new[] { "Edited concept" },
            LectureAccessLevel.Public,
            "Author A");
        published.SubmitForReview("Author A");
        published.Approve("rev-1", "Reviewer", "Approved");
        published.Publish("Publisher");

        // Pre-existing archived lecture with custom slug collision on #3
        var archived = new Lecture(
            3,
            "cardiac-drugs-electrolytes",
            "Archived Cardiac Title",
            "Cardiology",
            "Archived summary",
            "## Archived body",
            new[] { "Archived concept" },
            LectureAccessLevel.Public,
            "Author B");
        archived.SubmitForReview("Author B");
        archived.Approve("rev-1", "Reviewer", "Approved");
        archived.Publish("Publisher");
        archived.Archive("Publisher");

        // Pre-existing draft on #12 with matching slug from #4 to verify slug + number deduplication
        var slugCollision = new Lecture(
            12,
            "cardiac-telemetry-chest-tubes",
            "Custom Slug Collision",
            "Cardiology",
            "Custom summary",
            "## Custom body",
            new[] { "Custom concept" },
            LectureAccessLevel.AuthenticatedLearner,
            "Author C");

        context.Lectures.AddRange(published, archived, slugCollision);
        await context.SaveChangesAsync();

        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);
        await LectureSeeder.SeedAsync(context, publishPreApprovedCatalogue: true);

        var lectures = await context.Lectures.OrderBy(l => l.Number).ToListAsync();

        // #4 is skipped due to slug collision with #12, #12 is skipped due to number collision -> 11 total
        Assert.Equal(11, lectures.Count);
        Assert.Equal(lectures.Count, lectures.Select(l => l.Number).Distinct().Count());
        Assert.Equal(lectures.Count, lectures.Select(l => l.Slug.ToLowerInvariant()).Distinct().Count());

        var reloadedPublished = lectures.Single(l => l.Number == 2);
        Assert.Equal(ContentStatus.Published, reloadedPublished.Status);
        Assert.Equal("Edited Endocrine Title", reloadedPublished.Title);
        Assert.Equal("## Edited body", reloadedPublished.BodyMarkdown);

        var reloadedArchived = lectures.Single(l => l.Number == 3);
        Assert.Equal(ContentStatus.Archived, reloadedArchived.Status);
        Assert.Equal("Archived Cardiac Title", reloadedArchived.Title);

        var reloadedCollision = lectures.Single(l => l.Number == 12);
        Assert.Equal(ContentStatus.Draft, reloadedCollision.Status);
    }
}
