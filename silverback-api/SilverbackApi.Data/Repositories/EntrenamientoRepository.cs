using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public record EstadisticasEntrenamiento(int TotalSesiones, decimal CargaSemanal, double CerPromedio);

public class EntrenamientoRepository(AppDbContext db)
{
    public async Task<Entrenamiento> Crear(Entrenamiento e)
    {
        db.Entrenamientos.Add(e);
        await db.SaveChangesAsync();
        return e;
    }

    public Task<List<Entrenamiento>> Listar(Guid miembroId, int pagina = 1, int porPagina = 20) =>
        db.Entrenamientos
            .Where(e => e.MiembroId == miembroId)
            .OrderByDescending(e => e.FechaHora)
            .Skip((pagina - 1) * porPagina)
            .Take(porPagina)
            .ToListAsync();

    public async Task<EstadisticasEntrenamiento> ObtenerEstadisticas(Guid miembroId)
    {
        var hace7Dias = DateTime.UtcNow.AddDays(-7);
        var entries = await db.Entrenamientos
            .Where(e => e.MiembroId == miembroId && e.FechaHora >= hace7Dias)
            .ToListAsync();

        return new EstadisticasEntrenamiento(
            TotalSesiones: entries.Count,
            CargaSemanal: entries.Sum(e => e.PuntajeCer),
            CerPromedio: entries.Count > 0 ? entries.Average(e => (double)e.PuntajeCer) : 0
        );
    }
}
