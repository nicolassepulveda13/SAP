namespace SilverbackApi.Domain.Models;

public class GuerraGlobal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Semana { get; set; } = null!;
    public EstadoGuerra Estado { get; set; } = EstadoGuerra.ACTIVA;
    public DateTime FechaFin { get; set; }

    public ICollection<ParticipacionGuerra> Participaciones { get; set; } = [];
}

public class ParticipacionGuerra
{
    public Guid GuerraId { get; set; }
    public Guid ClanId { get; set; }
    public decimal CerAcumulado { get; set; } = 0;
    public int Posicion { get; set; } = 0;

    public GuerraGlobal Guerra { get; set; } = null!;
    public Clan Clan { get; set; } = null!;
}
