using Npgsql;
using System;
using Xunit;

namespace Nurvia.Tests
{
    /// <summary>
    /// Static utility class for validating database test configuration.
    /// This class can be used to validate configuration in isolation without 
    /// requiring ambient environment variables or database connections.
    /// </summary>
    public static class DatabaseEnvironmentValidator
    {
        /// <summary>
        /// Validates that the provided environment name is exactly "Test"
        /// </summary>
        /// <param name="environment">The environment name to validate</param>
        /// <returns>True if environment is exactly "Test", false otherwise</returns>
        public static bool IsTestEnvironment(string environment)
        {
            return environment == "Test";
        }

        /// <summary>
        /// Validates that the provided database name is exactly "nurvia_test"
        /// </summary>
        /// <param name="databaseName">The database name to validate</param>
        /// <returns>True if database name is exactly "nurvia_test", false otherwise</returns>
        public static bool IsTestDatabase(string databaseName)
        {
            return databaseName == "nurvia_test";
        }

        /// <summary>
        /// Validates that the provided database name is not a development database
        /// </summary>
        /// <param name="databaseName">The database name to validate</param>
        /// <returns>True if database name is not "nurvia_db", false otherwise</returns>
        public static bool IsNotDevelopmentDatabase(string databaseName)
        {
            return databaseName != "nurvia_db";
        }

        /// <summary>
        /// Validates that the provided database name does not contain production indicators
        /// </summary>
        /// <param name="databaseName">The database name to validate</param>
        /// <returns>True if database name does not contain production indicators, false otherwise</returns>
        public static bool IsNotProductionDatabase(string databaseName)
        {
            if (string.IsNullOrEmpty(databaseName))
                return true;
                
            return !databaseName.Contains("production", StringComparison.OrdinalIgnoreCase) &&
                   !databaseName.Contains("prod", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Validates that the provided host is not a production host
        /// </summary>
        /// <param name="host">The host name to validate</param>
        /// <returns>True if host is not a production host, false otherwise</returns>
        public static bool IsNotProductionHost(string host)
        {
            if (string.IsNullOrEmpty(host))
                return true;
                
            return !host.Equals("prod-db.nurvia.com", StringComparison.OrdinalIgnoreCase) &&
                   !host.Equals("production-db.nurvia.com", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Validates that a connection string contains a password
        /// </summary>
        /// <param name="connectionString">The connection string to validate</param>
        /// <returns>True if connection string contains password, false otherwise</returns>
        public static bool HasPassword(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return false;
                
            return connectionString.Contains("Password=", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Resolves and validates the isolated PostgreSQL test connection string from TEST_CONNECTION_STRING.
        /// Ensures DOTNET_ENVIRONMENT=Test and Database=nurvia_test (never nurvia_db or production).
        /// </summary>
        public static string ResolveIsolatedTestConnectionString()
        {
            var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? string.Empty;
            if (!IsTestEnvironment(environment))
            {
                throw new InvalidOperationException("Tests must be run with DOTNET_ENVIRONMENT=Test");
            }

            var connectionString = Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("TEST_CONNECTION_STRING environment variable is required for PostgreSQL test execution.");
            }

            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            if (!IsTestDatabase(builder.Database ?? string.Empty) ||
                !IsNotDevelopmentDatabase(builder.Database ?? string.Empty) ||
                !IsNotProductionDatabase(builder.Database ?? string.Empty) ||
                !IsNotProductionHost(builder.Host ?? string.Empty) ||
                string.IsNullOrWhiteSpace(builder.Password))
            {
                throw new InvalidOperationException($"TEST_CONNECTION_STRING must target an isolated 'nurvia_test' database with credentials. Current database: '{builder.Database}'.");
            }

            return connectionString;
        }
    }
}