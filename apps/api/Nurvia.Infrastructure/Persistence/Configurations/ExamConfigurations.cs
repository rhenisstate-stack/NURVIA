using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Exams;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("Exams");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(e => e.Code)
            .IsUnique();

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(e => e.Description)
            .IsRequired();

        builder.Property(e => e.Pathway)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.Category)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.ModeAllowed)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.PassingScorePercentage)
            .HasPrecision(5, 2);

        builder.Property(e => e.School)
            .HasMaxLength(150);

        builder.Property(e => e.Season)
            .HasMaxLength(50);

        builder.Property(e => e.Subject)
            .HasMaxLength(150);

        builder.Property(e => e.Topic)
            .HasMaxLength(150);

        builder.Property(e => e.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.LearningObjectives)
            .HasColumnType("text[]")
            .HasDefaultValueSql("'{}'::text[]")
            .IsRequired();

        builder.HasIndex(e => new { e.Status, e.Pathway, e.Category });
        builder.HasIndex(e => e.School);
        builder.HasIndex(e => e.AcademicYear);
        builder.HasIndex(e => e.Season);
        builder.HasIndex(e => e.Subject);

        builder.Property(e => e.ConcurrencyToken)
            .IsConcurrencyToken();

        builder.Property(e => e.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(100);

        builder.HasMany(e => e.Versions)
            .WithOne(v => v.Exam)
            .HasForeignKey(v => v.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.CurrentVersion)
            .WithMany()
            .HasForeignKey(e => e.CurrentVersionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ExamVersionConfiguration : IEntityTypeConfiguration<ExamVersion>
{
    public void Configure(EntityTypeBuilder<ExamVersion> builder)
    {
        builder.ToTable("ExamVersions");

        builder.HasKey(v => v.Id);

        builder.HasIndex(v => new { v.ExamId, v.VersionNumber })
            .IsUnique();

        builder.Property(v => v.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(v => v.Description)
            .IsRequired();

        builder.Property(v => v.Instructions)
            .IsRequired();

        builder.Property(v => v.PassingScorePercentage)
            .HasPrecision(5, 2);

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(v => v.ReviewReleasePolicy)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(v => v.AllowedLayouts)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(v => v.DefaultLayout)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(v => v.ReviewReleasedAtUtc);

        builder.Property(v => v.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.UpdatedBy)
            .HasMaxLength(100);

        builder.HasOne(v => v.Blueprint)
            .WithOne(b => b.ExamVersion)
            .HasForeignKey<ExamBlueprint>(b => b.ExamVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.ExamQuestions)
            .WithOne(eq => eq.ExamVersion)
            .HasForeignKey(eq => eq.ExamVersionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ExamBlueprintConfiguration : IEntityTypeConfiguration<ExamBlueprint>
{
    public void Configure(EntityTypeBuilder<ExamBlueprint> builder)
    {
        builder.ToTable("ExamBlueprints");

        builder.HasKey(b => b.Id);
    }
}

public class ExamQuestionConfiguration : IEntityTypeConfiguration<ExamQuestion>
{
    public void Configure(EntityTypeBuilder<ExamQuestion> builder)
    {
        builder.ToTable("ExamQuestions");

        builder.HasKey(eq => eq.Id);

        builder.HasOne(eq => eq.Question)
            .WithMany()
            .HasForeignKey(eq => eq.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(eq => eq.QuestionVersion)
            .WithMany()
            .HasForeignKey(eq => eq.QuestionVersionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class SavedStudySetConfiguration : IEntityTypeConfiguration<SavedStudySet>
{
    public void Configure(EntityTypeBuilder<SavedStudySet> builder)
    {
        builder.ToTable("SavedStudySets");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.UserId)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(s => new { s.UserId, s.ExamId })
            .IsUnique();

        builder.HasOne(s => s.Exam)
            .WithMany()
            .HasForeignKey(s => s.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ExamReviewConfiguration : IEntityTypeConfiguration<ExamReview>
{
    public void Configure(EntityTypeBuilder<ExamReview> builder)
    {
        builder.ToTable("ExamReviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.LearnerId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.LearnerName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(r => r.Comment)
            .HasMaxLength(1000);

        builder.HasIndex(r => new { r.ExamId, r.LearnerId })
            .IsUnique();

        builder.HasIndex(r => new { r.ExamId, r.IsApproved });

        builder.HasOne(r => r.Exam)
            .WithMany()
            .HasForeignKey(r => r.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
