// S7/S8: hitos (RF-010), cofres de la Bóveda (CU-004-003), Llaves de Acero y ascenso de rango (RF-006).
// Lo usan ArenaService (al entrenar), EvolucionService (al abrir cofres) y GuerraService (al cerrar la semana).
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services;

public class RecompensasService(
    MiembroRepository miembroRepo,
    EntrenamientoRepository entrenamientoRepo,
    TrofeoRepository trofeoRepo,
    CofreRepository cofreRepo)
{
    // El rango se recalcula con la XP actual y nunca baja
    public async Task ActualizarRango(Guid miembroId)
    {
        var (xp, rango) = await miembroRepo.ObtenerXpYRango(miembroId);
        var nuevo = Progresion.RangoPara(xp);
        if (nuevo > rango) await miembroRepo.ActualizarRango(miembroId, nuevo);
    }

    // Después de registrar un entrenamiento
    public async Task AlEntrenar(Guid miembroId, int diasRacha)
    {
        var sesiones = await entrenamientoRepo.Contar(miembroId);
        var cerTotal = await entrenamientoRepo.CerTotal(miembroId);

        if (sesiones % Progresion.EntrenamientosPorLlave == 0)
            await miembroRepo.SumarLlaves(miembroId, 1);

        if (sesiones >= 1) await Otorgar(miembroId, Progresion.PrimerEntrenamiento);
        if (cerTotal >= 100) await Otorgar(miembroId, Progresion.CienCer);
        if (sesiones >= 10) await Otorgar(miembroId, Progresion.DiezEntrenamientos);
        if (diasRacha >= 7) await Otorgar(miembroId, Progresion.RachaSemanal);

        await ActualizarRango(miembroId);
    }

    // Al cerrar la Guerra Global: cada miembro del clan ganador recibe el trofeo de la semana y un cofre de EVENTO
    public async Task AlGanarGuerra(Guid clanId, string etiquetaSemana)
    {
        var hito = Progresion.VictoriaGuerra with { Trofeo = $"{Progresion.VictoriaGuerra.Trofeo} · {etiquetaSemana}" };
        foreach (var miembroId in await miembroRepo.IdsDeClan(clanId))
            await Otorgar(miembroId, hito, OrigenCofre.GUERRA);
    }

    // Cada hito se otorga una sola vez: el trofeo hace de marca
    private async Task Otorgar(Guid miembroId, Progresion.Hito hito, OrigenCofre origen = OrigenCofre.HITO)
    {
        if (await trofeoRepo.Tiene(miembroId, hito.Trofeo)) return;
        await trofeoRepo.Crear(new Trofeo { MiembroId = miembroId, Nombre = hito.Trofeo, Descripcion = hito.Descripcion, Tipo = hito.Tipo });
        if (hito.Cofre is { } rareza)
            await cofreRepo.Crear(miembroId, rareza, origen, hito.LlavesRequeridas);
    }
}
