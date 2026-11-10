using Npgsql;
using System;
using Xunit;

namespace Nurvia.Tests
{
    public class DatabaseConfigurationValidatorTests
    {
        [Fact]
        public void Test_Environment_Validation_Static()
        {
            // Test static environment validation logic in isolation
            Assert.True(DatabaseEnvironmentValidator.IsTestEnvironment("Test"), "Should accept Test environment");
            Assert.False(DatabaseEnvironmentValidator.IsTestEnvironment("Development"), "Should reject Development environment");
            Assert.False(DatabaseEnvironmentValidator.IsTestEnvironment("Production"), "Should reject Production environment");
            Assert.False(DatabaseEnvironmentValidator.IsTestEnvironment(""), "Should reject empty environment");
            Assert.False(DatabaseEnvironmentValidator.IsTestEnvironment(null), "Should reject null environment");
        }

        [Fact]
        public void Test_Database_Name_Validation_Static()
        {
            // Test static database name validation logic in isolation
            Assert.True(DatabaseEnvironmentValidator.IsTestDatabase("nurvia_test"), "Should accept nurvia_test database");
            Assert.False(DatabaseEnvironmentValidator.IsTestDatabase("nurvia_db"), "Should reject nurvia_db database");
            Assert.False(DatabaseEnvironmentValidator.IsTestDatabase("production_db"), "Should reject production database");
            Assert.False(DatabaseEnvironmentValidator.IsTestDatabase(""), "Should reject empty database name");
        }

        [Fact]
        public void Test_Development_Database_Rejection_Static()
        {
            // Test static development database rejection logic
            Assert.True(DatabaseEnvironmentValidator.IsNotDevelopmentDatabase("nurvia_test"), "Should accept test database");
            Assert.False(DatabaseEnvironmentValidator.IsNotDevelopmentDatabase("nurvia_db"), "Should reject development database");
            Assert.True(DatabaseEnvironmentValidator.IsNotDevelopmentDatabase("production_db"), "Should accept production database (not development)");
            Assert.True(DatabaseEnvironmentValidator.IsNotDevelopmentDatabase(""), "Should accept empty database name");
        }

        [Fact]
        public void Test_Production_Database_Rejection_Static()
        {
            // Test static production database rejection logic
            Assert.True(DatabaseEnvironmentValidator.IsNotProductionDatabase("nurvia_test"), "Should accept test database");
            Assert.False(DatabaseEnvironmentValidator.IsNotProductionDatabase("production_db"), "Should reject production database");
            Assert.False(DatabaseEnvironmentValidator.IsNotProductionDatabase("prod_db"), "Should reject prod database");
            Assert.False(DatabaseEnvironmentValidator.IsNotProductionDatabase("prod"), "Should reject prod database");
            Assert.True(DatabaseEnvironmentValidator.IsNotProductionDatabase(""), "Should accept empty database name");
        }

        [Fact]
        public void Test_Production_Host_Rejection_Static()
        {
            // Test static production host rejection logic
            Assert.True(DatabaseEnvironmentValidator.IsNotProductionHost("localhost"), "Should accept localhost");
            Assert.False(DatabaseEnvironmentValidator.IsNotProductionHost("prod-db.nurvia.com"), "Should reject production host");
            Assert.False(DatabaseEnvironmentValidator.IsNotProductionHost("production-db.nurvia.com"), "Should reject production host");
            Assert.True(DatabaseEnvironmentValidator.IsNotProductionHost(""), "Should accept empty host");
            Assert.True(DatabaseEnvironmentValidator.IsNotProductionHost(null), "Should accept null host");
        }

        [Fact]
        public void Test_Connection_String_Format_Validation()
        {
            // Validate that we have a properly formatted connection string structure
            // This test verifies the structure without actually parsing the connection
            var connectionString = Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING") 
                                 ?? "Host=localhost;Port=5432;Database=nurvia_test;Username=nurvia_test_user;Password=nurvia_secure_test_password_dev2026!;Include Error Detail=true";
            
            Assert.NotNull(connectionString);
            Assert.NotEmpty(connectionString);
            
            // Basic validation that it contains expected components
            Assert.Contains("Host=", connectionString);
            Assert.Contains("Port=", connectionString);
            Assert.Contains("Database=", connectionString);
            Assert.Contains("Username=", connectionString);
            Assert.Contains("Password=", connectionString);
        }

        [Fact]
        public void Test_Connection_String_Has_Password()
        {
            // Verify that connection string contains password (security requirement)
            var connectionString = Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING") 
                                 ?? "Host=localhost;Port=5432;Database=nurvia_test;Username=nurvia_test_user;Password=nurvia_secure_test_password_dev2026!;Include Error Detail=true";
            
            Assert.NotNull(connectionString);
            Assert.Contains("Password=", connectionString);
        }
    }
}