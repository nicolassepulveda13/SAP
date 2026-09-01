namespace SilverbackApi.Domain.Models;

public class Trofeo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public TipoTrofeo Tipo { get; set; }
    public DateTime ObtendioEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
