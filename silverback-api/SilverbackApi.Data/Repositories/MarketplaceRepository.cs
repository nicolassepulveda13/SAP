using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class MarketplaceRepository(AppDbContext db)
{
    public Task<List<Item>> Listar(CategoriaItem? categoria) =>
        categoria is null
            ? db.Items.OrderBy(i => i.Precio).ToListAsync()
            : db.Items.Where(i => i.Categoria == categoria).OrderBy(i => i.Precio).ToListAsync();

    public Task<Item?> BuscarItem(Guid id) =>
        db.Items.FirstOrDefaultAsync(i => i.Id == id);

    public Task<bool> Posee(Guid miembroId, Guid itemId) =>
        db.InventarioItems.AnyAsync(i => i.MiembroId == miembroId && i.ItemId == itemId);

    // Inventario + transacción en un solo SaveChanges (misma transacción)
    public async Task RegistrarCompra(Guid miembroId, Guid itemId)
    {
        db.InventarioItems.Add(new InventarioItem { MiembroId = miembroId, ItemId = itemId });
        db.TransaccionesMarketplace.Add(new TransaccionMarketplace { MiembroId = miembroId, ItemId = itemId });
        await db.SaveChangesAsync();
    }

    public Task<List<InventarioItem>> Inventario(Guid miembroId) =>
        db.InventarioItems.Where(i => i.MiembroId == miembroId).Include(i => i.Item)
            .OrderBy(i => i.Item.Categoria).ThenBy(i => i.Item.Nombre).ToListAsync();

    // Uno activo por categoría: se desactivan los demás de esa categoría y se activa el elegido
    public async Task<bool> Activar(Guid miembroId, Guid itemId)
    {
        var item = await db.InventarioItems.Include(i => i.Item)
            .FirstOrDefaultAsync(i => i.MiembroId == miembroId && i.ItemId == itemId);
        if (item is null) return false;
        var categoria = item.Item.Categoria;
        await db.InventarioItems.Where(i => i.MiembroId == miembroId && i.Item.Categoria == categoria)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.Activo, i => i.ItemId == itemId));
        return true;
    }
}
