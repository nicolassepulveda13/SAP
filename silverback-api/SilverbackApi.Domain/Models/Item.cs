namespace SilverbackApi.Domain.Models;

public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public CategoriaItem Categoria { get; set; }
    public int Precio { get; set; }
    public RarezaItem Rareza { get; set; } = RarezaItem.COMUN;
    public string? ImagenUrl { get; set; }

    public ICollection<InventarioItem> Inventarios { get; set; } = [];
}

public class InventarioItem
{
    public Guid MiembroId { get; set; }
    public Guid ItemId { get; set; }
    public DateTime CompradoEn { get; set; } = DateTime.UtcNow;
    // CU-004-004 paso 18: el ítem queda disponible para activar desde el perfil (uno activo por categoría)
    public bool Activo { get; set; }

    public Miembro Miembro { get; set; } = null!;
    public Item Item { get; set; } = null!;
}

// DER 10.5.8c / RF-011: historial de compras del Marketplace
public class TransaccionMarketplace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public Guid ItemId { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
    public Item Item { get; set; } = null!;
}
