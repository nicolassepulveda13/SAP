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
    ICerService cerService) : IArenaService
{
    public Task<GuerraGlobal?> ObtenerGuerraActiva() =>
        guerraRepo.FindGuerraActiva();

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
            var guerra = await guerraRepo.FindGuerraActiva();
            await clanRepo.SumarCER(miembro.ClanId.Value, resultado.Puntaje);
            if (guerra is not null)
                await guerraRepo.SumarCER(guerra.Id, miembro.ClanId.Value, resultado.Puntaje);
        }

        await ActualizarRacha(miembroId);
        await historialRepo.Registrar(miembroId, "ENTRENAMIENTO", $"CER: {resultado.Puntaje}");

        return resultado;
    }

    public Task<List<Entrenamiento>> ObtenerHistorial(Guid miembroId, int pagina) =>
        entrenamientoRepo.Listar(miembroId, pagina);

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
