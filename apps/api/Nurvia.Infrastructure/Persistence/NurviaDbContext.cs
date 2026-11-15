using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Billing;
using Nurvia.Domain.Common;
using Nurvia.Domain.Community;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Learning;
using Nurvia.Domain.Lectures;
using Nurvia.Domain.Questions;
using Nurvia.Domain.Tutor;

namespace Nurvia.Infrastructure.Persistence;

public class NurviaDbContext : DbContext, INurviaDbContext
{
    public NurviaDbContext(DbContextOptions<NurviaDbContext> options)
        : base(options)
    {
    }

    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Lecture> Lectures => Set<Lecture>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<StaffInvitation> StaffInvitations => Set<StaffInvitation>();
    public DbSet<SavedQuestion> SavedQuestions => Set<SavedQuestion>();
    public DbSet<StudyPlanTask> StudyPlanTasks => Set<StudyPlanTask>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<UserFlashcardProgress> UserFlashcardProgresses => Set<UserFlashcardProgress>();
    public DbSet<CarePlan> CarePlans => Set<CarePlan>();
    public DbSet<StudyGuide> StudyGuides => Set<StudyGuide>();
    public DbSet<CommunityPost> CommunityPosts => Set<CommunityPost>();
    public DbSet<CommunityReply> CommunityReplies => Set<CommunityReply>();
    public DbSet<CommunityPostLike> CommunityPostLikes => Set<CommunityPostLike>();
    public DbSet<TutorChatSession> TutorChatSessions => Set<TutorChatSession>();
    public DbSet<TutorChatMessage> TutorChatMessages => Set<TutorChatMessage>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<QuestionVersion> QuestionVersions => Set<QuestionVersion>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<QuestionExhibit> QuestionExhibits => Set<QuestionExhibit>();
    public DbSet<QuestionReview> QuestionReviews => Set<QuestionReview>();

    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamVersion> ExamVersions => Set<ExamVersion>();
    public DbSet<ExamQuestion> ExamQuestions => Set<ExamQuestion>();
    public DbSet<ExamBlueprint> ExamBlueprints => Set<ExamBlueprint>();
    public DbSet<SavedStudySet> SavedStudySets => Set<SavedStudySet>();
    public DbSet<ExamReview> ExamReviews => Set<ExamReview>();

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
