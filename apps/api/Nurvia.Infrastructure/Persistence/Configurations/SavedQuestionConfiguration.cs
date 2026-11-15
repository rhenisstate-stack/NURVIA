using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nurvia.Domain.Questions;

namespace Nurvia.Infrastructure.Persistence.Configurations;

public sealed class SavedQuestionConfiguration : IEntityTypeConfiguration<SavedQuestion>
{
    public void Configure(EntityTypeBuilder<SavedQuestion> builder)
    {
        builder.ToTable("SavedQuestions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.SavedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.UserId, x.QuestionId }).IsUnique();
        builder.HasIndex(x => x.UserId);

        builder.HasOne(x => x.Question)
            .WithMany()
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
