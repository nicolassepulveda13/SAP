using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class FatigaRepository(AppDbContext db)
{
    public Task<DatosFatiga?> ObtenerPorMiembro(Guid miembroId) =>
        db.DatosFatiga.FirstOrDefaultAsync(f => f.MiembroId == miembroId);

    public async Task<DatosFatiga> ActualizarOCrear(Guid miembroId, decimal cargaSemanal, EstadoFatiga nivel)
    {
        var fatiga = await db.DatosFatiga.FirstOrDefaultAsync(f => f.MiembroId == miembroId);
        if (fatiga is null)
        {
            fatiga = new DatosFatiga { MiembroId = miembroId };
            db.DatosFatiga.Add(fatiga);
        }
        fatiga.CargaSemanal = cargaSemanal;
        fatiga.NivelFatiga = nivel;
        fatiga.ActualizadoEn = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return fatiga;
    }
}
