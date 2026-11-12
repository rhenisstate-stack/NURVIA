using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Accounts;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public sealed class UserAccountConfiguration : IEntityTypeConfiguration<UserAccount>
{
    public void Configure(EntityTypeBuilder<UserAccount> builder)
    {
        builder.ToTable("UserAccounts");
        builder.HasKey(user => user.Id);

        builder.Property(user => user.Name).IsRequired().HasMaxLength(200);
        builder.Property(user => user.Email).IsRequired().HasMaxLength(320);
        builder.Property(user => user.NormalizedEmail).IsRequired().HasMaxLength(320);
        builder.Property(user => user.PasswordHash).IsRequired().HasMaxLength(256);
        builder.Property(user => user.Role).IsRequired().HasMaxLength(40);
        builder.Property(user => user.CreatedBy).IsRequired().HasMaxLength(100);
        builder.Property(user => user.UpdatedBy).HasMaxLength(100);
        builder.HasIndex(user => user.NormalizedEmail).IsUnique();
        // Integrity invariant: at most one Superadmin account may exist. The
        // filtered unique index makes concurrent bootstrap attempts fail at the
        // database level even if the application-level existence check races.
        builder.HasIndex(user => user.Role)
            .IsUnique()
            .HasFilter($"\"{nameof(UserAccount.Role)}\" = 'Superadmin'")
            .HasDatabaseName("IX_UserAccounts_Superadmin_Unique");

        // One-to-one profile relationship. The foreign key lives on UserProfile.UserId
        // (matching the AddUserProfile migration and the model snapshot). Without this
        // explicit mapping EF conventions invent a shadow "ProfileId" column on
        // UserAccounts that does not exist in the database and every UserAccounts
        // materialization fails.
        builder.HasOne(user => user.Profile)
            .WithOne()
            .HasForeignKey<UserProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
