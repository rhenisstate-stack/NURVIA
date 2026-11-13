using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <summary>
    /// Adds the optional per-user nursing pathway declaration to UserProfiles
    /// (RN / PN_LPN, stored as the enum name, null = undeclared). Purely additive:
    /// the new column is nullable, so every existing profile row is preserved
    /// unchanged and learners without a declared pathway remain unrestricted.
    /// </summary>
    [Migration("20261113120000_AddUserPathway")]
    public partial class AddUserPathway : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Pathway",
                table: "UserProfiles",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pathway",
                table: "UserProfiles");
        }
    }
}
