using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilverbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AceptacionDesafio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OnboardingCompletado",
                table: "Miembros",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "AceptacionesDesafio",
                columns: table => new
                {
                    DesafioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AceptadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AceptacionesDesafio", x => new { x.DesafioId, x.MiembroId });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AceptacionesDesafio");

            migrationBuilder.DropColumn(
                name: "OnboardingCompletado",
                table: "Miembros");
        }
    }
}
