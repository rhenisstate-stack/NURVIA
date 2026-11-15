using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Accounts;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

[Collection("PostgresIntegration")]
public class ProductModulesTests
{
    private static NurviaDbContext CreateDbContext()
    {
        var conn = DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString();
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseNpgsql(conn)
            .Options;
        return new NurviaDbContext(options);
    }

    [Fact]
    public async Task FlashcardsService_EnforcesOwnershipAndSm2Scheduling()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
        await ProductModulesSeeder.SeedAsync(db);

        var service = new FlashcardsService(db);
        var userA = $"fc-a-{Guid.NewGuid():N}";
        var userB = $"fc-b-{Guid.NewGuid():N}";

        var (created, err) = await service.CreateAsync(
            userA,
            new CreateFlashcardRequest("Pharmacology", "RN", "Antidote for Warfarin?", "Vitamin K (Phytonadione)", "Coagulation"));
        Assert.Null(err);
        Assert.NotNull(created);

        // User B cannot see or delete User A's personal flashcard
        var userBCards = await service.GetFlashcardsAsync(userB, null, false);
        Assert.DoesNotContain(userBCards, c => c.Id == created!.Id);
        Assert.False(await service.DeleteAsync(userB, created!.Id));

        // SM-2 review updates interval and repetitions
        var (reviewed1, rErr1, notFound1) = await service.ReviewAsync(userA, created.Id, "Good");
        Assert.False(notFound1);
        Assert.Null(rErr1);
        Assert.Equal(1, reviewed1!.Repetitions);
        Assert.Equal(1, reviewed1.IntervalDays);

        var (reviewed2, rErr2, _) = await service.ReviewAsync(userA, created.Id, "Good");
        Assert.Null(rErr2);
        Assert.Equal(2, reviewed2!.Repetitions);
        Assert.Equal(6, reviewed2.IntervalDays);

        Assert.True(await service.DeleteAsync(userA, created.Id));
    }

    [Fact]
    public async Task CarePlansAndStudyGuides_SupportPersistenceAndOwnership()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
        await ProductModulesSeeder.SeedAsync(db);

        var careService = new CarePlansService(db);
        var userA = $"cp-a-{Guid.NewGuid():N}";
        var userB = $"cp-b-{Guid.NewGuid():N}";

        var (plan, err) = await careService.CreateAsync(userA, new CreateCarePlanRequest(
            "Sepsis Bundle",
            "Critical Care",
            "Ineffective Tissue Perfusion related to distributive shock",
            "Systemic inflammatory response",
            new[] { "MAP >= 65 mmHg" },
            new[] { "Administer 30 mL/kg crystalloid bolus", "Obtain blood cultures before broad-spectrum antibiotics" },
            "Early goal-directed perfusion prevents multiorgan failure."));
        Assert.Null(err);
        Assert.NotNull(plan);

        Assert.False(await careService.DeleteAsync(userB, plan!.Id));
        Assert.True(await careService.DeleteAsync(userA, plan.Id));

        var guideService = new StudyGuidesService(db);
        var guides = await guideService.GetGuidesAsync(false, null, null, null);
        Assert.NotEmpty(guides);
    }

    [Fact]
    public async Task CommunityService_PersistsPostsRepliesAndLikes()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();

        var service = new CommunityService(db);
        var userA = $"comm-a-{Guid.NewGuid():N}";
        var userB = $"comm-b-{Guid.NewGuid():N}";

        var (post, err) = await service.CreatePostAsync(userA, "Nurse A", new CreateCommunityPostRequest(
            "nclex-cohorts", "Spring Cohort", "ABG Practice Tip", "Always check pH first, then ROME!"));
        Assert.Null(err);
        Assert.NotNull(post);

        var (reply, rErr, notFound) = await service.AddReplyAsync(userB, "Nurse B", post!.Id, "ROME saved me on Med-Surg!");
        Assert.False(notFound);
        Assert.Null(rErr);
        Assert.NotNull(reply);

        var (liked, count, _) = await service.ToggleLikeAsync(userB, post.Id);
        Assert.True(liked);
        Assert.Equal(1, count);

        var (unliked, count2, _) = await service.ToggleLikeAsync(userB, post.Id);
        Assert.False(unliked);
        Assert.Equal(0, count2);

        // User B cannot delete User A's post
        Assert.False(await service.DeletePostAsync(userB, false, post.Id));
        Assert.True(await service.DeletePostAsync(userA, false, post.Id));
    }

    [Fact]
    public async Task TutorChatService_EnforcesOwnershipAndFailsClosedWhenExternalRequired()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
        await ProductModulesSeeder.SeedAsync(db);

        var defaultConfig = new ConfigurationBuilder().Build();
        var service = new TutorChatService(db, defaultConfig);
        var userA = $"tut-a-{Guid.NewGuid():N}";
        var userB = $"tut-b-{Guid.NewGuid():N}";

        var (session, err) = await service.CreateSessionAsync(userA, new CreateTutorSessionRequest("Lithium", "RN", "Pharmacology"));
        Assert.Null(err);
        Assert.NotNull(session);

        // Ownership isolation
        Assert.Null(await service.GetSessionAsync(userB, session!.Id));

        var (updated, msgErr, notFound, unavailable) = await service.SendMessageAsync(userA, session.Id, "Client has tremor on lithium");
        Assert.False(notFound);
        Assert.False(unavailable);
        Assert.Null(msgErr);
        Assert.Equal(3, updated!.Messages!.Count); // Welcome + User + Assistant

        // Fail-closed when RequireExternalProvider=true and no ApiKey
        var strictConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["AiTutor:RequireExternalProvider"] = "true" })
            .Build();
        var strictService = new TutorChatService(db, strictConfig);
        var (_, strictErr, _, strictUnavailable) = await strictService.SendMessageAsync(userA, session.Id, "Check potassium");
        Assert.True(strictUnavailable);
        Assert.NotNull(strictErr);

        Assert.True(await service.DeleteSessionAsync(userA, session.Id));
    }

    [Fact]
    public async Task SubscriptionsService_GrantsRevokesAndVerifiesWebhooksFailClosed()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
        await ProductModulesSeeder.SeedAsync(db);

        var secret = "test-webhook-secret-2026";
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Billing:WebhookSecret"] = secret })
            .Build();
        var service = new SubscriptionsService(db, config);

        // Webhook signature verification
        var payload = "{\"event\":\"invoice.paid\"}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var validSig = "sha256=" + Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
        Assert.True(service.VerifyWebhookSignature(payload, validSig));
        Assert.False(service.VerifyWebhookSignature(payload, "sha256=invalid"));

        // Grant and revoke entitlement for a persisted user
        var user = new UserAccount("Sub Learner", $"sub-{Guid.NewGuid():N}@nurvia.test", "hash");
        db.UserAccounts.Add(user);
        await db.SaveChangesAsync();

        var plans = await service.GetPlansAsync(false);
        var proPlan = plans.First(p => p.Code == "PRO_MONTHLY");

        var (granted, gErr) = await service.GrantEntitlementAsync("admin-1", new GrantEntitlementRequest(user.Id.ToString(), proPlan.Id, 30, "Pilot"));
        Assert.Null(gErr);
        Assert.NotNull(granted);
        Assert.Equal("PRO_MONTHLY", granted!.PlanCode);

        var active = await service.GetActiveSubscriptionAsync(user.Id.ToString());
        Assert.NotNull(active);
        Assert.Equal("PRO_MONTHLY", active!.PlanCode);

        Assert.True(await service.RevokeEntitlementAsync("admin-1", granted.Id));
        Assert.Null(await service.GetActiveSubscriptionAsync(user.Id.ToString()));
    }

    [Fact]
    public async Task StaffInvitationService_EnforcesRolePolicyAndSingleUse()
    {
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();

        var service = new StaffInvitationService(db, new Pbkdf2PasswordHasher());
        var email = $"invited-{Guid.NewGuid():N}@nurvia.test";

        // Administrator cannot invite Superadmin
        var (denied, deniedErr) = await service.CreateInvitationAsync(email, "Superadmin", "admin-1", "Administrator", true);
        Assert.Null(denied);
        Assert.NotNull(deniedErr);

        // Administrator can invite Author
        var (created, err) = await service.CreateInvitationAsync(email, "Author", "admin-1", "Administrator", true);
        Assert.Null(err);
        Assert.NotNull(created?.DevInviteToken);

        // Accept invitation once
        var (accepted, accErr) = await service.AcceptInvitationAsync(created!.DevInviteToken!, "Invited Author", "StrongStaffPass-2026!");
        Assert.True(accepted, accErr);

        // Replay must fail
        var (replay, replayErr) = await service.AcceptInvitationAsync(created.DevInviteToken!, "Replay", "StrongStaffPass-2026!");
        Assert.False(replay);
        Assert.NotNull(replayErr);
    }
}
