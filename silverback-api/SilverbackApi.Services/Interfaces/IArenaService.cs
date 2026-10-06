using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

// S6: XpGanado se completa al registrar (1 XP cada 10 de CER); en la vista previa de la calculadora queda en 0
public record ResultadoCER(decimal Puntaje, decimal Modificador, string Descripcion, int XpGanado = 0);

public interface IArenaService
{
    Task<ResultadoCER> RegistrarEntrenamiento(Guid miembroId, string ejercicio, decimal pesoKg, int repeticiones);
    Task<List<Entrenamiento>> ObtenerHistorial(Guid miembroId, int pagina, string? ejercicio);
    Task<Guid?> ObtenerClanId(Guid miembroId);
}
