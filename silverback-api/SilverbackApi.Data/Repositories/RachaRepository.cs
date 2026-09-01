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

    public async Task Restaurar(Guid miembroId)
    {
        var racha = await db.Rachas.FirstOrDefaultAsync(r => r.MiembroId == miembroId);
        if (racha is null) return;
        racha.Estado = EstadoRacha.ACTIVA;
        await db.SaveChangesAsync();
    }
}
