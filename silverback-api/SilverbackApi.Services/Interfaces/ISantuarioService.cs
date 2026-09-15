using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record DesafioClanDto(Guid Id, string Descripcion, string Tier, int RecompensaXp, DateTime FechaExpiracion, bool AceptadoPorMi);
public record PanelClan(string Nombre, int PuntosClan, int CantidadMiembros, int PosicionRanking);

public interface ISantuarioService
{
    Task<Clan> ObtenerClan(Guid clanId);
    Task<List<Miembro>> ListarMiembros(Guid clanId);
    Task<List<DesafioClanDto>> ListarDesafios(Guid clanId, Guid miembroId);
    Task<DesafioClan> CrearDesafio(Guid clanId, Guid silverbackId, string descripcion, string tier, int recompensaXp, DateTime fechaExpiracion);
    Task AceptarDesafio(Guid clanId, Guid desafioId, Guid miembroId);
    Task<PanelClan> ObtenerPanelClan(Guid clanId);
    Task<List<MensajeClan>> ListarMensajes(Guid clanId);
    Task<MensajeClan> EnviarMensaje(Guid clanId, Guid miembroId, string contenido);
}
