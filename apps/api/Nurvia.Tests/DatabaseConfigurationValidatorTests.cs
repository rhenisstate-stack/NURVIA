using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

namespace Nurvia.Tests
{
    public class DatabaseConfigurationValidatorTests
    {
        [Fact]
        public void Test_ConnectionString_Validation_With_Valid_Test_Configuration()
        {
            // Arrange
            var builder = new ConfigurationBuilder()
                .SetBasePath("apps/api/Nurvia.Tests")
                .AddJsonFile("appsettings.Test.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables();
                
            var configuration = builder.Build();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Act & Assert
            Assert.NotNull(connectionString);
            var npgsqlBuilder = new NpgsqlConnectionStringBuilder(connectionString);
            Assert.Equal("nurvia_test", npgsqlBuilder.Database);
            Assert.Equal("localhost", npgsqlBuilder.Host);
            Assert.Equal(5432, npgsqlBuilder.Port);
        }

        [Fact]
        public void Test_Environment_Variable_Validation()
        {
            // Act & Assert
            var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
            Assert.Equal("Test", environment);
        }
    }
}