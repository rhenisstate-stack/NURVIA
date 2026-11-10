using Nurvia.Application.Security;
using Xunit;

namespace Nurvia.Tests
{
    public class SuperadminRoleTests
    {
        [Fact]
        public void CurrentUser_HasRole_Superadmin_Returns_True()
        {
            // Arrange
            var user = new CurrentUser
            {
                IsAuthenticated = true,
                Role = "Superadmin"
            };

            // Act
            var result = user.HasRole("Learner");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void CurrentUser_HasRole_Administrator_Returns_True_For_Admin_Roles()
        {
            // Arrange
            var user = new CurrentUser
            {
                IsAuthenticated = true,
                Role = "Administrator"
            };

            // Act
            var result = user.HasRole("Learner");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void CurrentUser_HasRole_Administrator_Returns_False_For_Superadmin_Role()
        {
            // Arrange
            var user = new CurrentUser
            {
                IsAuthenticated = true,
                Role = "Administrator"
            };

            // Act
            var result = user.HasRole("Superadmin");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void CurrentUser_HasRole_Learner_Returns_True_For_Learner_Role()
        {
            // Arrange
            var user = new CurrentUser
            {
                IsAuthenticated = true,
                Role = "Learner"
            };

            // Act
            var result = user.HasRole("Learner");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void CurrentUser_HasRole_Learner_Returns_False_For_Admin_Role()
        {
            // Arrange
            var user = new CurrentUser
            {
                IsAuthenticated = true,
                Role = "Learner"
            };

            // Act
            var result = user.HasRole("Administrator");

            // Assert
            Assert.False(result);
        }
    }
}