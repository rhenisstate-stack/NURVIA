using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewReleasePolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReviewReleasePolicy",
                table: "ExamVersions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewReleasedAtUtc",
                table: "ExamVersions",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReviewReleasePolicy",
                table: "ExamVersions");

            migrationBuilder.DropColumn(
                name: "ReviewReleasedAtUtc",
                table: "ExamVersions");
        }
    }
}
