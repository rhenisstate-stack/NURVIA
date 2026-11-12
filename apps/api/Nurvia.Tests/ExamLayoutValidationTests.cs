using Nurvia.Domain.Enums;
using Nurvia.Domain.Exams;
using Xunit;

namespace Nurvia.Tests;

/// <summary>
/// Pure unit tests for exam layout policy validation on ExamVersion. The default
/// layout must always be permitted by the version's AllowedLayouts policy.
/// </summary>
public class ExamLayoutValidationTests
{
    private static ExamVersion NewValidVersion(ExamLayoutPolicy policy, ExamLayout defaultLayout)
    {
        var version = new ExamVersion(Guid.NewGuid(), 1, "Valid Examination Title", "Description", "author")
        {
            TimeLimitMinutes = 60,
            PassingScorePercentage = 75,
            AllowedLayouts = policy,
            DefaultLayout = defaultLayout
        };
        version.ExamQuestions.Add(new ExamQuestion(version.Id, Guid.NewGuid(), Guid.NewGuid(), 0));
        return version;
    }

    [Theory]
    [InlineData(ExamLayoutPolicy.Both, ExamLayout.Sequential)]
    [InlineData(ExamLayoutPolicy.Both, ExamLayout.AllInOne)]
    [InlineData(ExamLayoutPolicy.SequentialOnly, ExamLayout.Sequential)]
    [InlineData(ExamLayoutPolicy.AllInOneOnly, ExamLayout.AllInOne)]
    public void Validate_DefaultLayoutPermittedByPolicy_IsValid(ExamLayoutPolicy policy, ExamLayout defaultLayout)
    {
        var version = NewValidVersion(policy, defaultLayout);

        var valid = version.Validate(out var errors);

        Assert.True(valid);
        Assert.Empty(errors);
        Assert.Null(version.ValidationErrors);
    }

    [Fact]
    public void Validate_DefaultSequentialWithAllInOneOnlyPolicy_Fails()
    {
        var version = NewValidVersion(ExamLayoutPolicy.AllInOneOnly, ExamLayout.Sequential);

        var valid = version.Validate(out var errors);

        Assert.False(valid);
        Assert.Contains(errors, e => e.Contains("Sequential") && e.Contains("All-in-One"));
    }

    [Fact]
    public void Validate_DefaultAllInOneWithSequentialOnlyPolicy_Fails()
    {
        var version = NewValidVersion(ExamLayoutPolicy.SequentialOnly, ExamLayout.AllInOne);

        var valid = version.Validate(out var errors);

        Assert.False(valid);
        Assert.Contains(errors, e => e.Contains("All-in-One") && e.Contains("Sequential"));
    }

    [Fact]
    public void Defaults_NewExamVersion_AllowsBothLayoutsAndDefaultsToSequential()
    {
        var version = new ExamVersion();

        Assert.Equal(ExamLayoutPolicy.Both, version.AllowedLayouts);
        Assert.Equal(ExamLayout.Sequential, version.DefaultLayout);
    }
}
