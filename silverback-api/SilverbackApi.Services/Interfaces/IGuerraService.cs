using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record ClanEnGuerra(Guid ClanId, string Nombre, decimal Cer, int Posicion, int Progreso);

public record EstadoGuerraDto(
    Guid Id, string Semana, DateTime FechaInicio, DateTime FechaFin, int DiasRestantes,
    ClanEnGuerra? Nuestro, ClanEnGuerra? Rival, List<ClanEnGuerra> Ranking, int TotalClanes);

// Resultado: VICTORIA | DERROTA | SIN_RIVAL
public record BatallaDto(
    Guid GuerraId, string Semana, DateTime FechaFin, decimal NuestroCer, int NuestraPosicion,
    string? Rival, decimal? RivalCer, string Resultado);

public record HistorialBatallasDto(
    int TotalEnfrentamientos, int Victorias, int TasaVictoria, int RachaActual, List<BatallaDto> Batallas);

public interface IGuerraService
{
    Task<GuerraGlobal> AsegurarGuerraActiva();
    Task<EstadoGuerraDto> ObtenerEstado(Guid? clanId);
    Task<HistorialBatallasDto> ObtenerHistorialBatallas(Guid clanId);
}
