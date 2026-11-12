using System.Security.Claims;
using Microsoft.Extensions.Options;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;
using Xunit;

namespace Nurvia.Tests;

public class SecurityAuthorizationTests
{
    private readonly IJwtService _jwtService;
    private readonly JwtSettings _jwtSettings;

    public SecurityAuthorizationTests()
    {
        _jwtSettings = new JwtSettings
        {
            Secret = "NurviaSecretKeyForJwtTokenGeneration2026!ExamPlatformSecureToken",
            Issuer = "NurviaApi",
            Audience = "NurviaWeb",
            ExpiryMinutes = 60
        };

        var optionsWrapper = Options.Create(_jwtSettings);
        _jwtService = new JwtService(optionsWrapper);
    }

    [Fact]
    public void Unauthenticated_CurrentUser_Returns_NotAuthenticated_And_Empty_Role()
    {
        var currentUser = new CurrentUser
        {
            Id = string.Empty,
            Name = "Unauthenticated User",
            Email = string.Empty,
            Role = string.Empty,
            IsAuthenticated = false
        };

        Assert.False(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Id);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(currentUser.HasRole("Administrator"));
        Assert.False(currentUser.HasRole("Author"));
        Assert.False(currentUser.HasRole("Learner"));
    }

    [Fact]
    public void JwtService_Generates_And_Validates_Cryptographically_Signed_Tokens()
    {
        var authUser = new AuthUser
        {
            Id = "usr-author-77",
            Name = "Dr. Author",
            Email = "author@nurvia.internal",
            Role = "Author"
        };

        var token = _jwtService.GenerateToken(authUser);
        Assert.NotNull(token);
        Assert.Equal(3, token.Split('.').Length);

        var principal = _jwtService.ValidateToken(token);
        Assert.NotNull(principal);
        Assert.True(principal.Identity?.IsAuthenticated);
        Assert.Equal("usr-author-77", principal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal("Author", principal.FindFirst(ClaimTypes.Role)?.Value);
        Assert.Equal("author@nurvia.internal", principal.FindFirst(ClaimTypes.Email)?.Value);
    }

    [Fact]
    public void Tampered_Jwt_Token_Fails_Validation()
    {
        var authUser = new AuthUser
        {
            Id = "usr-learner-01",
            Name = "Student Alex",
            Email = "student@nurvia.internal",
            Role = "Learner"
        };

        var token = _jwtService.GenerateToken(authUser);
        var parts = token.Split('.');

        // Tamper with payload (substitute second part with forged role)
        var tamperedToken = $"{parts[0]}.eyJyZXNwb25zZSI6ImZvcmdlZCIsInJvbGUiOiJTdXBlcmFkbWluIn0.{parts[2]}";

        var principal = _jwtService.ValidateToken(tamperedToken);
        Assert.Null(principal);
    }

    [Fact]
    public void Expired_Jwt_Token_Fails_Validation()
    {
        var authUser = new AuthUser
        {
            Id = "usr-learner-expired",
            Name = "Expired Session",
            Email = "expired@nurvia.internal",
            Role = "Learner"
        };

        // Negative expiry time simulates expired token
        var expiredToken = _jwtService.GenerateToken(authUser, TimeSpan.FromSeconds(-10));

        var principal = _jwtService.ValidateToken(expiredToken);
        Assert.Null(principal);
    }

    [Fact]
    public void Administrator_Role_Has_Access_To_Author_And_Reviewer_But_Cannot_Act_As_Superadmin()
    {
        var adminUser = new CurrentUser
        {
            Id = "usr-admin-01",
            Name = "Lead Nurse Educator",
            Email = "admin@nurvia.internal",
            Role = "Administrator",
            IsAuthenticated = true
        };

        Assert.True(adminUser.HasRole("Author"));
        Assert.True(adminUser.HasRole("Reviewer"));
        Assert.True(adminUser.HasRole("Administrator"));

        // Non-negotiable security invariant: Regular administrator cannot perform Superadmin-only actions
        Assert.False(adminUser.HasRole("Superadmin"));
    }

    [Fact]
    public void Superadmin_Role_Passes_All_Role_Checks()
    {
        var superadminUser = new CurrentUser
        {
            Id = "usr-superadmin-01",
            Name = "System Owner",
            Email = "superadmin@nurvia.internal",
            Role = "Superadmin",
            IsAuthenticated = true
        };

        Assert.True(superadminUser.HasRole("Superadmin"));
        Assert.True(superadminUser.HasRole("Administrator"));
        Assert.True(superadminUser.HasRole("Author"));
        Assert.True(superadminUser.HasRole("Reviewer"));
        Assert.True(superadminUser.HasRole("Publisher"));
    }

    [Fact]
    public void Learner_Role_Cannot_Access_Admin_Or_Author_Roles()
    {
        var learnerUser = new CurrentUser
        {
            Id = "usr-learner-01",
            Name = "Alex Rivera",
            Email = "learner@nurvia.internal",
            Role = "Learner",
            IsAuthenticated = true
        };

        Assert.True(learnerUser.HasRole("Learner"));
        Assert.False(learnerUser.HasRole("Administrator"));
        Assert.False(learnerUser.HasRole("Author"));
        Assert.False(learnerUser.HasRole("Reviewer"));
        Assert.False(learnerUser.HasRole("Publisher"));
        Assert.False(learnerUser.HasRole("Superadmin"));
    }

    [Fact]
    public void ActiveExamDtos_SanitizationIsDecidedByPersistedDeliveryMode()
    {
        // The DTO contract deliberately carries the answer-key fields; whether they
        // are populated is decided server-side from the persisted attempt's
        // DeliveryMode. Exam attempts are always sanitized, Tutor attempts receive
        // the approved key for immediate learning feedback.
        var method = typeof(ExamAttemptService).GetMethod(
            "BuildStartAttemptDto",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
        Assert.NotNull(method);

        var qv = new QuestionVersion(Guid.NewGuid(), 1, "A clinical question stem for sanitization.", QuestionType.SingleChoice, "tester")
        {
            GeneralRationale = "General rationale text"
        };
        qv.Options.Add(new QuestionOption(1, "Correct answer", true, "Specific rationale text"));

        var question = new Question { Code = "SANITIZE-1", CurrentVersion = qv, CurrentVersionId = qv.Id };
        var exam = new Exam();
        var version = new ExamVersion(exam.Id, 1, "Exam Title", "Description", "tester");
        version.ExamQuestions.Add(new ExamQuestion(version.Id, question.Id, qv.Id, 0)
        {
            Question = question,
            QuestionVersion = qv
        });

        // Exam attempt: persisted DeliveryMode = Exam (default) -> strictly sanitized.
        var examModeAttempt = new ExamAttempt(exam.Id, version.Id, "learner-1", "Learner One", 60, 75, 1);
        var examDto = (StartAttemptResultDto)method!.Invoke(null, new object[] { examModeAttempt, exam, version, 3600 })!;

        Assert.Equal(ExamDeliveryMode.Exam, examDto.DeliveryMode);
        var examOption = Assert.Single(examDto.Questions.Single().Options);
        Assert.False(examOption.IsCorrect);
        Assert.Null(examOption.SpecificRationale);
        Assert.Null(examDto.Questions.Single().GeneralRationale);

        // Tutor attempt: persisted DeliveryMode = Tutor -> approved key revealed.
        var tutorAttempt = new ExamAttempt(exam.Id, version.Id, "learner-2", "Learner Two", 60, 75, 1,
            deliveryMode: ExamDeliveryMode.Tutor);
        var tutorDto = (StartAttemptResultDto)method.Invoke(null, new object[] { tutorAttempt, exam, version, 3600 })!;

        Assert.Equal(ExamDeliveryMode.Tutor, tutorDto.DeliveryMode);
        var tutorOption = Assert.Single(tutorDto.Questions.Single().Options);
        Assert.True(tutorOption.IsCorrect);
        Assert.Equal("Specific rationale text", tutorOption.SpecificRationale);
        Assert.Equal("General rationale text", tutorDto.Questions.Single().GeneralRationale);
    }
}
