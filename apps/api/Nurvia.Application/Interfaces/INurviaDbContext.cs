using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Interfaces;

public interface INurviaDbContext
{
    DbSet<Question> Questions { get; }
    DbSet<QuestionVersion> QuestionVersions { get; }
    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<QuestionExhibit> QuestionExhibits { get; }
    DbSet<QuestionReview> QuestionReviews { get; }

    DbSet<Exam> Exams { get; }
    DbSet<ExamVersion> ExamVersions { get; }
    DbSet<ExamQuestion> ExamQuestions { get; }
    DbSet<ExamBlueprint> ExamBlueprints { get; }

    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
