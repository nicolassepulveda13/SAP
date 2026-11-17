namespace SilverbackApi.Domain.Models;

public class Cofre
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public RarezaCofre Rareza { get; set; }
    public EstadoCofre Estado { get; set; } = EstadoCofre.DISPONIBLE;
    // CU-004-003: > 0 = cofre BLOQUEADO hasta pagar esa cantidad de Llaves de Acero
    public int LlavesRequeridas { get; set; } = 0;
    public OrigenCofre Origen { get; set; } = OrigenCofre.HITO;
    public DateTime ObtendioEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
