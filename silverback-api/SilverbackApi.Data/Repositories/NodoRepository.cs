using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class NodoRepository(AppDbContext db)
{
    public Task<Nodo?> BuscarPorId(Guid id) =>
        db.Nodos
            .Include(n => n.Requiere).ThenInclude(r => r.Prerequisito)
            .FirstOrDefaultAsync(n => n.Id == id);

    public Task<List<Nodo>> Listar() =>
        db.Nodos.OrderBy(n => n.CostoXp).ToListAsync();

    public Task<HashSet<Guid>> IdsInvertidosPor(Guid miembroId) =>
        db.InversionesNodo
            .Where(i => i.MiembroId == miembroId)
            .Select(i => i.NodoId)
            .ToListAsync()
            .ContinueWith(t => t.Result.ToHashSet());

    public async Task<InversionNodo> CrearInversion(Guid miembroId, Guid nodoId)
    {
        var inv = new InversionNodo { MiembroId = miembroId, NodoId = nodoId };
        db.InversionesNodo.Add(inv);
        await db.SaveChangesAsync();
        return inv;
    }
}
