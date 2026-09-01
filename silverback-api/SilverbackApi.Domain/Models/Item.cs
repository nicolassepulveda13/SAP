namespace SilverbackApi.Domain.Models;

public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public CategoriaItem Categoria { get; set; }
    public int Precio { get; set; }
    public string? ImagenUrl { get; set; }

    public ICollection<InventarioItem> Inventarios { get; set; } = [];
}

public class InventarioItem
{
    public Guid MiembroId { get; set; }
    public Guid ItemId { get; set; }
    public DateTime CompradoEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
    public Item Item { get; set; } = null!;
}
