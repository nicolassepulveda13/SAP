using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class SantuarioService(
    ClanRepository clanRepo,
    MiembroRepository miembroRepo,
    SantuarioRepository santuarioRepo) : ISantuarioService
{
    public async Task<Clan> ObtenerClan(Guid clanId) =>
        await clanRepo.BuscarPorId(clanId) ?? throw new InvalidOperationException("Clan no encontrado.");

    public Task<List<Miembro>> ListarMiembros(Guid clanId) =>
        santuarioRepo.ListarMiembros(clanId);

    public Task<List<DesafioClan>> ListarDesafios(Guid clanId) =>
        santuarioRepo.ListarDesafios(clanId);

    public async Task<DesafioClan> CrearDesafio(Guid clanId, Guid silverbackId, string descripcion, string tier, int recompensaXp, DateTime fechaExpiracion)
    {
        var miembro = await miembroRepo.BuscarPorId(silverbackId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        if (miembro.Rol != Rol.SILVERBACK)
            throw new UnauthorizedAccessException("Solo el SILVERBACK puede crear desafíos.");

        return await santuarioRepo.CrearDesafio(new DesafioClan
        {
            ClanId = clanId,
            Descripcion = descripcion,
            Tier = Enum.Parse<TierDesafio>(tier),
            Estado = EstadoDesafio.ACTIVO,
            RecompensaXp = recompensaXp,
            FechaExpiracion = fechaExpiracion,
        });
    }

    public Task<List<MensajeClan>> ListarMensajes(Guid clanId) =>
        santuarioRepo.ListarMensajes(clanId);

    public Task<MensajeClan> EnviarMensaje(Guid clanId, Guid miembroId, string contenido) =>
        santuarioRepo.EnviarMensaje(new MensajeClan
        {
            ClanId = clanId,
            MiembroId = miembroId,
            Contenido = contenido,
        });
}
