using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record ResultadoCER(decimal Puntaje, decimal Modificador, string Descripcion);

public interface IArenaService
{
    Task<GuerraGlobal?> ObtenerGuerraActiva();
    Task<ResultadoCER> RegistrarEntrenamiento(Guid miembroId, string ejercicio, decimal pesoKg, int repeticiones);
    Task<List<Entrenamiento>> ObtenerHistorial(Guid miembroId, int pagina);
}
