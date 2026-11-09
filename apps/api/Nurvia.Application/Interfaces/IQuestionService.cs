using Nurvia.Application.Common;
using Nurvia.Application.Questions;

namespace Nurvia.Application.Interfaces;

public interface IQuestionService
{
    Task<PagedResult<QuestionDto>> GetQuestionsAsync(QuestionFilterRequest filter, CancellationToken ct = default);
    Task<QuestionDto?> GetQuestionByIdAsync(Guid id, CancellationToken ct = default);
    Task<QuestionDto> CreateDraftAsync(CreateQuestionRequest request, string author, CancellationToken ct = default);
    Task<QuestionDto> UpdateDraftAsync(Guid id, UpdateQuestionDraftRequest request, string author, CancellationToken ct = default);
    Task<List<string>> ValidateQuestionAsync(Guid id, CancellationToken ct = default);
    Task<QuestionDto> SubmitForReviewAsync(Guid id, string actor, CancellationToken ct = default);
    Task<QuestionDto> ReviewQuestionAsync(Guid id, QuestionReviewRequest request, string reviewerId, string reviewerName, CancellationToken ct = default);
    Task<QuestionDto> PublishQuestionAsync(Guid id, string publisher, CancellationToken ct = default);
    Task<QuestionDto> ArchiveQuestionAsync(Guid id, string actor, CancellationToken ct = default);
    Task<QuestionDto> CreateNewVersionAsync(Guid id, string author, CancellationToken ct = default);
}
