namespace SilverbackApi.Domain.Models;

public class Clan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public Guid? LiderClanId { get; set; }
    public int PuntosClan { get; set; } = 0;
    public int CantidadMiembros { get; set; } = 0;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    public ICollection<Miembro> Miembros { get; set; } = [];
    public ICollection<ParticipacionGuerra> Participaciones { get; set; } = [];
    public ICollection<DesafioClan> Desafios { get; set; } = [];
    public ICollection<MensajeClan> Mensajes { get; set; } = [];
}
