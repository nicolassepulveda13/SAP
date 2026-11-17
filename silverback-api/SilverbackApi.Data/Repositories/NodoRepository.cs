using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

// CU-004-002: árbol colectivo del clan — catálogo de nodos, nivel de cada nodo por clan e historial de inversiones
public class NodoRepository(AppDbContext db)
{
    public Task<Nodo?> BuscarPorId(Guid id) =>
        db.Nodos
            .Include(n => n.Requiere).ThenInclude(r => r.Prerequisito)
            .FirstOrDefaultAsync(n => n.Id == id);

    // Con prerequisitos: sin el Include llegaban vacíos y la pantalla mostraba nodos bloqueados como disponibles
    public Task<List<Nodo>> Listar() =>
        db.Nodos.Include(n => n.Requiere).OrderBy(n => n.CostoPuntos).ThenBy(n => n.Nombre).ToListAsync();

    public Task<Dictionary<Guid, int>> NivelesDelClan(Guid clanId) =>
        db.NodosClan.Where(n => n.ClanId == clanId).ToDictionaryAsync(n => n.NodoId, n => n.Nivel);

    // Atómico: sube un nivel solo si el nodo sigue en el nivel esperado (dos mejoras simultáneas no saltan niveles)
    public async Task<bool> SubirNivel(Guid clanId, Guid nodoId, int nivelActual)
    {
        if (nivelActual == 0)
        {
            db.NodosClan.Add(new NodoClan { ClanId = clanId, NodoId = nodoId, Nivel = 1 });
            try { await db.SaveChangesAsync(); return true; }
            catch (DbUpdateException) { db.ChangeTracker.Clear(); return false; }
        }
        return await db.NodosClan.Where(n => n.ClanId == clanId && n.NodoId == nodoId && n.Nivel == nivelActual)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Nivel, nivelActual + 1)) == 1;
    }

    public async Task<InversionNodo> RegistrarInversion(InversionNodo inv)
    {
        db.InversionesNodo.Add(inv);
        await db.SaveChangesAsync();
        return inv;
    }

    public Task<List<InversionNodo>> UltimasInversiones(Guid clanId, int cantidad = 5) =>
        db.InversionesNodo.Where(i => i.ClanId == clanId)
            .Include(i => i.Nodo).Include(i => i.Miembro)
            .OrderByDescending(i => i.InvertidoEn)
            .Take(cantidad)
            .ToListAsync();
}
