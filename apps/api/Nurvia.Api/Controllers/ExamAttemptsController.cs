using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/attempts")]
public class ExamAttemptsController : ControllerBase
{
    private readonly IExamAttemptService _attemptService;
    private readonly ILogger<ExamAttemptsController> _logger;

    public ExamAttemptsController(IExamAttemptService attemptService, ILogger<ExamAttemptsController> logger)
    {
        _attemptService = attemptService;
        _logger = logger;
    }

    [HttpPost("start/{examId:guid}")]
    public async Task<ActionResult<ApiResponse<StartAttemptResultDto>>> StartAttempt(Guid examId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<StartAttemptResultDto>.Error("Authentication is required to start an examination."));

        try
        {
            var result = await _attemptService.StartAttemptAsync(examId, user.Id, user.Name, ct);
            return Ok(ApiResponse<StartAttemptResultDto>.Ok(result, "Examination attempt initialized."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<StartAttemptResultDto>.Error(ex.Message));
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StartAttemptResultDto>>> GetActiveAttempt(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<StartAttemptResultDto>.Error("Authentication is required to view an active examination."));

        try
        {
            var result = await _attemptService.GetActiveAttemptAsync(id, user.Id, ct);
            if (result == null)
                return NotFound(ApiResponse<StartAttemptResultDto>.Error($"Active attempt with ID '{id}' was not found."));

            return Ok(ApiResponse<StartAttemptResultDto>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<StartAttemptResultDto>.Error(ex.Message));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("Access denied"))
                return StatusCode(403, ApiResponse<StartAttemptResultDto>.Error(ex.Message));

            return BadRequest(ApiResponse<StartAttemptResultDto>.Error(ex.Message));
        }
    }

    [HttpPut("{id:guid}/responses")]
    public async Task<ActionResult<ApiResponse<AutosaveResultDto>>> AutosaveResponse(Guid id, [FromBody] AutosaveResponseRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<AutosaveResultDto>.Error("Authentication is required to save responses."));

        try
        {
            var result = await _attemptService.AutosaveResponseAsync(id, request, user.Id, ct);
            return Ok(ApiResponse<AutosaveResultDto>.Ok(result, "Response autosaved successfully."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<AutosaveResultDto>.Error(ex.Message));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("Access denied"))
                return StatusCode(403, ApiResponse<AutosaveResultDto>.Error(ex.Message));

            return BadRequest(ApiResponse<AutosaveResultDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<ApiResponse<SubmittedExamResultDto>>> SubmitAttempt(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<SubmittedExamResultDto>.Error("Authentication is required to submit an examination."));

        try
        {
            var result = await _attemptService.SubmitAttemptAsync(id, user.Id, ct);
            return Ok(ApiResponse<SubmittedExamResultDto>.Ok(result, "Examination attempt submitted and graded successfully."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<SubmittedExamResultDto>.Error(ex.Message));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("Access denied"))
                return StatusCode(403, ApiResponse<SubmittedExamResultDto>.Error(ex.Message));

            return BadRequest(ApiResponse<SubmittedExamResultDto>.Error(ex.Message));
        }
    }

    [HttpGet("{id:guid}/review")]
    public async Task<ActionResult<ApiResponse<SubmittedExamResultDto>>> GetAttemptReview(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<SubmittedExamResultDto>.Error("Authentication is required to review an examination."));

        try
        {
            var result = await _attemptService.GetAttemptReviewAsync(id, user.Id, ct);
            return Ok(ApiResponse<SubmittedExamResultDto>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<SubmittedExamResultDto>.Error(ex.Message));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("Access denied"))
                return StatusCode(403, ApiResponse<SubmittedExamResultDto>.Error(ex.Message));

            return BadRequest(ApiResponse<SubmittedExamResultDto>.Error(ex.Message));
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<List<ExamAttemptSummaryDto>>>> GetHistory(CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<List<ExamAttemptSummaryDto>>.Error("Authentication is required to view exam history."));

        var result = await _attemptService.GetLearnerHistoryAsync(user.Id, ct);
        return Ok(ApiResponse<List<ExamAttemptSummaryDto>>.Ok(result));
    }
}
