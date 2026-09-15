namespace SilverbackApi.Domain.Models;

public class AceptacionDesafio
{
    public Guid DesafioId { get; set; }
    public Guid MiembroId { get; set; }
    public DateTime AceptadoEn { get; set; } = DateTime.UtcNow;
}
