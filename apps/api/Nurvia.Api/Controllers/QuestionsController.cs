using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;
    private readonly ILogger<QuestionsController> _logger;

    public QuestionsController(IQuestionService questionService, ILogger<QuestionsController> logger)
    {
        _questionService = questionService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<QuestionDto>>>> GetQuestions([FromQuery] QuestionFilterRequest filter, CancellationToken ct)
    {
        var result = await _questionService.GetQuestionsAsync(filter, ct);
        return Ok(ApiResponse<PagedResult<QuestionDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> GetQuestionById(Guid id, CancellationToken ct)
    {
        var question = await _questionService.GetQuestionByIdAsync(id, ct);
        if (question == null)
            return NotFound(ApiResponse<QuestionDto>.Error($"Question with ID '{id}' was not found."));

        return Ok(ApiResponse<QuestionDto>.Ok(question));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> CreateDraft([FromBody] CreateQuestionRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to create question drafts."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Authors and Administrators can create question drafts."));

        try
        {
            var result = await _questionService.CreateDraftAsync(request, user.Name, ct);
            return CreatedAtAction(nameof(GetQuestionById), new { id = result.Id }, ApiResponse<QuestionDto>.Ok(result, "Question draft created successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> UpdateDraft(Guid id, [FromBody] UpdateQuestionDraftRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to edit question drafts."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Authors and Administrators can edit question drafts."));

        try
        {
            var result = await _questionService.UpdateDraftAsync(id, request, user.Name, ct);
            return Ok(ApiResponse<QuestionDto>.Ok(result, "Question updated successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/validate")]
    public async Task<ActionResult<ApiResponse<List<string>>>> Validate(Guid id, CancellationToken ct)
    {
        try
        {
            var errors = await _questionService.ValidateQuestionAsync(id, ct);
            var message = errors.Count == 0 ? "Question passed all clinical validation rules." : "Validation issues detected.";
            return Ok(ApiResponse<List<string>>.Ok(errors, message));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<List<string>>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> SubmitForReview(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to submit questions for review."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Authors and Administrators can submit questions for review."));

        try
        {
            var result = await _questionService.SubmitForReviewAsync(id, user.Name, ct);
            return Ok(ApiResponse<QuestionDto>.Ok(result, "Question submitted for clinical review."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> ReviewQuestion(Guid id, [FromBody] QuestionReviewRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to review questions."));

        if (!HttpContext.HasRole("Reviewer", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Clinical Reviewers and Administrators can approve or reject questions."));

        try
        {
            var result = await _questionService.ReviewQuestionAsync(id, request, user.Id, user.Name, ct);
            var decision = request.Decision.ToString().ToLower();
            return Ok(ApiResponse<QuestionDto>.Ok(result, $"Question clinical review recorded as {decision}."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> Publish(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to publish questions."));

        if (!HttpContext.HasRole("Publisher", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Content Publishers and Administrators can publish questions."));

        try
        {
            var result = await _questionService.PublishQuestionAsync(id, user.Name, ct);
            return Ok(ApiResponse<QuestionDto>.Ok(result, "Question published and made immutable for examinations."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> Archive(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to archive questions."));

        if (!HttpContext.HasRole("Publisher", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Content Publishers and Administrators can archive questions."));

        try
        {
            var result = await _questionService.ArchiveQuestionAsync(id, user.Name, ct);
            return Ok(ApiResponse<QuestionDto>.Ok(result, "Question archived successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/versions")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> CreateNewVersion(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<QuestionDto>.Error("Authentication is required to create question versions."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<QuestionDto>.Error("Only Authors and Administrators can create new question versions."));

        try
        {
            var result = await _questionService.CreateNewVersionAsync(id, user.Name, ct);
            return Ok(ApiResponse<QuestionDto>.Ok(result, $"New revision draft v{result.CurrentVersion?.VersionNumber} created successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<QuestionDto>.Error(ex.Message));
        }
    }
}
