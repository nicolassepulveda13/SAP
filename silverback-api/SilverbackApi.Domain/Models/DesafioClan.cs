namespace SilverbackApi.Domain.Models;

public class DesafioClan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClanId { get; set; }
    public string Descripcion { get; set; } = null!;
    public TierDesafio Tier { get; set; }
    public EstadoDesafio Estado { get; set; } = EstadoDesafio.PENDIENTE;
    public int RecompensaXp { get; set; }
    public DateTime FechaExpiracion { get; set; }

    public Clan Clan { get; set; } = null!;
}
