using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperadminRoleUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_Superadmin_Unique",
                table: "UserAccounts",
                column: "Role",
                unique: true,
                filter: "\"Role\" = 'Superadmin'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_Superadmin_Unique",
                table: "UserAccounts");
        }
    }
}
