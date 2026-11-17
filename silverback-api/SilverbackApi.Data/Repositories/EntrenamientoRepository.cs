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

    // S6-Historial: filtro opcional por nombre de ejercicio (contiene, sin distinguir mayúsculas)
    public Task<List<Entrenamiento>> Listar(Guid miembroId, int pagina = 1, int porPagina = 20, string? ejercicio = null) =>
        db.Entrenamientos
            .Where(e => e.MiembroId == miembroId)
            .Where(e => string.IsNullOrWhiteSpace(ejercicio) || e.Ejercicio.Contains(ejercicio))
            .OrderByDescending(e => e.FechaHora)
            .Skip((pagina - 1) * porPagina)
            .Take(porPagina)
            .ToListAsync();

    public Task<int> Contar(Guid miembroId) =>
        db.Entrenamientos.CountAsync(e => e.MiembroId == miembroId);

    public async Task<decimal> CerTotal(Guid miembroId) =>
        await db.Entrenamientos.Where(e => e.MiembroId == miembroId).SumAsync(e => (decimal?)e.PuntajeCer) ?? 0;

    // Historial completo (atributos y dashboard). Volumen acotado: un miembro registra pocas sesiones por día.
    public Task<List<Entrenamiento>> ListarTodos(Guid miembroId) =>
        db.Entrenamientos.AsNoTracking().Where(e => e.MiembroId == miembroId).ToListAsync();

    public Task<List<Entrenamiento>> ListarDeMiembros(IEnumerable<Guid> miembroIds) =>
        db.Entrenamientos.AsNoTracking().Where(e => miembroIds.Contains(e.MiembroId)).ToListAsync();

    public Task<List<Entrenamiento>> ListarDesde(Guid miembroId, DateTime desdeUtc) =>
        db.Entrenamientos.AsNoTracking().Where(e => e.MiembroId == miembroId && e.FechaHora >= desdeUtc).ToListAsync();

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
