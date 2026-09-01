using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilverbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AliadosComerciales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UrlBase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AliadosComerciales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clanes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LiderClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PuntosClan = table.Column<int>(type: "int", nullable: false),
                    CantidadMiembros = table.Column<int>(type: "int", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clanes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GuerrasGlobales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Semana = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuerrasGlobales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Precio = table.Column<int>(type: "int", nullable: false),
                    ImagenUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Nodos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CostoXp = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nodos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BeneficiosAliado",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AliadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RangoMinimo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeneficiosAliado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BeneficiosAliado_AliadosComerciales_AliadoId",
                        column: x => x.AliadoId,
                        principalTable: "AliadosComerciales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DesafiosClan",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecompensaXp = table.Column<int>(type: "int", nullable: false),
                    FechaExpiracion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DesafiosClan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DesafiosClan_Clanes_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clanes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Miembros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rango = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Arquetipo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Xp = table.Column<int>(type: "int", nullable: false),
                    Coins = table.Column<int>(type: "int", nullable: false),
                    ClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Miembros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Miembros_Clanes_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clanes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ParticipacionesGuerra",
                columns: table => new
                {
                    GuerraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CerAcumulado = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Posicion = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipacionesGuerra", x => new { x.GuerraId, x.ClanId });
                    table.ForeignKey(
                        name: "FK_ParticipacionesGuerra_Clanes_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clanes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ParticipacionesGuerra_GuerrasGlobales_GuerraId",
                        column: x => x.GuerraId,
                        principalTable: "GuerrasGlobales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NodoDependencias",
                columns: table => new
                {
                    NodoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PrerequisiteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NodoDependencias", x => new { x.NodoId, x.PrerequisiteId });
                    table.ForeignKey(
                        name: "FK_NodoDependencias_Nodos_NodoId",
                        column: x => x.NodoId,
                        principalTable: "Nodos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NodoDependencias_Nodos_PrerequisiteId",
                        column: x => x.PrerequisiteId,
                        principalTable: "Nodos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AdminHistorial",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Detalle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OcurrioEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminHistorial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdminHistorial_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cofres",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Rareza = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObtendioEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cofres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cofres_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DatosBiometricos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Edad = table.Column<int>(type: "int", nullable: false),
                    PesoKg = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    AlturaCm = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    NivelExperiencia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatosBiometricos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DatosBiometricos_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DatosFatiga",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CargaSemanal = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    NivelFatiga = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatosFatiga", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DatosFatiga_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entrenamientos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ejercicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PesoKg = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    Repeticiones = table.Column<int>(type: "int", nullable: false),
                    PuntajeCer = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entrenamientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entrenamientos_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventarioItems",
                columns: table => new
                {
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompradoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventarioItems", x => new { x.MiembroId, x.ItemId });
                    table.ForeignKey(
                        name: "FK_InventarioItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventarioItems_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InversionesNodo",
                columns: table => new
                {
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NodoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvertidoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InversionesNodo", x => new { x.MiembroId, x.NodoId });
                    table.ForeignKey(
                        name: "FK_InversionesNodo_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InversionesNodo_Nodos_NodoId",
                        column: x => x.NodoId,
                        principalTable: "Nodos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MensajesClan",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Contenido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnviadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensajesClan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensajesClan_Clanes_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clanes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MensajesClan_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rachas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiasConsecutivos = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UltimoEntrenamiento = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rachas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rachas_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReclamosBeneficio",
                columns: table => new
                {
                    BeneficioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReclamadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReclamosBeneficio", x => new { x.BeneficioId, x.MiembroId });
                    table.ForeignKey(
                        name: "FK_ReclamosBeneficio_BeneficiosAliado_BeneficioId",
                        column: x => x.BeneficioId,
                        principalTable: "BeneficiosAliado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReclamosBeneficio_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Trofeos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObtendioEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trofeos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trofeos_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminHistorial_MiembroId",
                table: "AdminHistorial",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiosAliado_AliadoId",
                table: "BeneficiosAliado",
                column: "AliadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Clanes_Nombre",
                table: "Clanes",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cofres_MiembroId",
                table: "Cofres",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_DatosBiometricos_MiembroId",
                table: "DatosBiometricos",
                column: "MiembroId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DatosFatiga_MiembroId",
                table: "DatosFatiga",
                column: "MiembroId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DesafiosClan_ClanId",
                table: "DesafiosClan",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Entrenamientos_MiembroId",
                table: "Entrenamientos",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_GuerrasGlobales_Semana",
                table: "GuerrasGlobales",
                column: "Semana",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventarioItems_ItemId",
                table: "InventarioItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InversionesNodo_NodoId",
                table: "InversionesNodo",
                column: "NodoId");

            migrationBuilder.CreateIndex(
                name: "IX_MensajesClan_ClanId",
                table: "MensajesClan",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_MensajesClan_MiembroId",
                table: "MensajesClan",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_Miembros_ClanId",
                table: "Miembros",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Miembros_Email",
                table: "Miembros",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NodoDependencias_PrerequisiteId",
                table: "NodoDependencias",
                column: "PrerequisiteId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipacionesGuerra_ClanId",
                table: "ParticipacionesGuerra",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Rachas_MiembroId",
                table: "Rachas",
                column: "MiembroId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReclamosBeneficio_MiembroId",
                table: "ReclamosBeneficio",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_Trofeos_MiembroId",
                table: "Trofeos",
                column: "MiembroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminHistorial");

            migrationBuilder.DropTable(
                name: "Cofres");

            migrationBuilder.DropTable(
                name: "DatosBiometricos");

            migrationBuilder.DropTable(
                name: "DatosFatiga");

            migrationBuilder.DropTable(
                name: "DesafiosClan");

            migrationBuilder.DropTable(
                name: "Entrenamientos");

            migrationBuilder.DropTable(
                name: "InventarioItems");

            migrationBuilder.DropTable(
                name: "InversionesNodo");

            migrationBuilder.DropTable(
                name: "MensajesClan");

            migrationBuilder.DropTable(
                name: "NodoDependencias");

            migrationBuilder.DropTable(
                name: "ParticipacionesGuerra");

            migrationBuilder.DropTable(
                name: "Rachas");

            migrationBuilder.DropTable(
                name: "ReclamosBeneficio");

            migrationBuilder.DropTable(
                name: "Trofeos");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Nodos");

            migrationBuilder.DropTable(
                name: "GuerrasGlobales");

            migrationBuilder.DropTable(
                name: "BeneficiosAliado");

            migrationBuilder.DropTable(
                name: "Miembros");

            migrationBuilder.DropTable(
                name: "AliadosComerciales");

            migrationBuilder.DropTable(
                name: "Clanes");
        }
    }
}
