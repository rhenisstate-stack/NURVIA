using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyLibraryMetadataSavedSetsAndReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AcademicYear",
                table: "Exams",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Exams",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "LearningObjectives",
                table: "Exams",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "School",
                table: "Exams",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Season",
                table: "Exams",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Exams",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Topic",
                table: "Exams",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExamReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamId = table.Column<Guid>(type: "uuid", nullable: false),
                    LearnerId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LearnerName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamReviews_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SavedStudySets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExamId = table.Column<Guid>(type: "uuid", nullable: false),
                    SavedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedStudySets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedStudySets_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exams_AcademicYear",
                table: "Exams",
                column: "AcademicYear");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_School",
                table: "Exams",
                column: "School");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_Season",
                table: "Exams",
                column: "Season");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_Status_Pathway_Category",
                table: "Exams",
                columns: new[] { "Status", "Pathway", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_Exams_Subject",
                table: "Exams",
                column: "Subject");

            migrationBuilder.CreateIndex(
                name: "IX_ExamReviews_ExamId_IsApproved",
                table: "ExamReviews",
                columns: new[] { "ExamId", "IsApproved" });

            migrationBuilder.CreateIndex(
                name: "IX_ExamReviews_ExamId_LearnerId",
                table: "ExamReviews",
                columns: new[] { "ExamId", "LearnerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SavedStudySets_ExamId",
                table: "SavedStudySets",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedStudySets_UserId_ExamId",
                table: "SavedStudySets",
                columns: new[] { "UserId", "ExamId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamReviews");

            migrationBuilder.DropTable(
                name: "SavedStudySets");

            migrationBuilder.DropIndex(
                name: "IX_Exams_AcademicYear",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_School",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_Season",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_Status_Pathway_Category",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_Subject",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "AcademicYear",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "LearningObjectives",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "School",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "Season",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "Subject",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "Topic",
                table: "Exams");
        }
    }
}
