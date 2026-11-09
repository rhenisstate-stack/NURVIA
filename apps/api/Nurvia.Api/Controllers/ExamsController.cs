using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;
    private readonly ILogger<ExamsController> _logger;

    public ExamsController(IExamService examService, ILogger<ExamsController> logger)
    {
        _examService = examService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ExamDto>>>> GetExams([FromQuery] ExamFilterRequest filter, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated || user.Role.Equals("Learner", StringComparison.OrdinalIgnoreCase))
        {
            filter.Status = Nurvia.Domain.Enums.ExamStatus.Published;
        }
        else if (!HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin"))
        {
            return Forbid();
        }

        var result = await _examService.GetExamsAsync(filter, ct);
        return Ok(ApiResponse<PagedResult<ExamDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> GetExamById(Guid id, CancellationToken ct)
    {
        if (!HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin"))
        {
            var user = HttpContext.GetCurrentUser();
            if (!user.IsAuthenticated)
                return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to view exam configuration."));
            return Forbid();
        }

        var exam = await _examService.GetExamByIdAsync(id, ct);
        if (exam == null)
            return NotFound(ApiResponse<ExamDto>.Error($"Exam with ID '{id}' was not found."));

        return Ok(ApiResponse<ExamDto>.Ok(exam));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExamDto>>> CreateExam([FromBody] CreateExamRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to create exams."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Authors and Administrators can create exams."));

        try
        {
            var result = await _examService.CreateExamAsync(request, user.Name, ct);
            return CreatedAtAction(nameof(GetExamById), new { id = result.Id }, ApiResponse<ExamDto>.Ok(result, "Exam created successfully."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> ConfigureExam(Guid id, [FromBody] ConfigureExamRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to configure exams."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Authors and Administrators can configure exams."));

        try
        {
            var result = await _examService.ConfigureExamAsync(id, request, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Exam blueprint and questions configured successfully."));
        }
        catch (DomainException ex)
        {
            if (ex.Message.Contains("Concurrency Conflict"))
                return Conflict(ApiResponse<ExamDto>.Error(ex.Message));

            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/validate")]
    public async Task<ActionResult<ApiResponse<List<string>>>> Validate(Guid id, CancellationToken ct)
    {
        if (!HttpContext.HasRole("Author", "Reviewer", "Publisher", "Administrator", "Superadmin"))
        {
            var user = HttpContext.GetCurrentUser();
            if (!user.IsAuthenticated)
                return Unauthorized(ApiResponse<List<string>>.Error("Authentication is required to validate exams."));
            return Forbid();
        }

        try
        {
            var errors = await _examService.ValidateExamAsync(id, ct);
            var message = errors.Count == 0 ? "Exam blueprint passed all validation rules." : "Validation issues detected in blueprint.";
            return Ok(ApiResponse<List<string>>.Ok(errors, message));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<List<string>>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> SubmitForReview(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to submit exams for review."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Authors and Administrators can submit exams for review."));

        try
        {
            var result = await _examService.SubmitForReviewAsync(id, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Exam blueprint submitted for review."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> Approve(Guid id, [FromBody] ApproveExamRequest request, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to approve exams."));

        if (!HttpContext.HasRole("Reviewer", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Reviewers and Administrators can approve exams."));

        try
        {
            var result = await _examService.ApproveExamAsync(id, user.Name, request.Comments, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Exam approved for publication."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> Publish(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to publish exams."));

        if (!HttpContext.HasRole("Publisher", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Publishers and Administrators can publish exams."));

        try
        {
            var result = await _examService.PublishExamAsync(id, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Exam published to learner examination library."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> Archive(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to archive exams."));

        if (!HttpContext.HasRole("Publisher", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Publishers and Administrators can archive exams."));

        try
        {
            var result = await _examService.ArchiveExamAsync(id, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Exam archived."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/release-review")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> ReleaseReview(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to release exam review results."));

        if (!HttpContext.HasRole("Publisher", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Publishers and Administrators can release exam review results."));

        try
        {
            var result = await _examService.ReleaseReviewAsync(id, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, "Review results released to learners."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }

    [HttpPost("{id:guid}/versions")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> CreateNewVersion(Guid id, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<ExamDto>.Error("Authentication is required to create exam versions."));

        if (!HttpContext.HasRole("Author", "Administrator"))
            return StatusCode(403, ApiResponse<ExamDto>.Error("Only Authors and Administrators can create exam versions."));

        try
        {
            var result = await _examService.CreateNewVersionAsync(id, user.Name, ct);
            return Ok(ApiResponse<ExamDto>.Ok(result, $"New exam version v{result.CurrentVersion?.VersionNumber} created."));
        }
        catch (DomainException ex)
        {
            return BadRequest(ApiResponse<ExamDto>.Error(ex.Message));
        }
    }
}

public class ApproveExamRequest
{
    public string Comments { get; set; } = string.Empty;
}
