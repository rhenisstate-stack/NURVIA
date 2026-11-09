namespace Nurvia.Domain.Exceptions;

/// <summary>
/// Thrown when a learner requests review of a submitted attempt whose exam version
/// uses <see cref="Domain.Enums.ReviewReleasePolicy.ManualRelease"/> and staff have
/// not yet released the results.
/// </summary>
public class ReviewNotReleasedException : DomainException
{
    public ReviewNotReleasedException()
        : base("Review is not yet available for this examination. Results will be released by NURVIA staff.")
    {
    }
}
