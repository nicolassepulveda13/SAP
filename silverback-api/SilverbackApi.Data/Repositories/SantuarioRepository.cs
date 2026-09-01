using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class SantuarioRepository(AppDbContext db)
{
    public Task<List<Miembro>> ListarMiembros(Guid clanId) =>
        db.Miembros.Where(m => m.ClanId == clanId).ToListAsync();

    public Task<List<DesafioClan>> ListarDesafios(Guid clanId) =>
        db.DesafiosClan
            .Where(d => d.ClanId == clanId && d.Estado == EstadoDesafio.ACTIVO)
            .ToListAsync();

    public async Task<DesafioClan> CrearDesafio(DesafioClan desafio)
    {
        db.DesafiosClan.Add(desafio);
        await db.SaveChangesAsync();
        return desafio;
    }

    public Task<List<MensajeClan>> ListarMensajes(Guid clanId, int limite = 50) =>
        db.MensajesClan
            .Where(m => m.ClanId == clanId)
            .OrderByDescending(m => m.EnviadoEn)
            .Take(limite)
            .Include(m => m.Miembro)
            .ToListAsync();

    public async Task<MensajeClan> EnviarMensaje(MensajeClan mensaje)
    {
        db.MensajesClan.Add(mensaje);
        await db.SaveChangesAsync();
        return mensaje;
    }
}
