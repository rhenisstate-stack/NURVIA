using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPhase2ContentSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ActorId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ActorName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ActorRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ChangesSummary = table.Column<string>(type: "text", nullable: false),
                    TimestampUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExamBlueprints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetQuestionCount = table.Column<int>(type: "integer", nullable: false),
                    SubjectDistributionJson = table.Column<string>(type: "text", nullable: true),
                    CognitiveDistributionJson = table.Column<string>(type: "text", nullable: true),
                    DifficultyDistributionJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamBlueprints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExamQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Exams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Pathway = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ModeAllowed = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TimeLimitMinutes = table.Column<int>(type: "integer", nullable: false),
                    PassingScorePercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CurrentVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    ConcurrencyToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exams", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExamVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: false),
                    TimeLimitMinutes = table.Column<int>(type: "integer", nullable: false),
                    PassingScorePercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ValidationErrors = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamVersions_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionExhibits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionExhibits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    OptionIndex = table.Column<int>(type: "integer", maxLength: 10, nullable: false),
                    OptionText = table.Column<string>(type: "text", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    SpecificRationale = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionOptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReviewerName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Decision = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Comments = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionReviews", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Pathway = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Subject = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Topic = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Subtopic = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Difficulty = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CurrentVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConcurrencyToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Stem = table.Column<string>(type: "text", nullable: false),
                    QuestionType = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CognitiveSkill = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ClientNeedCategory = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    GeneralRationale = table.Column<string>(type: "text", nullable: false),
                    ContentJsonData = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ValidationErrors = table.Column<string>(type: "text", nullable: true),
                    ReviewNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionVersions_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TimestampUtc",
                table: "AuditLogs",
                column: "TimestampUtc");

            migrationBuilder.CreateIndex(
                name: "IX_ExamBlueprints_ExamVersionId",
                table: "ExamBlueprints",
                column: "ExamVersionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamQuestions_ExamVersionId",
                table: "ExamQuestions",
                column: "ExamVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamQuestions_QuestionId",
                table: "ExamQuestions",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamQuestions_QuestionVersionId",
                table: "ExamQuestions",
                column: "QuestionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_Code",
                table: "Exams",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Exams_CurrentVersionId",
                table: "Exams",
                column: "CurrentVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamVersions_ExamId_VersionNumber",
                table: "ExamVersions",
                columns: new[] { "ExamId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuestionExhibits_QuestionVersionId",
                table: "QuestionExhibits",
                column: "QuestionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionOptions_QuestionVersionId",
                table: "QuestionOptions",
                column: "QuestionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionReviews_QuestionId",
                table: "QuestionReviews",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionReviews_QuestionVersionId",
                table: "QuestionReviews",
                column: "QuestionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Code",
                table: "Questions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CurrentVersionId",
                table: "Questions",
                column: "CurrentVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionVersions_QuestionId_VersionNumber",
                table: "QuestionVersions",
                columns: new[] { "QuestionId", "VersionNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamBlueprints_ExamVersions_ExamVersionId",
                table: "ExamBlueprints",
                column: "ExamVersionId",
                principalTable: "ExamVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_ExamVersions_ExamVersionId",
                table: "ExamQuestions",
                column: "ExamVersionId",
                principalTable: "ExamVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_QuestionVersions_QuestionVersionId",
                table: "ExamQuestions",
                column: "QuestionVersionId",
                principalTable: "QuestionVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_Questions_QuestionId",
                table: "ExamQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_ExamVersions_CurrentVersionId",
                table: "Exams",
                column: "CurrentVersionId",
                principalTable: "ExamVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionExhibits_QuestionVersions_QuestionVersionId",
                table: "QuestionExhibits",
                column: "QuestionVersionId",
                principalTable: "QuestionVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionOptions_QuestionVersions_QuestionVersionId",
                table: "QuestionOptions",
                column: "QuestionVersionId",
                principalTable: "QuestionVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionReviews_QuestionVersions_QuestionVersionId",
                table: "QuestionReviews",
                column: "QuestionVersionId",
                principalTable: "QuestionVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionReviews_Questions_QuestionId",
                table: "QuestionReviews",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_QuestionVersions_CurrentVersionId",
                table: "Questions",
                column: "CurrentVersionId",
                principalTable: "QuestionVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exams_ExamVersions_CurrentVersionId",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_QuestionVersions_CurrentVersionId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ExamBlueprints");

            migrationBuilder.DropTable(
                name: "ExamQuestions");

            migrationBuilder.DropTable(
                name: "QuestionExhibits");

            migrationBuilder.DropTable(
                name: "QuestionOptions");

            migrationBuilder.DropTable(
                name: "QuestionReviews");

            migrationBuilder.DropTable(
                name: "ExamVersions");

            migrationBuilder.DropTable(
                name: "Exams");

            migrationBuilder.DropTable(
                name: "QuestionVersions");

            migrationBuilder.DropTable(
                name: "Questions");
        }
    }
}
