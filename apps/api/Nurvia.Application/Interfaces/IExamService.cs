using Nurvia.Application.Common;
using Nurvia.Application.Exams;

namespace Nurvia.Application.Interfaces;

public interface IExamService
{
    Task<PagedResult<ExamDto>> GetExamsAsync(ExamFilterRequest filter, CancellationToken ct = default);
    Task<ExamDto?> GetExamByIdAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> CreateExamAsync(CreateExamRequest request, string author, CancellationToken ct = default);
    Task<ExamDto> ConfigureExamAsync(Guid id, ConfigureExamRequest request, string author, CancellationToken ct = default);
    Task<List<string>> ValidateExamAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> SubmitForReviewAsync(Guid id, string actor, CancellationToken ct = default);
    Task<ExamDto> ApproveExamAsync(Guid id, string reviewerName, string comments, CancellationToken ct = default);
    Task<ExamDto> PublishExamAsync(Guid id, string publisher, CancellationToken ct = default);
    Task<ExamDto> ArchiveExamAsync(Guid id, string actor, CancellationToken ct = default);
    Task<ExamDto> ReleaseReviewAsync(Guid id, string actor, CancellationToken ct = default);
    Task<ExamDto> CreateNewVersionAsync(Guid id, string author, CancellationToken ct = default);
}
