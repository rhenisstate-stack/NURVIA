using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Auditing;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntityId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.ActorId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.ActorName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.ActorRole)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.ChangesSummary)
            .IsRequired();

        builder.HasIndex(a => new { a.EntityType, a.EntityId });
        builder.HasIndex(a => a.TimestampUtc);
    }
}
