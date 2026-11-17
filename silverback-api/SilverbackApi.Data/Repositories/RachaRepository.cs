using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class RachaRepository(AppDbContext db)
{
    public Task<Racha?> ObtenerPorMiembro(Guid miembroId) =>
        db.Rachas.FirstOrDefaultAsync(r => r.MiembroId == miembroId);

    public async Task<Racha> CrearOActualizar(Guid miembroId, int diasConsecutivos, EstadoRacha estado, DateTime? ultimoEntrenamiento)
    {
        var racha = await db.Rachas.FirstOrDefaultAsync(r => r.MiembroId == miembroId);
        if (racha is null)
        {
            racha = new Racha { MiembroId = miembroId };
            db.Rachas.Add(racha);
        }
        racha.DiasConsecutivos = diasConsecutivos;
        racha.Estado = estado;
        racha.UltimoEntrenamiento = ultimoEntrenamiento;
        await db.SaveChangesAsync();
        return racha;
    }

    // CU-005-003: el día en curso queda "mantenido" (UltimoEntrenamiento = ahora) sin tocar el contador
    public Task Restaurar(Guid miembroId, DateTime ahoraUtc) =>
        db.Rachas.Where(r => r.MiembroId == miembroId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(r => r.Estado, EstadoRacha.ACTIVA)
                .SetProperty(r => r.UltimoEntrenamiento, ahoraUtc));

    public Task ActualizarEstado(Guid miembroId, EstadoRacha estado) =>
        db.Rachas.Where(r => r.MiembroId == miembroId)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Estado, estado));
}
