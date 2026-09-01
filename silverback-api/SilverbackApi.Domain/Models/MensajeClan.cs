namespace SilverbackApi.Domain.Models;

public class MensajeClan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClanId { get; set; }
    public Guid MiembroId { get; set; }
    public string Contenido { get; set; } = null!;
    public TipoMensaje Tipo { get; set; } = TipoMensaje.TEXTO;
    public DateTime EnviadoEn { get; set; } = DateTime.UtcNow;

    public Clan Clan { get; set; } = null!;
    public Miembro Miembro { get; set; } = null!;
}
