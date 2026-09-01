using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class GuerraRepository(AppDbContext db)
{
    public Task<GuerraGlobal?> FindGuerraActiva() =>
        db.GuerrasGlobales
            .Include(g => g.Participaciones)
            .FirstOrDefaultAsync(g => g.Estado == EstadoGuerra.ACTIVA);

    public async Task SumarCER(Guid guerraId, Guid clanId, decimal cer)
    {
        var participacion = await db.ParticipacionesGuerra
            .FirstOrDefaultAsync(p => p.GuerraId == guerraId && p.ClanId == clanId);

        if (participacion is null)
        {
            db.ParticipacionesGuerra.Add(new ParticipacionGuerra
            {
                GuerraId = guerraId,
                ClanId = clanId,
                CerAcumulado = cer,
            });
        }
        else
        {
            participacion.CerAcumulado += cer;
        }
        await db.SaveChangesAsync();
    }
}
