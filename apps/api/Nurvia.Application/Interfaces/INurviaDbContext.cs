using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Billing;
using Nurvia.Domain.Community;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Learning;
using Nurvia.Domain.Lectures;
using Nurvia.Domain.Questions;
using Nurvia.Domain.Tutor;

namespace Nurvia.Application.Interfaces;

public interface INurviaDbContext
{
    DbSet<UserAccount> UserAccounts { get; }
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<PasswordResetToken> PasswordResetTokens { get; }
    DbSet<StaffInvitation> StaffInvitations { get; }
    DbSet<StudyPlanTask> StudyPlanTasks { get; }
    DbSet<Flashcard> Flashcards { get; }
    DbSet<UserFlashcardProgress> UserFlashcardProgresses { get; }
    DbSet<CarePlan> CarePlans { get; }
    DbSet<StudyGuide> StudyGuides { get; }
    DbSet<CommunityPost> CommunityPosts { get; }
    DbSet<CommunityReply> CommunityReplies { get; }
    DbSet<CommunityPostLike> CommunityPostLikes { get; }
    DbSet<TutorChatSession> TutorChatSessions { get; }
    DbSet<TutorChatMessage> TutorChatMessages { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<UserSubscription> UserSubscriptions { get; }
    DbSet<Question> Questions { get; }
    DbSet<SavedQuestion> SavedQuestions { get; }
    DbSet<Lecture> Lectures { get; }
    DbSet<QuestionVersion> QuestionVersions { get; }
    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<QuestionExhibit> QuestionExhibits { get; }
    DbSet<QuestionReview> QuestionReviews { get; }

    DbSet<Exam> Exams { get; }
    DbSet<ExamVersion> ExamVersions { get; }
    DbSet<ExamQuestion> ExamQuestions { get; }
    DbSet<ExamBlueprint> ExamBlueprints { get; }
    DbSet<SavedStudySet> SavedStudySets { get; }
    DbSet<ExamReview> ExamReviews { get; }

    DbSet<Nurvia.Domain.Attempts.ExamAttempt> ExamAttempts { get; }
    DbSet<Nurvia.Domain.Attempts.AttemptResponse> AttemptResponses { get; }

    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
