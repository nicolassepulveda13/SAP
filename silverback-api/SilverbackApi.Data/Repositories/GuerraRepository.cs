// S6-Guerra: GuerraRepository — ciclo semanal de la Guerra Global (CU-003-001) e historial de batallas (CU-003-004)
using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public record PosicionGuerra(Guid ClanId, string Nombre, decimal Cer, int Posicion);

public class GuerraRepository(AppDbContext db)
{
    public Task<GuerraGlobal?> FindGuerraActiva() =>
        db.GuerrasGlobales
            .Include(g => g.Participaciones)
            .FirstOrDefaultAsync(g => g.Estado == EstadoGuerra.ACTIVA);

    public Task<List<GuerraGlobal>> ListarActivasVencidas(DateTime ahoraUtc) =>
        db.GuerrasGlobales
            .Where(g => g.Estado == EstadoGuerra.ACTIVA && g.FechaFin <= ahoraUtc)
            .ToListAsync();

    public Task<GuerraGlobal?> BuscarPorSemana(string semana) =>
        db.GuerrasGlobales
            .Include(g => g.Participaciones)
            .FirstOrDefaultAsync(g => g.Semana == semana);

    // Devuelve false si otra request creó la misma semana en paralelo (índice único en Semana)
    public async Task<bool> Crear(GuerraGlobal guerra)
    {
        db.GuerrasGlobales.Add(guerra);
        try
        {
            await db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException)
        {
            db.Entry(guerra).State = EntityState.Detached;
            return false;
        }
    }

    // S6-Cierre: fija la posición final de cada clan (orden por CER) y marca la guerra como FINALIZADA
    public async Task Finalizar(Guid guerraId)
    {
        var participaciones = await db.ParticipacionesGuerra
            .Where(p => p.GuerraId == guerraId)
            .OrderByDescending(p => p.CerAcumulado)
            .ThenBy(p => p.Clan.Nombre)
            .ToListAsync();

        for (var i = 0; i < participaciones.Count; i++)
            participaciones[i].Posicion = i + 1;

        await db.SaveChangesAsync();
        await db.GuerrasGlobales.Where(g => g.Id == guerraId)
            .ExecuteUpdateAsync(s => s.SetProperty(g => g.Estado, EstadoGuerra.FINALIZADA));
    }

    // S6-Atomico: UPDATE ... SET CerAcumulado = CerAcumulado + @cer (sin leer-modificar-guardar).
    // Si el clan todavía no participa, se inserta; si dos requests insertan a la vez, la PK compuesta
    // rechaza la segunda y se reintenta como UPDATE.
    public async Task SumarCER(Guid guerraId, Guid clanId, decimal cer)
    {
        var filas = await db.ParticipacionesGuerra
            .Where(p => p.GuerraId == guerraId && p.ClanId == clanId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.CerAcumulado, p => p.CerAcumulado + cer));
        if (filas > 0) return;

        var nueva = new ParticipacionGuerra { GuerraId = guerraId, ClanId = clanId, CerAcumulado = cer };
        db.ParticipacionesGuerra.Add(nueva);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            db.Entry(nueva).State = EntityState.Detached;
            await db.ParticipacionesGuerra
                .Where(p => p.GuerraId == guerraId && p.ClanId == clanId)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.CerAcumulado, p => p.CerAcumulado + cer));
        }
    }

    // Ranking de una guerra con el nombre de cada clan (orden: CER desc, desempate por nombre)
    public async Task<List<PosicionGuerra>> Ranking(Guid guerraId)
    {
        var filas = await db.ParticipacionesGuerra
            .Where(p => p.GuerraId == guerraId)
            .OrderByDescending(p => p.CerAcumulado)
            .ThenBy(p => p.Clan.Nombre)
            .Select(p => new { p.ClanId, p.Clan.Nombre, p.CerAcumulado })
            .ToListAsync();
        return filas.Select((f, i) => new PosicionGuerra(f.ClanId, f.Nombre, f.CerAcumulado, i + 1)).ToList();
    }

    // Guerras FINALIZADAS en las que participó el clan, de la más reciente a la más vieja
    public Task<List<GuerraGlobal>> ListarFinalizadasDeClan(Guid clanId) =>
        db.GuerrasGlobales
            .Where(g => g.Estado == EstadoGuerra.FINALIZADA && g.Participaciones.Any(p => p.ClanId == clanId))
            .OrderByDescending(g => g.FechaFin)
            .Include(g => g.Participaciones).ThenInclude(p => p.Clan)
            .AsNoTracking()
            .ToListAsync();
}
