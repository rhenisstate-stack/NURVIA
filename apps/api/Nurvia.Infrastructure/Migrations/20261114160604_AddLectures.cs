using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nurvia.Infrastructure.Migrations
{
    /// <summary>
    /// Creates the dedicated Lectures table for the Mark K. lecture-notes feature:
    /// number/slug uniqueness, persisted Markdown body and high-yield concepts,
    /// access level, content status, and audit fields. Purely additive — no
    /// existing table or row is modified. The incidental UserProfiles.Biography
    /// column-type alignment (text -> character varying(2000)) reconciles the EF
    /// model's declared max length with the database; the PostgreSQL text/varchar
    /// cast is binary-coercible, so existing values are preserved unchanged.
    /// </summary>
    public partial class AddLectures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Biography",
                table: "UserProfiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Lectures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Slug = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    BodyMarkdown = table.Column<string>(type: "text", nullable: false),
                    HighYieldConcepts = table.Column<List<string>>(type: "text[]", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ReviewNotes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lectures", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lectures_Number",
                table: "Lectures",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lectures_Slug",
                table: "Lectures",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lectures_Status_AccessLevel",
                table: "Lectures",
                columns: new[] { "Status", "AccessLevel" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Lectures");

            migrationBuilder.AlterColumn<string>(
                name: "Biography",
                table: "UserProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);
        }
    }
}
