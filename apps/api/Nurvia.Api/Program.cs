using System.Text.Json.Serialization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Nurvia.Api.Security;
using Nurvia.Application.Security;
using Nurvia.Domain.Enums;
using Nurvia.Infrastructure;
using Nurvia.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add Infrastructure layer (PostgreSQL EF Core, repositories, domain services)
builder.Services.AddInfrastructure(builder.Configuration);

// Add JWT Authentication & Security
var jwtSecret = builder.Configuration["JwtSettings:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException("JwtSettings:Secret must be configured outside Development.");

    jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.PostConfigure<JwtSettings>(settings => settings.Secret = jwtSecret);
builder.Services.AddSingleton<IJwtService, JwtService>();

builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, JwtBearerAuthenticationHandler>("Bearer", null);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Superadmin", policy => policy.RequireRole("Superadmin"));
});
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "nurvia_csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Add API Controllers with string enum serializer
builder.Services.AddControllersWithViews(options =>
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()))
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Configure Swagger with API Information and Bearer Authentication
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NURVIA Nursing Education API",
        Version = "v1",
        Description = "Examination Management Studio & Question Bank Builder API for NURVIA"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' followed by space and token (e.g. 'Bearer eyJ...').",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS for Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "NURVIA API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Map API Controllers
app.MapControllers();

// Health and Status Endpoint
app.MapGet("/api/health", () => Results.Ok(new
{
    Status = "Healthy",
    Application = "NURVIA Core API",
    Version = "2.0.0",
    Timestamp = DateTime.UtcNow
}))
.WithName("HealthCheck")
.WithOpenApi();

// Catalogue Discovery Endpoint — reports real counts from the live database
app.MapGet("/api/catalogue/summary", async (NurviaDbContext dbContext, CancellationToken ct) =>
{
    var publishedExams = await dbContext.Exams.CountAsync(e => e.Status == ExamStatus.Published, ct);
    var publishedQuestions = await dbContext.Questions.CountAsync(q => q.Status == ContentStatus.Published, ct);

    var results = Results.Ok(new
    {
        TotalExams = publishedExams,
        PublishedQuestions = publishedQuestions,
        Programs = new[] { "RN", "PN/LPN", "ADN", "BSN" },
        Categories = new[]
        {
            "Fundamentals of Nursing",
            "Adult Medical-Surgical",
            "Pharmacology",
            "Dosage Calculations",
            "Maternal Newborn & Obstetrics",
            "Pediatric Nursing",
            "Mental Health",
            "Leadership & Management",
            "Comprehensive Predictor Exit Exams"
        }
    });
    return results;
})
.WithName("GetCatalogueSummary")
.WithOpenApi();

// Automatically seed initial clinical content if database is empty
var bootstrapName = builder.Configuration["BootstrapAdmin:Name"];
var bootstrapEmail = builder.Configuration["BootstrapAdmin:Email"];
var bootstrapPassword = builder.Configuration["BootstrapAdmin:Password"];
var bootstrapErrors = BootstrapConfigurationValidator.Validate(
    builder.Environment.EnvironmentName, bootstrapName, bootstrapEmail, bootstrapPassword);
if (bootstrapErrors.Count > 0)
{
    // Startup is intentionally blocked: bootstrap must never activate in a
    // restricted environment or with a partially configured/weak credential set.
    foreach (var error in bootstrapErrors)
        app.Logger.LogError("Superadmin bootstrap configuration rejected: {Error}", error);
    throw new InvalidOperationException(
        "Superadmin bootstrap configuration was rejected. See logged errors. " +
        "No secrets are ever logged.");
}

try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<NurviaDbContext>();
    await DatabaseSeeder.SeedAsync(dbContext);
    await LectureSeeder.SeedAsync(dbContext);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Database seeding skipped or encountered non-fatal connection issue.");
}

if (bootstrapErrors.Count == 0 && (!string.IsNullOrWhiteSpace(bootstrapName)))
{
    using var scope = app.Services.CreateScope();
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    var created = await authService.BootstrapSuperadminAsync(
        bootstrapName!, bootstrapEmail!, bootstrapPassword!, CancellationToken.None);
    if (!created)
        app.Logger.LogWarning("Bootstrap Superadmin was not created because an account or Superadmin already exists.");
}

app.Run();
