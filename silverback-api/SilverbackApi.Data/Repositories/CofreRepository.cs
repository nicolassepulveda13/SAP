using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class CofreRepository(AppDbContext db)
{
    public Task<List<Cofre>> ListarDisponibles(Guid miembroId) =>
        db.Cofres
            .Where(c => c.MiembroId == miembroId && c.Estado == EstadoCofre.DISPONIBLE)
            .ToListAsync();

    public Task<Cofre?> BuscarDisponible(Guid cofreId, Guid miembroId) =>
        db.Cofres.FirstOrDefaultAsync(c => c.Id == cofreId && c.MiembroId == miembroId && c.Estado == EstadoCofre.DISPONIBLE);

    public async Task MarcarReclamado(Guid cofreId)
    {
        await db.Cofres.Where(c => c.Id == cofreId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.Estado, EstadoCofre.RECLAMADO));
    }
}
