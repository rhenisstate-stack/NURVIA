using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Services;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;
using Xunit;

namespace Nurvia.Tests;

public class AvatarServiceTests
{
    [Fact]
    public async Task UploadAvatarAsync_WithValidFile_ReturnsSuccess()
    {
        // Arrange
        var mockContext = new Mock<INurviaDbContext>();
        var mockFileStorageService = new Mock<IFileStorageService>();
        
        var avatarService = new AvatarService(mockContext.Object, mockFileStorageService.Object);
        
        // Act
        var result = await avatarService.UploadAvatarAsync(
            "123e4567-e89b-12d3-a456-426614174000",
            new MemoryStream(),
            "test.jpg",
            "image/jpeg",
            default);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.StorageKey);
        Assert.Equal("Avatar uploaded successfully.", result.Message);
    }
    
    [Fact]
    public async Task UploadAvatarAsync_WithInvalidUserId_ReturnsError()
    {
        // Arrange
        var mockContext = new Mock<INurviaDbContext>();
        var mockFileStorageService = new Mock<IFileStorageService>();
        
        var avatarService = new AvatarService(mockContext.Object, mockFileStorageService.Object);
        
        // Act
        var result = await avatarService.UploadAvatarAsync(
            "invalid-guid",
            new MemoryStream(),
            "test.jpg",
            "image/jpeg",
            default);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Invalid user ID format.", result.Message);
    }
}