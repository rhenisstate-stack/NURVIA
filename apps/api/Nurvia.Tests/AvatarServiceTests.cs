using Microsoft.EntityFrameworkCore;
using Moq;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Accounts;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class AvatarServiceTests
{
    private static NurviaDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new NurviaDbContext(options);
    }

    private static Mock<IAvatarImageValidator> CreateValidImageValidator()
    {
        var validator = new Mock<IAvatarImageValidator>();

        validator
            .Setup(x => x.Validate(
                It.IsAny<Stream>(),
                ".jpg",
                "image/jpeg"))
            .Returns(new AvatarImageValidationResult(true, null));

        return validator;
    }

    [Fact]
    public async Task UploadAvatarAsync_WithValidFile_PersistsAvatarProfile()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        storage
            .Setup(x => x.SaveFileAsync(
                It.IsAny<Stream>(),
                "test.jpg",
                "image/jpeg",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync("avatar-storage-key.jpg");

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        var userId = Guid.NewGuid();
        using var stream = new MemoryStream(new byte[] { 1, 2, 3, 4 });

        var result = await service.UploadAvatarAsync(
            userId.ToString(),
            stream,
            "test.jpg",
            "image/jpeg",
            CancellationToken.None);

        Assert.Equal("avatar-storage-key.jpg", result.StorageKey);
        Assert.Equal("Avatar uploaded successfully.", result.Message);

        var profile = await context.UserProfiles
            .SingleAsync(x => x.UserId == userId);

        Assert.Equal("avatar-storage-key.jpg", profile.AvatarStorageKey);

        storage.Verify(x => x.SaveFileAsync(
            It.IsAny<Stream>(),
            "test.jpg",
            "image/jpeg",
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UploadAvatarAsync_WithInvalidUserId_ReturnsError()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        var result = await service.UploadAvatarAsync(
            "invalid-guid",
            stream,
            "test.jpg",
            "image/jpeg",
            CancellationToken.None);

        Assert.Equal("Invalid user ID format.", result.Message);
        Assert.Empty(result.StorageKey);

        storage.Verify(x => x.SaveFileAsync(
            It.IsAny<Stream>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UploadAvatarAsync_WithEmptyFile_ReturnsError()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        using var stream = new MemoryStream();

        var result = await service.UploadAvatarAsync(
            Guid.NewGuid().ToString(),
            stream,
            "test.jpg",
            "image/jpeg",
            CancellationToken.None);

        Assert.Equal("No file was uploaded.", result.Message);
        Assert.Empty(result.StorageKey);

        validator.Verify(x => x.Validate(
            It.IsAny<Stream>(),
            It.IsAny<string>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task UploadAvatarAsync_WithInvalidExtension_ReturnsError()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        var result = await service.UploadAvatarAsync(
            Guid.NewGuid().ToString(),
            stream,
            "test.txt",
            "text/plain",
            CancellationToken.None);

        Assert.Equal(
            "Only JPG, PNG and WebP image formats are allowed.",
            result.Message);

        validator.Verify(x => x.Validate(
            It.IsAny<Stream>(),
            It.IsAny<string>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task UploadAvatarAsync_WithOversizedFile_ReturnsError()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        using var stream = new MemoryStream(new byte[(5 * 1024 * 1024) + 1]);

        var result = await service.UploadAvatarAsync(
            Guid.NewGuid().ToString(),
            stream,
            "test.jpg",
            "image/jpeg",
            CancellationToken.None);

        Assert.Equal(
            "File size exceeds the maximum limit of 5MB.",
            result.Message);

        validator.Verify(x => x.Validate(
            It.IsAny<Stream>(),
            It.IsAny<string>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetAvatarAsync_WithExistingAvatar_ReturnsStoredAvatarDetails()
    {
        using var context = CreateContext();
        var storage = new Mock<IFileStorageService>();
        var validator = CreateValidImageValidator();

        var userId = Guid.NewGuid();
        var profile = new UserProfile(userId)
        {
            AvatarStorageKey = "existing-avatar.jpg"
        };

        context.UserProfiles.Add(profile);
        await context.SaveChangesAsync();

        var service = new AvatarService(
            context,
            storage.Object,
            validator.Object);

        var result = await service.GetAvatarAsync(
            userId.ToString(),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("existing-avatar.jpg", result.StorageKey);
        Assert.Equal(
            "/api/avatar/existing-avatar.jpg",
            result.Url);
    }
}
