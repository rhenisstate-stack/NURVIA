using System.IO;

namespace Nurvia.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
    Task<Stream?> GetFileStreamAsync(string storageKey, CancellationToken cancellationToken);
    Task<bool> DeleteFileAsync(string storageKey, CancellationToken cancellationToken);
    Task<bool> FileExistsAsync(string storageKey, CancellationToken cancellationToken);
}