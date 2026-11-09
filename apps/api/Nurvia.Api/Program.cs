using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using Nurvia.Infrastructure;
using Nurvia.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add Infrastructure layer (PostgreSQL EF Core, repositories, domain services)
builder.Services.AddInfrastructure(builder.Configuration);

// Add API Controllers with string enum serializer
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Configure Swagger with API Information
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NURVIA Nursing Education API",
        Version = "v1",
        Description = "Examination Management Studio & Question Bank Builder API for NURVIA"
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
