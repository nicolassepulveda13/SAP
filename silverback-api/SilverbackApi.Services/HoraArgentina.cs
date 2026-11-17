// Zona horaria única del sistema (decisión S1/S8): todo cálculo de "día" o "semana" se hace en hora Argentina,
// aunque el servidor o el contenedor corran en UTC. La usan la Guerra Global (semana) y la Racha (día).
namespace SilverbackApi.Services;

public static class HoraArgentina
{
    public static readonly TimeZoneInfo Zona = Resolver();

    // Fecha calendario en Argentina de un instante UTC
    public static DateTime FechaDe(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), Zona).Date;

    public static DateTime Hoy() => FechaDe(DateTime.UtcNow);

    // 00:00 hora Argentina de una fecha local → instante UTC
    public static DateTime InicioDelDiaUtc(DateTime fechaLocal) =>
        TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(fechaLocal.Date, DateTimeKind.Unspecified), Zona);

    // Argentina no tiene horario de verano desde 2009: si el SO no trae la zona, alcanza con UTC-3 fijo
    private static TimeZoneInfo Resolver()
    {
        foreach (var id in new[] { "America/Argentina/Buenos_Aires", "Argentina Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
        }
        return TimeZoneInfo.CreateCustomTimeZone("ART", TimeSpan.FromHours(-3), "Argentina", "ART");
    }
}
