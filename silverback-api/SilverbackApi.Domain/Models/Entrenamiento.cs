namespace SilverbackApi.Domain.Models;

public class Entrenamiento
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public string Ejercicio { get; set; } = null!;
    public decimal PesoKg { get; set; }
    public int Repeticiones { get; set; }
    public decimal PuntajeCer { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
}
