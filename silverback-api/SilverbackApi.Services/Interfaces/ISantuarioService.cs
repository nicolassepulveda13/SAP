using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public interface ISantuarioService
{
    Task<Clan> ObtenerClan(Guid clanId);
    Task<List<Miembro>> ListarMiembros(Guid clanId);
    Task<List<DesafioClan>> ListarDesafios(Guid clanId);
    Task<DesafioClan> CrearDesafio(Guid clanId, Guid silverbackId, string descripcion, string tier, int recompensaXp, DateTime fechaExpiracion);
    Task<List<MensajeClan>> ListarMensajes(Guid clanId);
    Task<MensajeClan> EnviarMensaje(Guid clanId, Guid miembroId, string contenido);
}
