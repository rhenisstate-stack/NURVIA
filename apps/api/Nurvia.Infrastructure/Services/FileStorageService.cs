using System.IO;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Options;

namespace Nurvia.Infrastructure.Services;

public sealed class FileStorageService : IFileStorageService
{
    private static readonly Regex StorageKeyPattern =
        new(@"^[A-Za-z0-9_-]{43}\.[A-Za-z0-9]{1,10}$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly string _storagePath;

    public FileStorageService(
        IOptions<FileStorageOptions> options,
        IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (string.IsNullOrWhiteSpace(options.Value.StoragePath))
            throw new InvalidOperationException("File storage path is not configured.");

        _storagePath = Path.GetFullPath(options.Value.StoragePath);

        Directory.CreateDirectory(_storagePath);
    }

    public async Task<string> SaveFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(fileStream);

        if (!fileStream.CanRead)
            throw new ArgumentException("The supplied stream is not readable.", nameof(fileStream));

        cancellationToken.ThrowIfCancellationRequested();

        var storageKey = GenerateStorageKey(fileName);
        var filePath = ResolveStoragePath(storageKey);

        var fileCreated = false;
        try
        {
            await using var destination = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                81920,
                FileOptions.Asynchronous | FileOptions.SequentialScan);
            fileCreated = true;

            await fileStream.CopyToAsync(destination, cancellationToken);
            await destination.FlushAsync(cancellationToken);

            return storageKey;
        }
        catch
        {
            if (fileCreated && File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch
                {
                    // Preserve the original save exception if cleanup fails.
                }
            }

            throw;
        }
    }

    public Task<Stream?> GetFileStreamAsync(
        string storageKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var filePath = ResolveStoragePath(storageKey);

        if (!File.Exists(filePath))
            return Task.FromResult<Stream?>(null);

        Stream stream = new FileStream(
            filePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            81920,
            FileOptions.Asynchronous | FileOptions.SequentialScan);

        return Task.FromResult<Stream?>(stream);
    }

    public Task<bool> DeleteFileAsync(
        string storageKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var filePath = ResolveStoragePath(storageKey);

        if (!File.Exists(filePath))
            return Task.FromResult(false);

        try
        {
            File.Delete(filePath);
            return Task.FromResult(true);
        }
        catch (IOException)
        {
            return Task.FromResult(false);
        }
        catch (UnauthorizedAccessException)
        {
            return Task.FromResult(false);
        }
    }

    public Task<bool> FileExistsAsync(
        string storageKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var filePath = ResolveStoragePath(storageKey);

        return Task.FromResult(File.Exists(filePath));
    }

    private string ResolveStoragePath(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey) ||
            !StorageKeyPattern.IsMatch(storageKey) ||
            !string.Equals(
                Path.GetFileName(storageKey),
                storageKey,
                StringComparison.Ordinal))
        {
            throw new ArgumentException("Invalid file storage key.", nameof(storageKey));
        }

        var filePath = Path.GetFullPath(Path.Combine(_storagePath, storageKey));
        var rootPrefix = _storagePath.TrimEnd(
            Path.DirectorySeparatorChar,
            Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;

        var comparison = OperatingSystem.IsWindows()
            ? StringComparison.OrdinalIgnoreCase
            : StringComparison.Ordinal;

        if (!filePath.StartsWith(rootPrefix, comparison))
            throw new ArgumentException("Storage key resolves outside the storage directory.", nameof(storageKey));

        return filePath;
    }

    private static string GenerateStorageKey(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);

        if (string.IsNullOrWhiteSpace(extension))
            extension = ".bin";

        extension = extension.ToLowerInvariant();

        var randomBytes = RandomNumberGenerator.GetBytes(32);

        var base64Key = Convert.ToBase64String(randomBytes)
            .Replace("/", "_")
            .Replace("+", "-")
            .TrimEnd('=');

        return $"{base64Key}{extension}";
    }
}

