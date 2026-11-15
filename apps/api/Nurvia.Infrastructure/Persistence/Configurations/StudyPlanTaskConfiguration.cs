using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Accounts;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public sealed class StudyPlanTaskConfiguration : IEntityTypeConfiguration<StudyPlanTask>
{
    public void Configure(EntityTypeBuilder<StudyPlanTask> builder)
    {
        builder.ToTable("StudyPlanTasks");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(240).IsRequired();
        builder.Property(x => x.ScheduledForUtc).IsRequired();
        builder.Property(x => x.DurationMinutes).IsRequired();
        builder.Property(x => x.IsCompleted).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.UserId, x.ScheduledForUtc });
    }
}
