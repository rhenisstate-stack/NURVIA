using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Attempts;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public class ExamAttemptConfiguration : IEntityTypeConfiguration<ExamAttempt>
{
    public void Configure(EntityTypeBuilder<ExamAttempt> builder)
    {
        builder.ToTable("ExamAttempts");

        builder.HasKey(a => a.Id);

        // NOTE: ExamAttempt.Status deliberately remains an integer column; converting it
        // to a string enum would require a destructive alter of existing attempt rows.

        builder.Property(a => a.DeliveryMode)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(a => a.LayoutMode)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(a => a.LearnerId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.LearnerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.ScorePercentage)
            .HasPrecision(5, 2);

        builder.Property(a => a.PassingScorePercentage)
            .HasPrecision(5, 2);

        builder.HasOne(a => a.Exam)
            .WithMany()
            .HasForeignKey(a => a.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.ExamVersion)
            .WithMany()
            .HasForeignKey(a => a.ExamVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Responses)
            .WithOne(r => r.ExamAttempt)
            .HasForeignKey(r => r.ExamAttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => new { a.LearnerId, a.ExamId, a.Status });
    }
}

public class AttemptResponseConfiguration : IEntityTypeConfiguration<AttemptResponse>
{
    public void Configure(EntityTypeBuilder<AttemptResponse> builder)
    {
        builder.ToTable("AttemptResponses");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.PointsAwarded)
            .HasPrecision(5, 2);

        builder.Property(r => r.MaxPoints)
            .HasPrecision(5, 2);

        builder.HasOne(r => r.Question)
            .WithMany()
            .HasForeignKey(r => r.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.QuestionVersion)
            .WithMany()
            .HasForeignKey(r => r.QuestionVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => new { r.ExamAttemptId, r.QuestionId }).IsUnique();
    }
}
