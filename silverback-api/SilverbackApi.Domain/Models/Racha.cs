namespace SilverbackApi.Domain.Models;

public class Racha
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public int DiasConsecutivos { get; set; } = 0;
    public EstadoRacha Estado { get; set; } = EstadoRacha.ACTIVA;
    public DateTime? UltimoEntrenamiento { get; set; }

    public Miembro Miembro { get; set; } = null!;
}
