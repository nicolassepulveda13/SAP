using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class ClanRepository(AppDbContext db)
{
    public Task<Clan?> BuscarPorId(Guid id) =>
        db.Clanes.Include(c => c.Miembros).FirstOrDefaultAsync(c => c.Id == id);

    public Task<Clan?> BuscarPorNombre(string nombre) =>
        db.Clanes.FirstOrDefaultAsync(c => c.Nombre == nombre);

    public Task<List<Clan>> Listar() =>
        db.Clanes.OrderByDescending(c => c.PuntosClan).ToListAsync();

    public async Task<Clan> Crear(Clan clan)
    {
        db.Clanes.Add(clan);
        await db.SaveChangesAsync();
        return clan;
    }

    public Task SumarCER(Guid clanId, decimal cer) =>
        db.Clanes.Where(c => c.Id == clanId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.PuntosClan, c => c.PuntosClan + (int)cer));

    public Task DescontarPuntos(Guid clanId, int puntos) =>
        db.Clanes.Where(c => c.Id == clanId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.PuntosClan, c => c.PuntosClan - puntos));

    public Task ActualizarCantidadMiembros(Guid clanId, int delta) =>
        db.Clanes.Where(c => c.Id == clanId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.CantidadMiembros, c => c.CantidadMiembros + delta));
}
