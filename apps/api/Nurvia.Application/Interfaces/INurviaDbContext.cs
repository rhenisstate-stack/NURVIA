using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Interfaces;

public interface INurviaDbContext
{
    DbSet<UserAccount> UserAccounts { get; }
    DbSet<Question> Questions { get; }
    DbSet<QuestionVersion> QuestionVersions { get; }
    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<QuestionExhibit> QuestionExhibits { get; }
    DbSet<QuestionReview> QuestionReviews { get; }

    DbSet<Exam> Exams { get; }
    DbSet<ExamVersion> ExamVersions { get; }
    DbSet<ExamQuestion> ExamQuestions { get; }
    DbSet<ExamBlueprint> ExamBlueprints { get; }

    DbSet<Nurvia.Domain.Attempts.ExamAttempt> ExamAttempts { get; }
    DbSet<Nurvia.Domain.Attempts.AttemptResponse> AttemptResponses { get; }

    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
