using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;
using Xunit;

namespace Nurvia.Tests;

public sealed class PasswordHashingTests
{
    private readonly Pbkdf2PasswordHasher _hasher = new();

    [Fact]
    public void Hash_UsesSaltedPbkdf2AndDoesNotContainThePassword()
    {
        const string password = "NursingConfidence-2026!";

        var hash = _hasher.Hash(password);

        Assert.StartsWith("pbkdf2-sha256$600000$", hash);
        Assert.DoesNotContain(password, hash);
        Assert.True(_hasher.Verify(password, hash));
        Assert.False(_hasher.Verify("different-password", hash));
    }

    [Fact]
    public void Hash_UsesAnIndependentSaltForEachAccount()
    {
        const string password = "NursingConfidence-2026!";

        Assert.NotEqual(_hasher.Hash(password), _hasher.Hash(password));
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid")]
    [InlineData("pbkdf2-sha256$1$not-base64$not-base64")]
    public void Verify_RejectsMalformedHashes(string hash)
    {
        Assert.False(_hasher.Verify("password", hash));
    }

    [Fact]
    public void NewAccount_AlwaysReceivesTheLearnerRole()
    {
        var account = new UserAccount("Learner Name", "learner@example.test", _hasher.Hash("password"));

        Assert.Equal("Learner", account.Role);
        Assert.Equal("LEARNER@EXAMPLE.TEST", account.NormalizedEmail);
    }
}
