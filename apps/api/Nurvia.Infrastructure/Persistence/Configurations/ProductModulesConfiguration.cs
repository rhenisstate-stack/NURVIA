using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Billing;
using Nurvia.Domain.Community;
using Nurvia.Domain.Learning;
using Nurvia.Domain.Tutor;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public sealed class StaffInvitationConfiguration : IEntityTypeConfiguration<StaffInvitation>
{
    public void Configure(EntityTypeBuilder<StaffInvitation> builder)
    {
        builder.ToTable("StaffInvitations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Email).HasMaxLength(320).IsRequired();
        builder.Property(x => x.Role).HasMaxLength(40).IsRequired();
        builder.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
        builder.Property(x => x.InvitedByUserId).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.HasIndex(x => x.Email);
    }
}

public sealed class FlashcardConfiguration : IEntityTypeConfiguration<Flashcard>
{
    public void Configure(EntityTypeBuilder<Flashcard> builder)
    {
        builder.ToTable("Flashcards");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OwnerUserId).HasMaxLength(128);
        builder.Property(x => x.Category).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Pathway).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Front).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.Back).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.Hint).HasMaxLength(500);
        builder.HasIndex(x => new { x.IsSystemCard, x.OwnerUserId });
    }
}

public sealed class UserFlashcardProgressConfiguration : IEntityTypeConfiguration<UserFlashcardProgress>
{
    public void Configure(EntityTypeBuilder<UserFlashcardProgress> builder)
    {
        builder.ToTable("UserFlashcardProgresses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.LastRating).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => new { x.UserId, x.FlashcardId }).IsUnique();
        builder.HasIndex(x => new { x.UserId, x.NextReviewAtUtc });
    }
}

public sealed class CarePlanConfiguration : IEntityTypeConfiguration<CarePlan>
{
    public void Configure(EntityTypeBuilder<CarePlan> builder)
    {
        builder.ToTable("CarePlans");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OwnerUserId).HasMaxLength(128);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Specialty).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Diagnosis).HasMaxLength(500).IsRequired();
        builder.Property(x => x.RelatedTo).HasMaxLength(500).IsRequired();
        builder.Property(x => x.OutcomesText).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.InterventionsText).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.Rationale).HasMaxLength(2000).IsRequired();
        builder.HasIndex(x => new { x.Specialty, x.IsSystemPlan });
    }
}

public sealed class StudyGuideConfiguration : IEntityTypeConfiguration<StudyGuide>
{
    public void Configure(EntityTypeBuilder<StudyGuide> builder)
    {
        builder.ToTable("StudyGuides");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(240).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(240).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Pathway).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Summary).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.ContentMarkdown).IsRequired();
        builder.Property(x => x.CreatedByUserId).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
    }
}

public sealed class CommunityPostConfiguration : IEntityTypeConfiguration<CommunityPost>
{
    public void Configure(EntityTypeBuilder<CommunityPost> builder)
    {
        builder.ToTable("CommunityPosts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ChannelId).HasMaxLength(80).IsRequired();
        builder.Property(x => x.ChannelName).HasMaxLength(160).IsRequired();
        builder.Property(x => x.AuthorUserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.AuthorName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CohortLabel).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(240).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(4000).IsRequired();
        builder.HasIndex(x => new { x.ChannelId, x.CreatedAtUtc });
    }
}

public sealed class CommunityReplyConfiguration : IEntityTypeConfiguration<CommunityReply>
{
    public void Configure(EntityTypeBuilder<CommunityReply> builder)
    {
        builder.ToTable("CommunityReplies");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.AuthorUserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.AuthorName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(2000).IsRequired();
        builder.HasIndex(x => new { x.PostId, x.CreatedAtUtc });
    }
}

public sealed class CommunityPostLikeConfiguration : IEntityTypeConfiguration<CommunityPostLike>
{
    public void Configure(EntityTypeBuilder<CommunityPostLike> builder)
    {
        builder.ToTable("CommunityPostLikes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => new { x.PostId, x.UserId }).IsUnique();
    }
}

public sealed class TutorChatSessionConfiguration : IEntityTypeConfiguration<TutorChatSession>
{
    public void Configure(EntityTypeBuilder<TutorChatSession> builder)
    {
        builder.ToTable("TutorChatSessions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(240).IsRequired();
        builder.Property(x => x.Pathway).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Topic).HasMaxLength(120).IsRequired();
        builder.HasIndex(x => new { x.UserId, x.UpdatedAtUtc });
    }
}

public sealed class TutorChatMessageConfiguration : IEntityTypeConfiguration<TutorChatMessage>
{
    public void Configure(EntityTypeBuilder<TutorChatMessage> builder)
    {
        builder.ToTable("TutorChatMessages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Role).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(8000).IsRequired();
        builder.HasIndex(x => new { x.SessionId, x.CreatedAtUtc });
    }
}

public sealed class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("SubscriptionPlans");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).HasMaxLength(60).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.MonthlyPriceUsd).HasPrecision(10, 2);
        builder.Property(x => x.BillingInterval).HasMaxLength(40).IsRequired();
        builder.Property(x => x.FeaturesText).HasMaxLength(4000).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
{
    public void Configure(EntityTypeBuilder<UserSubscription> builder)
    {
        builder.ToTable("UserSubscriptions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Source).HasMaxLength(40).IsRequired();
        builder.Property(x => x.GrantedByUserId).HasMaxLength(128);
        builder.Property(x => x.Notes).HasMaxLength(500);
        builder.HasIndex(x => new { x.UserId, x.Status });
    }
}
