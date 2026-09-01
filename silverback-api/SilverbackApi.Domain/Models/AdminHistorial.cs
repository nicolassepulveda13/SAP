namespace SilverbackApi.Domain.Models;

public class AdminHistorial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public string Tipo { get; set; } = null!;
    public string Detalle { get; set; } = null!;
    public DateTime OcurrioEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
