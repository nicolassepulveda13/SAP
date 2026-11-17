using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
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

    // Atómicos: gastan solo si alcanza, en un único UPDATE (evita doble gasto con dos requests en paralelo)
    public async Task<bool> GastarCoins(Guid id, int monto) =>
        await db.Miembros.Where(m => m.Id == id && m.Coins >= monto)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Coins, m => m.Coins - monto)) == 1;

    public async Task<bool> GastarXp(Guid id, int monto) =>
        await db.Miembros.Where(m => m.Id == id && m.Xp >= monto)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Xp, m => m.Xp - monto)) == 1;

    // Lectura sin tracking: los ExecuteUpdate no refrescan entidades ya cargadas en el contexto
    public async Task<(int Xp, Rango Rango)> ObtenerXpYRango(Guid id)
    {
        var m = await db.Miembros.AsNoTracking().Where(m => m.Id == id).Select(m => new { m.Xp, m.Rango }).FirstAsync();
        return (m.Xp, m.Rango);
    }

    public Task<List<Guid>> IdsDeClan(Guid clanId) =>
        db.Miembros.Where(m => m.ClanId == clanId).Select(m => m.Id).ToListAsync();

    public Task SumarLlaves(Guid id, int cantidad) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.LlavesAcero, m => m.LlavesAcero + cantidad));

    public async Task<bool> GastarLlaves(Guid id, int cantidad) =>
        await db.Miembros.Where(m => m.Id == id && m.LlavesAcero >= cantidad)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.LlavesAcero, m => m.LlavesAcero - cantidad)) == 1;

    public Task ActualizarRango(Guid id, Rango rango) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Rango, rango));

    public Task ActualizarClan(Guid id, Guid? clanId) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ClanId, clanId));

    public Task CompletarOnboarding(Guid id) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.OnboardingCompletado, true));

    public Task ActualizarRol(Guid id, Rol rol) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Rol, rol));

    // CU-002-005: solo puede haber un SILVERBACK por clan. excluirMiembroId permite ignorar al propio
    // miembro cuando se re-asigna su rol (aunque hoy no debería pasar: el líder no cambia su rol).
    public Task<bool> ExisteSilverbackEnClan(Guid clanId, Guid? excluirMiembroId = null) =>
        db.Miembros.AnyAsync(m => m.ClanId == clanId && m.Rol == Rol.SILVERBACK
            && (excluirMiembroId == null || m.Id != excluirMiembroId));

    // CU-005-007: actualizar datos de la cuenta. Se escribe solo lo que cambia (email o password).
    public Task ActualizarDatosCuenta(Guid id, string nombre, string email) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.Nombre, nombre)
                .SetProperty(m => m.Email, email));

    public Task ActualizarPassword(Guid id, string passwordHash) =>
        db.Miembros.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.PasswordHash, passwordHash));
}
