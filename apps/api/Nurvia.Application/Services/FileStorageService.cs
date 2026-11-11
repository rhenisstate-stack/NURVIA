using System.IO;
using System.Security.Cryptography;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Nurvia.Application.Interfaces;

namespace Nurvia.Application.Services;

public sealed class FileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly IHostEnvironment _environment;

    public FileStorageService(IOptions<FileStorageOptions> options, IHostEnvironment environment)
    {
        _storagePath = options.Value.StoragePath;
        _environment = environment;
        
        // Ensure the storage directory exists
        Directory.CreateDirectory(_storagePath);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken)
    {
        // Generate a secure, unpredictable storage key
        var storageKey = GenerateStorageKey(fileName);
        
        // Construct the full file path
        var filePath = Path.Combine(_storagePath, storageKey);
        
        // Copy the stream to the file
        using var fileStreamCopy = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await fileStream.CopyToAsync(fileStreamCopy, cancellationToken);
        
        return storageKey;
    }

    public async Task<Stream?> GetFileStreamAsync(string storageKey, CancellationToken cancellationToken)
    {
        var filePath = Path.Combine(_storagePath, storageKey);
        
        // Check if file exists
        if (!File.Exists(filePath))
            return null;
            
        // Return the file stream
        return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, FileOptions.Asynchronous);
    }

    public async Task<bool> DeleteFileAsync(string storageKey, CancellationToken cancellationToken)
    {
        var filePath = Path.Combine(_storagePath, storageKey);
        
        // Check if file exists and delete it
        if (File.Exists(filePath))
        {
            try
            {
                File.Delete(filePath);
                return true;
            }
            catch
            {
                // Log the exception if logging is available
                return false;
            }
        }
        
        return false;
    }

    public async Task<bool> FileExistsAsync(string storageKey, CancellationToken cancellationToken)
    {
        var filePath = Path.Combine(_storagePath, storageKey);
        return File.Exists(filePath);
    }

    private string GenerateStorageKey(string originalFileName)
    {
        // Generate a secure, unpredictable key
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        
        var base64Key = Convert.ToBase64String(randomBytes)
            .Replace("/", "_")
            .Replace("+", "-")
            .TrimEnd('=');
            
        // Extract file extension from original filename
        var extension = Path.GetExtension(originalFileName);
        if (string.IsNullOrEmpty(extension))
        {
            extension = ".bin";
        }
        
        // Combine key and extension
        return $"{base64Key}{extension}";
    }
}