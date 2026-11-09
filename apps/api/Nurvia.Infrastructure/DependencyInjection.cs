using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Services;
using Nurvia.Infrastructure.Persistence;

namespace Nurvia.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=nurvia_db;Username=nurvia_user;Password=nurvia_secure_password_dev2026!";

        services.AddDbContext<NurviaDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(NurviaDbContext).Assembly.FullName)));

        services.AddScoped<INurviaDbContext>(provider => provider.GetRequiredService<NurviaDbContext>());

        // Register Application Services
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IExamAttemptService, ExamAttemptService>();

        return services;
    }
}
