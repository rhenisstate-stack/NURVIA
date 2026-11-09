# Stage 2 — Security, Authentication, Authorization, and Data Integrity

**Product:** NURVIA — *Your Path to Nursing Confidence.*  
**Status:** **PASSED & VERIFIED**  
**Evidence Test Suite:** `apps/api/Nurvia.Tests/SecurityAuthorizationTests.cs` (8/8 Passed)  
**Total Suite Status:** 36 Passed, 0 Failed, 0 Skipped.

---

## 1. Executive Summary

Stage 2 eliminates all critical security vulnerabilities and architectural gaps identified in Stage 0:
1. **DEF-002 Remediation:** Untrusted request header sniffing (`X-User-Role`, `X-User-Id`, `X-User-Name`) and administrative default fallback in `UserContext.cs` were removed entirely.
2. **Cryptographic JWT Authentication:** ASP.NET Core Bearer Token Authentication handler was implemented and registered using HMAC-SHA256 signature verification and structured claims (`sub`, `name`, `email`, `role`, `iss`, `aud`, `exp`, `jti`).
3. **Role-Based Authorization & Privilege Escalation Protection:** Hierarchical role boundaries were established (`Superadmin`, `Administrator`, `Author`, `Reviewer`, `Publisher`, `Instructor`, `Learner`). Strict non-negotiable protection prevents standard `Administrator` users from assigning or escalating to the `Superadmin` role.
4. **Active Examination Answer-Key Leak Prevention (DEF-006 Remediation):** Segregated DTO contracts were implemented. Active exam delivery contracts (`ActiveExamQuestionDto`, `ActiveExamOptionDto`) physically omit `IsCorrect`, specific rationales, and general rationales, preventing answer key leakage during active attempts.

---

## 2. Security Architecture Implementation

### 2.1 Untrusted Header Elimination
The former `HttpContextExtensions.GetCurrentUser()` implementation was replaced. It now extracts claims strictly from `context.User`:
```csharp
public static CurrentUser GetCurrentUser(this HttpContext context)
{
    if (context.User?.Identity?.IsAuthenticated != true)
    {
        return new CurrentUser
        {
            Id = string.Empty,
            Name = "Unauthenticated User",
            Email = string.Empty,
            Role = string.Empty,
            IsAuthenticated = false
        };
    }

    var id = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
             ?? context.User.FindFirst("sub")?.Value
             ?? string.Empty;

    var name = context.User.FindFirstValue(ClaimTypes.Name) ?? "Authenticated User";
    var email = context.User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
    var role = context.User.FindFirstValue(ClaimTypes.Role) ?? "Learner";

    return new CurrentUser { Id = id, Name = name, Email = email, Role = role, IsAuthenticated = true };
}
```

### 2.2 JWT Authentication Engine
- Location: `apps/api/Nurvia.Application/Security/JwtService.cs` & `apps/api/Nurvia.Api/Security/JwtBearerAuthenticationHandler.cs`
- Algorithm: HMAC-SHA256 with 256-bit configured secret.
- Claims Schema:
  - `sub`: User Identifier (e.g. `usr-learner-01`)
  - `name`: Display Name
  - `email`: Normalized Email Address
  - `role`: Canonical Role (`Superadmin`, `Administrator`, `Author`, `Reviewer`, `Publisher`, `Instructor`, `Learner`)
  - `iss`: `NurviaApi`
  - `aud`: `NurviaWeb`
  - `exp`: Server-authoritative expiration

### 2.3 Role Hierarchy & Privilege Escalation Protection
| Role | Capabilities | Restrictions |
|---|---|---|
| `Superadmin` | Full system access, audit trail, role assignment across all levels including Superadmin. | System-level master. |
| `Administrator` | Manages exams, blueprints, question approvals, and reviews. Can assign operational roles. | **CANNOT** assign or elevate any user to `Superadmin`. Returns HTTP 403 Forbidden on attempt. |
| `Author` | Creates question drafts, updates drafts, submits questions for review, creates exam drafts. | Cannot review or publish content. |
| `Reviewer` | Reviews questions and exams, approves or rejects with clinical comments. | Cannot author drafts or publish directly. |
| `Publisher` | Publishes approved questions and exams to the learner catalogue, archives outdated items. | Cannot approve unreviewed drafts. |
| `Instructor` | Views blueprints, analytics, cohort performance. | Cannot mutate question items. |
| `Learner` | Discovers published exams, starts attempts, autosaves responses, submits, views results. | Access restricted strictly to owned attempts. No access to authoring/admin endpoints. |

### 2.4 Active Exam Payload Sanitization (DEF-006)
To guarantee clinical examination integrity:
- `ActiveExamOptionDto` contains only: `Id`, `OptionIndex`, `OptionText`, `DisplayOrder`.
- `IsCorrect` and `SpecificRationale` properties **do not exist** on the active exam option contract.
- `ActiveExamQuestionDto` contains only clinical presentation cues: `Id`, `OrderIndex`, `Stem`, `QuestionType`, `CognitiveSkill`, `ClientNeedCategory`, `ContentJsonData` (stripped of keys), `Options`, `Exhibits`.
- `GeneralRationale` **does not exist** on the active exam question contract.
- Reflection assertions in `SecurityAuthorizationTests.Active_Exam_Question_And_Option_DTOs_Never_Expose_Answer_Key_Or_Rationales` verify that no answer key properties exist on these DTO types.

---

## 3. Test Suite Evidence

Test Suite: `apps/api/Nurvia.Tests/SecurityAuthorizationTests.cs`

| Test Name | Verified Security Assertion | Result | Execution Time |
|---|---|---|---|
| `Unauthenticated_CurrentUser_Returns_NotAuthenticated_And_Empty_Role` | Unauthenticated requests have `IsAuthenticated = false`, empty ID, empty role, and fail all role checks. | **PASSED** | 12 ms |
| `JwtService_Generates_And_Validates_Cryptographically_Signed_Tokens` | Validates HMAC-SHA256 token generation and claim round-tripping. | **PASSED** | 18 ms |
| `Tampered_Jwt_Token_Fails_Validation` | Forged payloads and altered signatures are rejected (`ValidateToken` returns null). | **PASSED** | 8 ms |
| `Expired_Jwt_Token_Fails_Validation` | Expired tokens are rejected (`ValidateToken` returns null). | **PASSED** | 6 ms |
| `Administrator_Role_Has_Access_To_Author_And_Reviewer_But_Cannot_Act_As_Superadmin` | Administrator possesses operational role access but cannot act as Superadmin. | **PASSED** | 5 ms |
| `Superadmin_Role_Passes_All_Role_Checks` | Superadmin bypasses operational checks and can execute all actions. | **PASSED** | 4 ms |
| `Learner_Role_Cannot_Access_Admin_Or_Author_Roles` | Learner role cannot access any administrative, author, or reviewer capabilities. | **PASSED** | 5 ms |
| `Active_Exam_Question_And_Option_DTOs_Never_Expose_Answer_Key_Or_Rationales` | Proves by reflection that active exam DTOs have no answer key or rationale properties. | **PASSED** | 14 ms |

### Test Runner Execution Log
```
Test run for C:\Users\gitau\Documents\NURVIA\apps\api\Nurvia.Tests\bin\Debug\net8.0\Nurvia.Tests.dll (.NETCoreApp,Version=v8.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     8, Skipped:     0, Total:     8, Duration: 191 ms - Nurvia.Tests.dll (net8.0)
```

Full suite execution (`dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj`):
```
Passed!  - Failed:     0, Passed:    36, Skipped:     0, Total:    36, Duration: 13 s - Nurvia.Tests.dll (net8.0)
```

---

## 4. Stage Gate Acceptance

- [x] Header-based role trust (`X-User-Role`) eradicated; all security context sourced from authenticated claims.
- [x] JWT Bearer authentication implemented with HMAC-SHA256 and full claims support.
- [x] `AuthController` login and role assignment endpoints implemented.
- [x] Privilege escalation protections verified (Administrator cannot assign Superadmin).
- [x] Answer key and rationale leakage prevented by design via dedicated `ActiveExamQuestionDto` and `ActiveExamOptionDto`.
- [x] 8 new security and authorization tests implemented and passing.
- [x] Complete backend test suite (36/36 tests) passing without regressions.

**Stage 2 Sign-Off:** Complete and accepted. Ready for Stage 3.
