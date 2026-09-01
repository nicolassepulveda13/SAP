using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class BeneficioRepository(AppDbContext db)
{
    public Task<List<BeneficioAliado>> ListarElegibles(Guid miembroId, Rango rango) =>
        db.BeneficiosAliado
            .Where(b => b.Estado == EstadoBeneficio.DISPONIBLE && b.RangoMinimo <= rango)
            .Where(b => !b.Reclamos.Any(r => r.MiembroId == miembroId))
            .Include(b => b.Aliado)
            .ToListAsync();

    public async Task RegistrarReclamo(Guid beneficioId, Guid miembroId)
    {
        db.ReclamosBeneficio.Add(new ReclamoBeneficio { BeneficioId = beneficioId, MiembroId = miembroId });
        await db.SaveChangesAsync();
    }
}
