using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class CofreRepository(AppDbContext db)
{
    public Task<bool> ExisteDesde(Guid miembroId, OrigenCofre origen, DateTime desdeUtc) =>
        db.Cofres.AnyAsync(c => c.MiembroId == miembroId && c.Origen == origen && c.ObtendioEn >= desdeUtc);

    public Task<List<Cofre>> ListarDisponibles(Guid miembroId) =>
        db.Cofres
            .Where(c => c.MiembroId == miembroId && c.Estado == EstadoCofre.DISPONIBLE)
            .ToListAsync();

    public Task<Cofre?> BuscarDisponible(Guid cofreId, Guid miembroId) =>
        db.Cofres.FirstOrDefaultAsync(c => c.Id == cofreId && c.MiembroId == miembroId && c.Estado == EstadoCofre.DISPONIBLE);

    // Atómico: solo pasa a RECLAMADO si seguía DISPONIBLE (dos clics no acreditan dos veces)
    public async Task<bool> MarcarReclamado(Guid cofreId, Guid miembroId) =>
        await db.Cofres.Where(c => c.Id == cofreId && c.MiembroId == miembroId && c.Estado == EstadoCofre.DISPONIBLE)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.Estado, EstadoCofre.RECLAMADO)) == 1;

    public async Task Crear(Guid miembroId, RarezaCofre rareza, OrigenCofre origen, int llavesRequeridas = 0)
    {
        db.Cofres.Add(new Cofre { MiembroId = miembroId, Rareza = rareza, Origen = origen, LlavesRequeridas = llavesRequeridas });
        await db.SaveChangesAsync();
    }
}
