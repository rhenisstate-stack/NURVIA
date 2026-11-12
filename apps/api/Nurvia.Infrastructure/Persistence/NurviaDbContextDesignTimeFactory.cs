using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Nurvia.Infrastructure.Persistence;

/// <summary>
/// Design-time factory so `dotnet ef migrations add` can instantiate NurviaDbContext
/// without booting the API host (which requires runtime configuration such as the
/// JWT secret and Windows EventLog providers).
/// </summary>
public class NurviaDbContextDesignTimeFactory : IDesignTimeDbContextFactory<NurviaDbContext>
{
    public NurviaDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<NurviaDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=nurvia_design_time;Username=nurvia_user;Password=placeholder",
            b => b.MigrationsAssembly(typeof(NurviaDbContext).Assembly.FullName));

        return new NurviaDbContext(optionsBuilder.Options);
    }
}
