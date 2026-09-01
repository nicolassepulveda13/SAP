namespace SilverbackApi.Domain.Models;

public class DatosFatiga
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public decimal CargaSemanal { get; set; } = 0;
    public EstadoFatiga NivelFatiga { get; set; } = EstadoFatiga.OPTIMA;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
