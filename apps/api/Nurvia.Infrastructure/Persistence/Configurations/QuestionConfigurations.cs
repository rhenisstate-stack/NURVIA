using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Questions;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(q => q.Code)
            .IsUnique();

        builder.Property(q => q.Pathway)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(q => q.Category)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(q => q.Subject)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(q => q.Topic)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(q => q.Subtopic)
            .HasMaxLength(150);

        builder.Property(q => q.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(q => q.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(q => q.ConcurrencyToken)
            .IsConcurrencyToken();

        builder.Property(q => q.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(q => q.UpdatedBy)
            .HasMaxLength(100);

        // One Question has many QuestionVersions
        builder.HasMany(q => q.Versions)
            .WithOne(v => v.Question)
            .HasForeignKey(v => v.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // CurrentVersion relationship
        builder.HasOne(q => q.CurrentVersion)
            .WithMany()
            .HasForeignKey(q => q.CurrentVersionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Question Reviews
        builder.HasMany(q => q.Reviews)
            .WithOne(r => r.Question)
            .HasForeignKey(r => r.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuestionVersionConfiguration : IEntityTypeConfiguration<QuestionVersion>
{
    public void Configure(EntityTypeBuilder<QuestionVersion> builder)
    {
        builder.ToTable("QuestionVersions");

        builder.HasKey(v => v.Id);

        builder.HasIndex(v => new { v.QuestionId, v.VersionNumber })
            .IsUnique();

        builder.Property(v => v.Stem)
            .IsRequired();

        builder.Property(v => v.GeneralRationale)
            .IsRequired();

        builder.Property(v => v.QuestionType)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(v => v.CognitiveSkill)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(v => v.ClientNeedCategory)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(v => v.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.UpdatedBy)
            .HasMaxLength(100);

        builder.HasMany(v => v.Options)
            .WithOne(o => o.QuestionVersion)
            .HasForeignKey(o => o.QuestionVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.Exhibits)
            .WithOne(e => e.QuestionVersion)
            .HasForeignKey(e => e.QuestionVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.Reviews)
            .WithOne(r => r.QuestionVersion)
            .HasForeignKey(r => r.QuestionVersionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuestionOptionConfiguration : IEntityTypeConfiguration<QuestionOption>
{
    public void Configure(EntityTypeBuilder<QuestionOption> builder)
    {
        builder.ToTable("QuestionOptions");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OptionIndex)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(o => o.OptionText)
            .IsRequired();

        builder.Property(o => o.SpecificRationale)
            .HasMaxLength(2000);
    }
}

public class QuestionExhibitConfiguration : IEntityTypeConfiguration<QuestionExhibit>
{
    public void Configure(EntityTypeBuilder<QuestionExhibit> builder)
    {
        builder.ToTable("QuestionExhibits");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Type)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Content)
            .IsRequired();
    }
}

public class QuestionReviewConfiguration : IEntityTypeConfiguration<QuestionReview>
{
    public void Configure(EntityTypeBuilder<QuestionReview> builder)
    {
        builder.ToTable("QuestionReviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReviewerId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.ReviewerName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(r => r.Decision)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(r => r.Comments)
            .IsRequired()
            .HasMaxLength(2000);
    }
}
