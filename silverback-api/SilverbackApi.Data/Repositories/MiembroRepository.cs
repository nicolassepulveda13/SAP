using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class MiembroRepository(AppDbContext db)
{
    public Task<Miembro?> BuscarPorId(Guid id) =>
        db.Miembros.Include(m => m.Clan).FirstOrDefaultAsync(m => m.Id == id);

    public Task<Miembro?> BuscarPorEmail(string email) =>
        db.Miembros.FirstOrDefaultAsync(m => m.Email == email);

    public async Task<Miembro> Crear(Miembro miembro)
    {
        db.Miembros.Add(miembro);
        await db.SaveChangesAsync();
        return miembro;
    }

    public Task ActualizarXP(Guid id, int delta) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Xp, m => m.Xp + delta));

    public Task ActualizarCoins(Guid id, int delta) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Coins, m => m.Coins + delta));

    public Task ActualizarClan(Guid id, Guid? clanId) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ClanId, clanId));

    public Task CompletarOnboarding(Guid id) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.OnboardingCompletado, true));
}
