using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilverbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class CarpetaDerEvolucion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rareza",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "COMUN");

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "InventarioItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Origen",
                table: "Cofres",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "HITO");

            // Rareza del catálogo ya sembrado (el seed nuevo la trae; esto cubre bases existentes)
            migrationBuilder.Sql(@"UPDATE Items SET Rareza = CASE Nombre
                WHEN N'Skin Alfa Dorado' THEN 'EPICO' WHEN N'Skin Guerrero Negro' THEN 'RARO'
                WHEN N'Aura de Fuego' THEN 'LEGENDARIO' WHEN N'Aura Tormenta' THEN 'EPICO'
                WHEN N'Ícono Manada' THEN 'RARO' ELSE 'COMUN' END");

            migrationBuilder.CreateTable(
                name: "SuscripcionesActivas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AliadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuscripcionesActivas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuscripcionesActivas_AliadosComerciales_AliadoId",
                        column: x => x.AliadoId,
                        principalTable: "AliadosComerciales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SuscripcionesActivas_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransaccionesMarketplace",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransaccionesMarketplace", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransaccionesMarketplace_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransaccionesMarketplace_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SuscripcionesActivas_AliadoId",
                table: "SuscripcionesActivas",
                column: "AliadoId");

            migrationBuilder.CreateIndex(
                name: "IX_SuscripcionesActivas_MiembroId",
                table: "SuscripcionesActivas",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_TransaccionesMarketplace_ItemId",
                table: "TransaccionesMarketplace",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_TransaccionesMarketplace_MiembroId",
                table: "TransaccionesMarketplace",
                column: "MiembroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SuscripcionesActivas");

            migrationBuilder.DropTable(
                name: "TransaccionesMarketplace");

            migrationBuilder.DropColumn(
                name: "Rareza",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "InventarioItems");

            migrationBuilder.DropColumn(
                name: "Origen",
                table: "Cofres");
        }
    }
}
