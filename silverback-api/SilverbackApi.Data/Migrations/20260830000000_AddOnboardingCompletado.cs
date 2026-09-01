using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilverbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingCompletado : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OnboardingCompletado",
                table: "Miembros");
        }
    }
}
