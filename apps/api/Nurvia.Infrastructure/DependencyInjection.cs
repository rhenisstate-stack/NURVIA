using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Options;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Infrastructure.Persistence;
using Nurvia.Infrastructure.Services;

namespace Nurvia.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // Ensure a connection string is provided
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("No database connection string found. Please configure a connection string for the current environment.");
        }

        services.AddDbContext<NurviaDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(NurviaDbContext).Assembly.FullName)));

        services.AddScoped<INurviaDbContext>(provider => provider.GetRequiredService<NurviaDbContext>());

        // Register Application Services
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IAvatarService, AvatarService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<ILectureService, LectureService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IExamAttemptService, ExamAttemptService>();
        services.AddScoped<IStudyLibraryService, StudyLibraryService>();
        services.AddSingleton<IAiTutorProvider, GroundedFallbackAiTutorProvider>();
        services.AddScoped<ITutorService, TutorService>();

        // Register file storage service
        services.Configure<FileStorageOptions>(options =>
        {
            options.StoragePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "avatars");
        });
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddSingleton<IAvatarImageValidator, SkiaAvatarImageValidator>();

        return services;
    }
}


