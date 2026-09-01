using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class NodoRepository(AppDbContext db)
{
    public Task<Nodo?> BuscarPorId(Guid id) =>
        db.Nodos
            .Include(n => n.Requiere).ThenInclude(r => r.Prerequisito)
            .FirstOrDefaultAsync(n => n.Id == id);

    public async Task<InversionNodo> CrearInversion(Guid miembroId, Guid nodoId)
    {
        var inv = new InversionNodo { MiembroId = miembroId, NodoId = nodoId };
        db.InversionesNodo.Add(inv);
        await db.SaveChangesAsync();
        return inv;
    }
}
