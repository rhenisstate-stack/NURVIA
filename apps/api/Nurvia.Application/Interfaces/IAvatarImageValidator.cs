namespace Nurvia.Application.Interfaces;

public sealed record AvatarImageValidationResult(bool IsValid, string? ErrorMessage);

public interface IAvatarImageValidator
{
    AvatarImageValidationResult Validate(
        Stream stream,
        string fileExtension,
        string contentType);
}
