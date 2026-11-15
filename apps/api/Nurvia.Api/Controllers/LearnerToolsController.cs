using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

public sealed record SaveQuestionRequest(Guid? ExamId = null, string? Notes = null);

[ApiController]
[Route("api/learner")]
public class LearnerToolsController : ControllerBase
{
    private readonly ISavedQuestionsService _savedQuestions;
    private readonly IStudyPlannerService _planner;

    public LearnerToolsController(
        ISavedQuestionsService savedQuestions,
        IStudyPlannerService planner)
    {
        _savedQuestions = savedQuestions;
        _planner = planner;
    }

    [HttpGet("saved-questions")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SavedQuestionDto>>>> GetSavedQuestions(CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<SavedQuestionDto>>.Error("Authentication is required."));

        var items = await _savedQuestions.GetSavedQuestionsAsync(user.Id, ct);
        return Ok(ApiResponse<IReadOnlyList<SavedQuestionDto>>.Ok(items));
    }

    [HttpPost("saved-questions/{questionId:guid}")]
    public async Task<ActionResult<ApiResponse<SavedQuestionDto>>> SaveQuestion(
        Guid questionId,
        [FromBody] SaveQuestionRequest? request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<SavedQuestionDto>.Error("Authentication is required."));

        var saved = await _savedQuestions.SaveQuestionAsync(user.Id, questionId, request?.ExamId, request?.Notes, ct);
        if (saved is null)
            return NotFound(ApiResponse<SavedQuestionDto>.Error("Published question not found."));

        return Ok(ApiResponse<SavedQuestionDto>.Ok(saved, "Question saved to your study list."));
    }

    [HttpDelete("saved-questions/{questionId:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> RemoveSavedQuestion(Guid questionId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var removed = await _savedQuestions.RemoveSavedQuestionAsync(user.Id, questionId, ct);
        if (!removed)
            return NotFound(ApiResponse<string>.Error("Saved question not found."));

        return Ok(ApiResponse<string>.Ok("Removed from saved questions."));
    }

    [HttpGet("planner")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StudyPlanTaskDto>>>> GetPlannerTasks(CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<StudyPlanTaskDto>>.Error("Authentication is required."));

        var tasks = await _planner.GetTasksAsync(user.Id, ct);
        return Ok(ApiResponse<IReadOnlyList<StudyPlanTaskDto>>.Ok(tasks));
    }

    [HttpPost("planner")]
    public async Task<ActionResult<ApiResponse<StudyPlanTaskDto>>> CreatePlannerTask(
        [FromBody] CreateStudyPlanTaskRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<StudyPlanTaskDto>.Error("Authentication is required."));

        var (task, error) = await _planner.CreateTaskAsync(user.Id, request, ct);
        if (error is not null || task is null)
            return BadRequest(ApiResponse<StudyPlanTaskDto>.Error(error ?? "Unable to create study plan task."));

        return Ok(ApiResponse<StudyPlanTaskDto>.Ok(task, "Study plan task created."));
    }

    [HttpPut("planner/{taskId:guid}")]
    public async Task<ActionResult<ApiResponse<StudyPlanTaskDto>>> UpdatePlannerTask(
        Guid taskId,
        [FromBody] UpdateStudyPlanTaskRequest request,
        CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<StudyPlanTaskDto>.Error("Authentication is required."));

        var (task, error, notFound) = await _planner.UpdateTaskAsync(user.Id, taskId, request, ct);
        if (notFound)
            return NotFound(ApiResponse<StudyPlanTaskDto>.Error(error ?? "Study plan task not found."));
        if (error is not null || task is null)
            return BadRequest(ApiResponse<StudyPlanTaskDto>.Error(error ?? "Unable to update study plan task."));

        return Ok(ApiResponse<StudyPlanTaskDto>.Ok(task, "Study plan task updated."));
    }

    [HttpDelete("planner/{taskId:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeletePlannerTask(Guid taskId, CancellationToken ct)
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var deleted = await _planner.DeleteTaskAsync(user.Id, taskId, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Error("Study plan task not found."));

        return Ok(ApiResponse<string>.Ok("Study plan task deleted."));
    }
}
