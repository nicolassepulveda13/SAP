// S7/S8: reglas de progresión alineadas con la carpeta (10.4.3, RF-006, RF-010, CU-004-001/003).
// Decisiones de diseño (los valores numéricos no están en la carpeta) registradas en Modificacion-Carpeta.md §4.7.
//   - Rangos: BRONCE → PLATA (500 XP) → ORO (1500 XP, máximo: "MAX LEVEL"). RANGO_S queda en el enum sin uso.
//   - Nivel numérico: 1 + XP / 100.
//   - Atributos (RF-006, calculados del historial): FUERZA = Σ(kg × reps) / 100 · RESISTENCIA = Σ reps · AGILIDAD = días entrenados × 10.
//   - Cofres (10.4.3: tipo ALPHA / TITANIO / OMEGA; CU-004-003: básico, bloqueado con Llaves de Acero, evento limitado):
//       COMUN = ALPHA · RARO = TITANIO · EPICO = OMEGA · LEGENDARIO = EVENTO LIMITADO.
//   - Recompensa del cofre: SilverBack Coins + XP × multiplicador del día (x1.0 + 0.1 por día de racha, máx. x2.0).
//   - Llaves de Acero: 1 cada 5 entrenamientos.
using SilverbackApi.Domain;

namespace SilverbackApi.Services;

public static class Progresion
{
    public static readonly (Rango Rango, int XpMinima)[] Rangos =
    [
        (Rango.BRONCE, 0),
        (Rango.PLATA, 500),
        (Rango.ORO, 1500),
    ];

    public static Rango RangoPara(int xp) => Rangos.Last(r => xp >= r.XpMinima).Rango;

    // XP que falta para el próximo rango; null si ya está en el máximo (FA-1 "MAX LEVEL")
    public static int? XpParaSiguiente(Rango actual, int xp)
    {
        var idx = Array.FindIndex(Rangos, r => r.Rango == actual);
        return idx >= 0 && idx < Rangos.Length - 1 ? Math.Max(0, Rangos[idx + 1].XpMinima - xp) : null;
    }

    public static Rango? RangoSiguiente(Rango actual)
    {
        var idx = Array.FindIndex(Rangos, r => r.Rango == actual);
        return idx >= 0 && idx < Rangos.Length - 1 ? Rangos[idx + 1].Rango : null;
    }

    public const int XpPorNivel = 100;
    public static int Nivel(int xp) => 1 + xp / XpPorNivel;

    public const int EntrenamientosPorLlave = 5;

    public static string NombreCofre(RarezaCofre r) => r switch
    {
        RarezaCofre.COMUN => "ALPHA",
        RarezaCofre.RARO => "TITANIO",
        RarezaCofre.EPICO => "OMEGA",
        _ => "EVENTO LIMITADO",
    };

    public static int CoinsPorCofre(RarezaCofre r) => r switch
    {
        RarezaCofre.COMUN => 100,
        RarezaCofre.RARO => 250,
        RarezaCofre.EPICO => 500,
        _ => 1000,
    };

    public static int XpBasePorCofre(RarezaCofre r) => r switch
    {
        RarezaCofre.COMUN => 10,
        RarezaCofre.RARO => 25,
        RarezaCofre.EPICO => 50,
        _ => 100,
    };

    public static string ContenidoCofre(RarezaCofre r) =>
        $"{CoinsPorCofre(r)} SB + {XpBasePorCofre(r)} XP (× multiplicador del día)";

    // x1.0 + 0.1 por día de racha, tope x2.0
    public static decimal MultiplicadorXp(int diasRacha) => 1.0m + 0.1m * Math.Clamp(diasRacha, 0, 10);

    public record Hito(string Trofeo, string Descripcion, TipoTrofeo Tipo, RarezaCofre? Cofre, int LlavesRequeridas = 0);

    // RF-010: hitos predefinidos ("100 CER acumulado, 10 entrenamientos, ganar una competencia")
    public static readonly Hito PrimerEntrenamiento =
        new("Primer Esfuerzo", "Registraste tu primer entrenamiento en la Arena.", TipoTrofeo.CER, RarezaCofre.COMUN);
    public static readonly Hito CienCer =
        new("Centurión", "Acumulaste 100 de CER.", TipoTrofeo.CER, null);
    public static readonly Hito RachaSemanal =
        new("Semana de Hierro", "Entrenaste 7 días consecutivos.", TipoTrofeo.RACHA, RarezaCofre.RARO);
    public static readonly Hito DiezEntrenamientos =
        new("Veterano de la Arena", "Completaste 10 entrenamientos.", TipoTrofeo.CER, RarezaCofre.EPICO, LlavesRequeridas: 2);
    public static readonly Hito VictoriaGuerra =
        new("Campeón de Guerra", "Tu clan ganó su enfrentamiento en la Guerra Global.", TipoTrofeo.CLAN, RarezaCofre.LEGENDARIO);
}
