// S4-Arena: ArenaService — lógica del registro de entrenamiento y racha
// S4-RegistrarEntrenamiento: calcula CER via ICerService, persiste Entrenamiento, acumula CER al Clan y a la GuerraGlobal activa
// S4-Racha: ActualizarRacha() — incrementa racha si el último entrenamiento fue ayer; resetea si hubo salto de días
// S6-Guerra: el CER se acredita a la guerra de la semana actual (GuerraService la abre/cierra si hace falta)
// S6-XP: suma XP al miembro (1 XP cada 10 de CER), como pide la secuencia aprobada de CU-003-002
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class ArenaService(
    MiembroRepository miembroRepo,
    EntrenamientoRepository entrenamientoRepo,
    GuerraRepository guerraRepo,
    ClanRepository clanRepo,
    RachaRepository rachaRepo,
    AdminHistorialRepository historialRepo,
    ICerService cerService,
    IGuerraService guerraService) : IArenaService
{
    private const int CerPorXp = 10;

    public async Task<ResultadoCER> RegistrarEntrenamiento(Guid miembroId, string ejercicio, decimal pesoKg, int repeticiones)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");

        var resultado = cerService.Calcular(pesoKg, repeticiones, miembro.Arquetipo ?? Arquetipo.ATLETICO);

        await entrenamientoRepo.Crear(new Entrenamiento
        {
            MiembroId = miembroId,
            Ejercicio = ejercicio,
            PesoKg = pesoKg,
            Repeticiones = repeticiones,
            PuntajeCer = resultado.Puntaje,
        });

        if (miembro.ClanId.HasValue)
        {
            var guerra = await guerraService.AsegurarGuerraActiva();
            await clanRepo.SumarCER(miembro.ClanId.Value, resultado.Puntaje);
            await guerraRepo.SumarCER(guerra.Id, miembro.ClanId.Value, resultado.Puntaje);
        }

        var xp = (int)Math.Floor(resultado.Puntaje / CerPorXp);
        if (xp > 0) await miembroRepo.ActualizarXP(miembroId, xp);

        await ActualizarRacha(miembroId);
        await historialRepo.Registrar(miembroId, "ENTRENAMIENTO", $"CER: {resultado.Puntaje} · XP: {xp}");

        return resultado with { XpGanado = xp };
    }

    public Task<List<Entrenamiento>> ObtenerHistorial(Guid miembroId, int pagina, string? ejercicio) =>
        entrenamientoRepo.Listar(miembroId, pagina, ejercicio: ejercicio);

    public async Task<Guid?> ObtenerClanId(Guid miembroId) =>
        (await miembroRepo.BuscarPorId(miembroId))?.ClanId;

    private async Task ActualizarRacha(Guid miembroId)
    {
        var hoy = DateTime.UtcNow.Date;
        var racha = await rachaRepo.ObtenerPorMiembro(miembroId);

        if (racha is null)
        {
            await rachaRepo.CrearOActualizar(miembroId, 1, EstadoRacha.ACTIVA, DateTime.UtcNow);
            return;
        }

        var ayer = hoy.AddDays(-1);
        var ultimo = racha.UltimoEntrenamiento?.Date;

        if (ultimo == hoy) return;

        var esConsecutivo = ultimo == ayer;
        await rachaRepo.CrearOActualizar(
            miembroId,
            esConsecutivo ? racha.DiasConsecutivos + 1 : 1,
            EstadoRacha.ACTIVA,
            DateTime.UtcNow
        );
    }
}
