using Nurvia.Application.Common;
using Nurvia.Application.StudyLibrary;

namespace Nurvia.Application.Interfaces;

public interface IStudyLibraryService
{
    Task<PagedResult<StudySetCardDto>> GetCatalogAsync(StudyLibraryFilterRequest filter, string? learnerId, CancellationToken ct = default);
    Task<StudyLibraryFiltersDto> GetFiltersAsync(CancellationToken ct = default);
    Task<StudyLibrarySummaryDto> GetSummaryAsync(CancellationToken ct = default);
    Task<StudySetDetailDto?> GetStudySetDetailAsync(Guid examId, string? learnerId, CancellationToken ct = default);

    Task<List<StudySetCardDto>> GetSavedStudySetsAsync(string learnerId, CancellationToken ct = default);
    Task SaveStudySetAsync(Guid examId, string learnerId, CancellationToken ct = default);
    Task RemoveSavedStudySetAsync(Guid examId, string learnerId, CancellationToken ct = default);

    Task<PagedResult<ExamReviewDto>> GetReviewsAsync(Guid examId, int pageNumber = 1, int pageSize = 10, CancellationToken ct = default);
    Task<ExamReviewDto> SubmitReviewAsync(Guid examId, string learnerId, string learnerName, SubmitExamReviewRequest request, CancellationToken ct = default);
}
