using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilverbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class CarpetaEvolucionPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // El catálogo de S7 (nodos individuales por XP, ítems HABITAT/ACCESORIO, beneficios sin categoría) no se
            // puede convertir al de la carpeta: se borra y la API lo vuelve a sembrar al iniciar (DbInicializador).
            migrationBuilder.Sql("DELETE FROM InversionesNodo; DELETE FROM NodoDependencias; DELETE FROM Nodos;");
            migrationBuilder.Sql("DELETE FROM InventarioItems; DELETE FROM Items;");
            migrationBuilder.Sql("DELETE FROM ReclamosBeneficio; DELETE FROM BeneficiosAliado; DELETE FROM AliadosComerciales;");

            migrationBuilder.DropForeignKey(
                name: "FK_InversionesNodo_Miembros_MiembroId",
                table: "InversionesNodo");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InversionesNodo",
                table: "InversionesNodo");

            migrationBuilder.RenameColumn(
                name: "CostoXp",
                table: "Nodos",
                newName: "CostoPuntos");

            migrationBuilder.AddColumn<int>(
                name: "NivelMaximo",
                table: "Nodos",
                type: "int",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "BonusPorNivel",
                table: "Nodos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Efecto",
                table: "Nodos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "LlavesAcero",
                table: "Miembros",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "InversionesNodo",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ClanId",
                table: "InversionesNodo",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "Costo",
                table: "InversionesNodo",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelAlcanzado",
                table: "InversionesNodo",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LlavesRequeridas",
                table: "Cofres",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "BeneficiosAliado",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "Destacado",
                table: "BeneficiosAliado",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaVencimiento",
                table: "BeneficiosAliado",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_InversionesNodo",
                table: "InversionesNodo",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "NodosClan",
                columns: table => new
                {
                    ClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NodoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nivel = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NodosClan", x => new { x.ClanId, x.NodoId });
                    table.ForeignKey(
                        name: "FK_NodosClan_Clanes_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clanes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NodosClan_Nodos_NodoId",
                        column: x => x.NodoId,
                        principalTable: "Nodos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InversionesNodo_ClanId_InvertidoEn",
                table: "InversionesNodo",
                columns: new[] { "ClanId", "InvertidoEn" });

            migrationBuilder.CreateIndex(
                name: "IX_InversionesNodo_MiembroId",
                table: "InversionesNodo",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_NodosClan_NodoId",
                table: "NodosClan",
                column: "NodoId");

            migrationBuilder.AddForeignKey(
                name: "FK_InversionesNodo_Clanes_ClanId",
                table: "InversionesNodo",
                column: "ClanId",
                principalTable: "Clanes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InversionesNodo_Miembros_MiembroId",
                table: "InversionesNodo",
                column: "MiembroId",
                principalTable: "Miembros",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InversionesNodo_Clanes_ClanId",
                table: "InversionesNodo");

            migrationBuilder.DropForeignKey(
                name: "FK_InversionesNodo_Miembros_MiembroId",
                table: "InversionesNodo");

            migrationBuilder.DropTable(
                name: "NodosClan");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InversionesNodo",
                table: "InversionesNodo");

            migrationBuilder.DropIndex(
                name: "IX_InversionesNodo_ClanId_InvertidoEn",
                table: "InversionesNodo");

            migrationBuilder.DropIndex(
                name: "IX_InversionesNodo_MiembroId",
                table: "InversionesNodo");

            migrationBuilder.DropColumn(
                name: "BonusPorNivel",
                table: "Nodos");


            migrationBuilder.DropColumn(
                name: "Efecto",
                table: "Nodos");

            migrationBuilder.DropColumn(
                name: "LlavesAcero",
                table: "Miembros");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "InversionesNodo");

            migrationBuilder.DropColumn(
                name: "ClanId",
                table: "InversionesNodo");

            migrationBuilder.DropColumn(
                name: "Costo",
                table: "InversionesNodo");

            migrationBuilder.DropColumn(
                name: "NivelAlcanzado",
                table: "InversionesNodo");

            migrationBuilder.DropColumn(
                name: "LlavesRequeridas",
                table: "Cofres");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "BeneficiosAliado");

            migrationBuilder.DropColumn(
                name: "Destacado",
                table: "BeneficiosAliado");

            migrationBuilder.DropColumn(
                name: "FechaVencimiento",
                table: "BeneficiosAliado");

            migrationBuilder.RenameColumn(
                name: "CostoPuntos",
                table: "Nodos",
                newName: "CostoXp");

            migrationBuilder.DropColumn(
                name: "NivelMaximo",
                table: "Nodos");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InversionesNodo",
                table: "InversionesNodo",
                columns: new[] { "MiembroId", "NodoId" });

            migrationBuilder.AddForeignKey(
                name: "FK_InversionesNodo_Miembros_MiembroId",
                table: "InversionesNodo",
                column: "MiembroId",
                principalTable: "Miembros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
