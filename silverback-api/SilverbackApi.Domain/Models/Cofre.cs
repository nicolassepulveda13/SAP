namespace SilverbackApi.Domain.Models;

public class Cofre
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public RarezaCofre Rareza { get; set; }
    public EstadoCofre Estado { get; set; } = EstadoCofre.DISPONIBLE;
    public DateTime ObtendioEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
