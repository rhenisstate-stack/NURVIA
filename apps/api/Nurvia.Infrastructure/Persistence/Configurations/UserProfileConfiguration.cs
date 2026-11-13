using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Enums;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("UserProfiles");
        builder.HasKey(profile => profile.Id);

        builder.Property(profile => profile.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(profile => profile.MiddleName).HasMaxLength(100);
        builder.Property(profile => profile.LastName).IsRequired().HasMaxLength(100);
        builder.Property(profile => profile.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(profile => profile.Biography).HasMaxLength(2000);
        builder.Property(profile => profile.PhoneNumber).HasMaxLength(20);
        builder.Property(profile => profile.Country).HasMaxLength(100);
        builder.Property(profile => profile.City).HasMaxLength(100);
        builder.Property(profile => profile.ProfessionalTitle).HasMaxLength(200);
        builder.Property(profile => profile.Organization).HasMaxLength(200);
        builder.Property(profile => profile.AvatarStorageKey).HasMaxLength(255);
        builder.Property(profile => profile.CreatedBy).IsRequired().HasMaxLength(100);
        builder.Property(profile => profile.UpdatedBy).HasMaxLength(100);

        // The pathway is stored as its enum name (RN / PN_LPN), matching the
        // string representation used for exam pathway columns. Null = undeclared.
        builder.Property(profile => profile.Pathway)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(profile => profile.UserId).IsUnique();
    }
}
