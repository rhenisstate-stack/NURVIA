using Nurvia.Application.Lectures;
using Nurvia.Application.Security;

namespace Nurvia.Application.Interfaces;

public interface ILectureService
{
    Task<IReadOnlyList<LectureCatalogueItemDto>> GetPublishedCatalogueAsync(
        CancellationToken ct = default);

    Task<LectureContentDto?> GetPublishedBySlugAsync(
        string slug,
        CurrentUser user,
        CancellationToken ct = default);

    Task<IReadOnlyList<LectureManagementDto>> GetAllForManagementAsync(
        CancellationToken ct = default);

    Task<LectureManagementDto?> GetByIdForManagementAsync(
        Guid id,
        CancellationToken ct = default);

    Task<LectureManagementDto> CreateDraftAsync(
        CreateLectureRequest request,
        string author,
        CancellationToken ct = default);

    Task<LectureManagementDto> UpdateDraftAsync(
        Guid id,
        UpdateLectureRequest request,
        string actor,
        CancellationToken ct = default);

    Task<LectureManagementDto> SubmitForReviewAsync(
        Guid id,
        string actor,
        CancellationToken ct = default);

    Task<LectureManagementDto> ReviewAsync(
        Guid id,
        ReviewLectureRequest request,
        string reviewerId,
        string reviewerName,
        CancellationToken ct = default);

    Task<LectureManagementDto> PublishAsync(
        Guid id,
        string publisher,
        CancellationToken ct = default);

    Task<LectureManagementDto> ArchiveAsync(
        Guid id,
        string actor,
        CancellationToken ct = default);
}
