using System.Text.Json.Serialization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.OpenApi.Models;
using Nurvia.Api.Security;
using Nurvia.Application.Security;
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

builder.Services.AddAuthorization();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "nurvia_csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Add API Controllers with string enum serializer
builder.Services.AddControllers(options =>
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

// Phase 1 Sample Catalogue Discovery Endpoint
app.MapGet("/api/catalogue/summary", () => Results.Ok(new
{
    TotalExams = 142,
    Programs = new[] { "RN", "PN/LPN", "ADN", "BSN" },
    Providers = new[] { "ATI", "HESI", "NCLEX", "NURVIA Original" },
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
}))
.WithName("GetCatalogueSummary")
.WithOpenApi();

// Automatically seed initial clinical content if database is empty
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<NurviaDbContext>();
    await DatabaseSeeder.SeedAsync(dbContext);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Database seeding skipped or encountered non-fatal connection issue.");
}

app.Run();
