// S6-Guerra: GuerraService — ciclo semanal de la Guerra Global (CU-003-001) e historial de batallas (CU-003-004)
// Reglas (decisiones de diseño S6, registradas en Modificacion-Carpeta.md):
//   - Ciclo semanal: lunes 00:00 → lunes 00:00 hora Argentina. Clave de semana ISO: "2026-S41".
//   - Sin jobs: la guerra se abre y se cierra de forma perezosa cuando alguien entra a la Arena o registra un entrenamiento.
//   - Participan los clanes con al menos un entrenamiento en la semana (ParticipacionGuerra se crea al primer CER).
//   - Rival = pareja consecutiva en el ranking (1º vs 2º, 3º vs 4º…). Si queda impar, el último va "SIN RIVAL".
//   - Al cierre gana el mejor posicionado de cada pareja (desempate por nombre de clan).
using System.Globalization;
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class GuerraService(GuerraRepository guerraRepo) : IGuerraService
{
    private const int TopRanking = 10;
    private static readonly TimeZoneInfo ZonaArgentina = ResolverZonaArgentina();

    public async Task<GuerraGlobal> AsegurarGuerraActiva()
    {
        var ahora = DateTime.UtcNow;

        foreach (var vencida in await guerraRepo.ListarActivasVencidas(ahora))
            await guerraRepo.Finalizar(vencida.Id);

        var (semana, _, fin) = SemanaDe(ahora);
        var guerra = await guerraRepo.BuscarPorSemana(semana);
        if (guerra is not null) return guerra;

        var nueva = new GuerraGlobal { Semana = semana, Estado = EstadoGuerra.ACTIVA, FechaFin = fin };
        if (await guerraRepo.Crear(nueva)) return nueva;

        // Otra request creó la semana en paralelo
        return await guerraRepo.BuscarPorSemana(semana)
            ?? throw new InvalidOperationException("No se pudo abrir la guerra de la semana.");
    }

    public async Task<EstadoGuerraDto> ObtenerEstado(Guid? clanId)
    {
        var guerra = await AsegurarGuerraActiva();
        var ranking = await guerraRepo.Ranking(guerra.Id);
        var maxCer = ranking.Count > 0 ? ranking[0].Cer : 0;

        ClanEnGuerra Mapear(PosicionGuerra p) => new(p.ClanId, p.Nombre, p.Cer, p.Posicion, Progreso(p.Cer, maxCer));

        var nuestro = clanId is null ? null : ranking.FirstOrDefault(p => p.ClanId == clanId);
        var rival = nuestro is null ? null : PosicionRival(ranking, nuestro.Posicion);

        var dias = (int)Math.Ceiling((guerra.FechaFin - DateTime.UtcNow).TotalDays);
        return new EstadoGuerraDto(
            guerra.Id, EtiquetaSemana(guerra.Semana), guerra.FechaFin.AddDays(-7), guerra.FechaFin, Math.Max(0, dias),
            nuestro is null ? null : Mapear(nuestro),
            rival is null ? null : Mapear(rival),
            ranking.Take(TopRanking).Select(Mapear).ToList(),
            ranking.Count);
    }

    public async Task<HistorialBatallasDto> ObtenerHistorialBatallas(Guid clanId)
    {
        await AsegurarGuerraActiva(); // cierra la semana anterior si venció

        var batallas = new List<BatallaDto>();
        foreach (var g in await guerraRepo.ListarFinalizadasDeClan(clanId))
        {
            var orden = g.Participaciones.OrderBy(p => p.Posicion).ToList();
            var nuestra = orden.First(p => p.ClanId == clanId);
            var posRival = nuestra.Posicion % 2 == 1 ? nuestra.Posicion + 1 : nuestra.Posicion - 1;
            var rival = orden.FirstOrDefault(p => p.Posicion == posRival);

            var resultado = rival is null ? "SIN_RIVAL"
                : nuestra.Posicion < rival.Posicion ? "VICTORIA" : "DERROTA";

            batallas.Add(new BatallaDto(
                g.Id, EtiquetaSemana(g.Semana), g.FechaFin, nuestra.CerAcumulado, nuestra.Posicion,
                rival?.Clan.Nombre, rival?.CerAcumulado, resultado));
        }

        var conRival = batallas.Where(b => b.Resultado != "SIN_RIVAL").ToList();
        var victorias = conRival.Count(b => b.Resultado == "VICTORIA");
        var racha = conRival.TakeWhile(b => b.Resultado == "VICTORIA").Count();
        var tasa = conRival.Count == 0 ? 0 : (int)Math.Round(victorias * 100.0 / conRival.Count);

        return new HistorialBatallasDto(conRival.Count, victorias, tasa, racha, batallas);
    }

    // Pareja consecutiva: impar → el de abajo, par → el de arriba
    private static PosicionGuerra? PosicionRival(List<PosicionGuerra> ranking, int posicion)
    {
        var posRival = posicion % 2 == 1 ? posicion + 1 : posicion - 1;
        return ranking.FirstOrDefault(p => p.Posicion == posRival);
    }

    private static int Progreso(decimal cer, decimal maxCer) =>
        maxCer <= 0 ? 0 : (int)Math.Round(cer * 100 / maxCer);

    // Semana ISO en hora Argentina → (clave, inicio UTC, fin UTC)
    private static (string Clave, DateTime InicioUtc, DateTime FinUtc) SemanaDe(DateTime utc)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(utc, ZonaArgentina).Date;
        var desdeLunes = ((int)local.DayOfWeek + 6) % 7;
        var lunes = local.AddDays(-desdeLunes);

        var clave = $"{ISOWeek.GetYear(lunes)}-S{ISOWeek.GetWeekOfYear(lunes):D2}";
        var inicioUtc = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(lunes, DateTimeKind.Unspecified), ZonaArgentina);
        return (clave, inicioUtc, inicioUtc.AddDays(7));
    }

    // "2026-S41" → "SEMANA 41 · 2026"
    private static string EtiquetaSemana(string clave)
    {
        var partes = clave.Split("-S");
        return partes.Length == 2 ? $"SEMANA {int.Parse(partes[1])} · {partes[0]}" : clave;
    }

    // Argentina no tiene horario de verano desde 2009: si el SO no trae la zona, alcanza con UTC-3 fijo
    private static TimeZoneInfo ResolverZonaArgentina()
    {
        foreach (var id in new[] { "America/Argentina/Buenos_Aires", "Argentina Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
        }
        return TimeZoneInfo.CreateCustomTimeZone("ART", TimeSpan.FromHours(-3), "Argentina", "ART");
    }
}
