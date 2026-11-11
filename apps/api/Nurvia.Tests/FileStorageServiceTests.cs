using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Moq;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Options;
using Nurvia.Infrastructure.Services;
using Xunit;

namespace Nurvia.Tests;

public class FileStorageServiceTests
{
    [Fact]
    public async Task SaveFileAsync_WithValidFile_ReturnsStorageKey()
    {
        // Arrange
        var options = new FileStorageOptions
        {
            StoragePath = Path.GetTempPath()
        };
        
        var mockEnvironment = new Mock<IHostEnvironment>();
        var fileStorageService = new FileStorageService(
            Options.Create(options),
            mockEnvironment.Object);
        
        using var memoryStream = new MemoryStream();
        var testData = new byte[] { 1, 2, 3, 4, 5 };
        memoryStream.Write(testData, 0, testData.Length);
        memoryStream.Position = 0;
        
        // Act
        var storageKey = await fileStorageService.SaveFileAsync(
            memoryStream,
            "test.png",
            "image/png",
            default);

        // Assert
        Assert.NotNull(storageKey);
        Assert.NotEmpty(storageKey);
    }
}