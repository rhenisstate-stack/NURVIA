using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <summary>
    /// Adds examination navigation-layout configuration (per exam version) and the
    /// per-attempt delivery mode / layout choice. Purely additive: existing columns
    /// and rows are untouched. Default values preserve the previous learner behavior
    /// (both layouts permitted, sequential default, exam delivery mode).
    /// </summary>
    [Migration("20261112100000_AddExamLayoutAndDeliveryMode")]
    public partial class AddExamLayoutAndDeliveryMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllowedLayouts",
                table: "ExamVersions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Both");

            migrationBuilder.AddColumn<string>(
                name: "DefaultLayout",
                table: "ExamVersions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Sequential");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryMode",
                table: "ExamAttempts",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Exam");

            migrationBuilder.AddColumn<string>(
                name: "LayoutMode",
                table: "ExamAttempts",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Sequential");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedLayouts",
                table: "ExamVersions");

            migrationBuilder.DropColumn(
                name: "DefaultLayout",
                table: "ExamVersions");

            migrationBuilder.DropColumn(
                name: "DeliveryMode",
                table: "ExamAttempts");

            migrationBuilder.DropColumn(
                name: "LayoutMode",
                table: "ExamAttempts");
        }
    }
}
