using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Common;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Infrastructure.Persistence;

public class NurviaDbContext : DbContext, INurviaDbContext
{
    public NurviaDbContext(DbContextOptions<NurviaDbContext> options)
        : base(options)
    {
    }

    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionVersion> QuestionVersions => Set<QuestionVersion>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<QuestionExhibit> QuestionExhibits => Set<QuestionExhibit>();
    public DbSet<QuestionReview> QuestionReviews => Set<QuestionReview>();

    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamVersion> ExamVersions => Set<ExamVersion>();
    public DbSet<ExamQuestion> ExamQuestions => Set<ExamQuestion>();
    public DbSet<ExamBlueprint> ExamBlueprints => Set<ExamBlueprint>();

    public DbSet<ExamAttempt> ExamAttempts => Set<ExamAttempt>();
    public DbSet<AttemptResponse> AttemptResponses => Set<AttemptResponse>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NurviaDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<IAuditableEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAtUtc == default)
                {
                    entry.Entity.CreatedAtUtc = DateTime.UtcNow;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
