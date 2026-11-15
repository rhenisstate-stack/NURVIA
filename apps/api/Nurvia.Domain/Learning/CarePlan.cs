using Nurvia.Domain.Common;

namespace Nurvia.Domain.Learning;

/// <summary>
/// Evidence-based NANDA-I clinical nursing care plan (curated or learner-authored).
/// </summary>
public class CarePlan : Entity
{
    public string? OwnerUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Specialty { get; set; } = "Med-Surg";
    public string Diagnosis { get; set; } = string.Empty;
    public string RelatedTo { get; set; } = string.Empty;
    public string OutcomesText { get; set; } = string.Empty;
    public string InterventionsText { get; set; } = string.Empty;
    public string Rationale { get; set; } = string.Empty;
    public bool IsSystemPlan { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public CarePlan() { }
}
