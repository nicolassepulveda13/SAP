namespace SilverbackApi.Domain.Models;

public class DatosBiometricos
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public int Edad { get; set; }
    public decimal PesoKg { get; set; }
    public decimal AlturaCm { get; set; }
    public NivelExperiencia NivelExperiencia { get; set; }
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
