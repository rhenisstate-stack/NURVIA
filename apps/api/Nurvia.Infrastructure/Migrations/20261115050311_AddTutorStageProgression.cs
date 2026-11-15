using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTutorStageProgression : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Additive, non-destructive: a non-nullable int with a safe default
            // applied to all existing attempt rows on the populated database.
            migrationBuilder.AddColumn<int>(
                name: "TutorStageReached",
                table: "AttemptResponses",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TutorStageReached",
                table: "AttemptResponses");
        }
    }
}
