using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class TrofeoRepository(AppDbContext db)
{
    public Task<List<Trofeo>> ListarPorMiembro(Guid miembroId) =>
        db.Trofeos.Where(t => t.MiembroId == miembroId).ToListAsync();

    public async Task<Trofeo> Crear(Trofeo trofeo)
    {
        db.Trofeos.Add(trofeo);
        await db.SaveChangesAsync();
        return trofeo;
    }
}
