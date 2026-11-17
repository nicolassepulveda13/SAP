using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

// CU-005-006 / RF-016: se listan TODOS los beneficios (los de rango superior se muestran BLOQUEADOS).
// El estado por miembro (reclamado / bloqueado) lo resuelve el servicio: el rango se guarda como texto
// y compararlo en SQL sería alfabético (ORO < PLATA).
public class BeneficioRepository(AppDbContext db)
{
    // Reclamos viene filtrado al miembro actual: si tiene uno, ya lo reclamó
    public Task<List<BeneficioAliado>> Listar(Guid miembroId) =>
        db.BeneficiosAliado
            .Include(b => b.Aliado)
            .Include(b => b.Reclamos.Where(r => r.MiembroId == miembroId))
            .OrderByDescending(b => b.Destacado).ThenBy(b => b.RangoMinimo).ThenBy(b => b.Titulo)
            .ToListAsync();

    // RF-016: los beneficios vencidos pasan a EXPIRADO automáticamente
    public Task ExpirarVencidos(DateTime ahoraUtc) =>
        db.BeneficiosAliado
            .Where(b => b.Estado == EstadoBeneficio.DISPONIBLE && b.FechaVencimiento != null && b.FechaVencimiento < ahoraUtc)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.Estado, EstadoBeneficio.EXPIRADO));

    public async Task CrearSuscripcion(Guid miembroId, Guid aliadoId, int dias)
    {
        db.SuscripcionesActivas.Add(new SuscripcionActiva
        {
            MiembroId = miembroId, AliadoId = aliadoId, FechaFin = DateTime.UtcNow.AddDays(dias),
        });
        await db.SaveChangesAsync();
    }

    public Task<List<SuscripcionActiva>> SuscripcionesVigentes(Guid miembroId) =>
        db.SuscripcionesActivas.Where(s => s.MiembroId == miembroId && s.FechaFin > DateTime.UtcNow).ToListAsync();

    // La PK (beneficio, miembro) impide el doble reclamo aunque lleguen dos requests a la vez
    public async Task RegistrarReclamo(Guid beneficioId, Guid miembroId)
    {
        db.ReclamosBeneficio.Add(new ReclamoBeneficio { BeneficioId = beneficioId, MiembroId = miembroId });
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { throw new InvalidOperationException("Ya reclamaste este beneficio."); }
    }
}
