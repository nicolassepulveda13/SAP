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

    public async Task RegistrarCompra(Guid miembroId, Guid itemId)
    {
        db.InventarioItems.Add(new InventarioItem { MiembroId = miembroId, ItemId = itemId });
        await db.SaveChangesAsync();
    }
}
