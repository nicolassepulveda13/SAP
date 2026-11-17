// S4-Arena: ArenaService — lógica del registro de entrenamiento y racha
// S4-RegistrarEntrenamiento: calcula CER via ICerService, persiste Entrenamiento, acumula CER al Clan y a la GuerraGlobal activa
// S4-Racha: ActualizarRacha() — incrementa racha si el último entrenamiento fue ayer; resetea si hubo salto de días
// S6-Guerra: el CER se acredita a la guerra de la semana actual (GuerraService la abre/cierra si hace falta)
// S6-XP: suma XP al miembro (1 XP cada 10 de CER), como pide la secuencia aprobada de CU-003-002
// S8-Fix: la racha cuenta días en hora Argentina (antes usaba UTC: entrenar a las 22 h contaba para el día siguiente)
// S7-Fix: hitos (trofeo + cofre), Llaves de Acero y subida de rango (RecompensasService) — antes un usuario nuevo
//         nunca recibía cofres ni trofeos y el rango quedaba en BRONCE para siempre. Reglas en Progresion.cs.
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
    RecompensasService recompensas,
    ICerService cerService,
    IGuerraService guerraService) : IArenaService
{
    private const int CerPorXp = 10;

    public async Task<ResultadoCER> RegistrarEntrenamiento(Guid miembroId, string ejercicio, decimal pesoKg, int repeticiones)
    {
        // S10-Validación: antes no se validaba nada (un peso negativo restaba CER al clan y a la guerra)
        if (string.IsNullOrWhiteSpace(ejercicio))
            throw new InvalidOperationException("Indicá el ejercicio.");
        if (pesoKg <= 0 || pesoKg > 500)
            throw new InvalidOperationException("El peso debe estar entre 0 y 500 kg.");
        if (repeticiones < 1 || repeticiones > 200)
            throw new InvalidOperationException("Las repeticiones deben estar entre 1 y 200.");

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

        var diasRacha = await ActualizarRacha(miembroId);
        await recompensas.AlEntrenar(miembroId, diasRacha);
        await historialRepo.Registrar(miembroId, "ENTRENAMIENTO", $"CER: {resultado.Puntaje} · XP: {xp}");

        return resultado with { XpGanado = xp };
    }

    public Task<List<Entrenamiento>> ObtenerHistorial(Guid miembroId, int pagina, string? ejercicio) =>
        entrenamientoRepo.Listar(miembroId, pagina, ejercicio: ejercicio);

    public async Task<Guid?> ObtenerClanId(Guid miembroId) =>
        (await miembroRepo.BuscarPorId(miembroId))?.ClanId;

    // Devuelve los días consecutivos después de registrar el entrenamiento
    private async Task<int> ActualizarRacha(Guid miembroId)
    {
        var hoy = HoraArgentina.Hoy();
        var racha = await rachaRepo.ObtenerPorMiembro(miembroId);
        var ultimo = racha?.UltimoEntrenamiento is { } u ? HoraArgentina.FechaDe(u) : (DateTime?)null;

        if (racha is not null && ultimo == hoy && racha.DiasConsecutivos > 0) return racha.DiasConsecutivos;
        // Hoy ya contado (entrenó o lo mantuvo con un rescate, CU-005-003) → arriba. Consecutivo si el último fue ayer.
        var esConsecutivo = racha is not null && racha.DiasConsecutivos > 0 && ultimo == hoy.AddDays(-1);
        var dias = esConsecutivo ? racha!.DiasConsecutivos + 1 : 1;
        await rachaRepo.CrearOActualizar(miembroId, dias, EstadoRacha.ACTIVA, DateTime.UtcNow);
        return dias;
    }
}
