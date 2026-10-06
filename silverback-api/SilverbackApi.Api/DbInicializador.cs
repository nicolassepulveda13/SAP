// Docker: al arrancar la API aplica las migraciones pendientes y, si la base está vacía, carga datos de demo.
// Se activa con Database:MigrarAlIniciar=true y Database:SembrarDemo=true (variables de entorno en docker-compose).
// En desarrollo local queda apagado: las migraciones se siguen aplicando con `dotnet ef database update`.
using Microsoft.EntityFrameworkCore;
using SilverbackApi.Data;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api;

public static class DbInicializador
{
    public const string PasswordDemo = "Test1234!";

    public static async Task EjecutarAsync(WebApplication app)
    {
        var config = app.Configuration;
        if (!config.GetValue<bool>("Database:MigrarAlIniciar")) return;

        var log = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DbInicializador");
        await MigrarConReintentos(app.Services, log);

        if (!config.GetValue<bool>("Database:SembrarDemo")) return;
        try
        {
            await SembrarDemo(app.Services, log);
        }
        catch (Exception ex)
        {
            // La API arranca igual: la demo es opcional. Para reintentar, borrar la base (docker compose down -v)
            log.LogError(ex, "No se pudieron cargar los datos de demo. La API sigue funcionando sin ellos.");
        }
    }

    // SQL Server tarda unos segundos en aceptar conexiones después de que arranca el contenedor
    private static async Task MigrarConReintentos(IServiceProvider services, ILogger log)
    {
        for (var intento = 1; ; intento++)
        {
            try
            {
                using var scope = services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var pendientes = (await db.Database.GetPendingMigrationsAsync()).ToList();
                await db.Database.MigrateAsync();
                log.LogInformation("Migraciones aplicadas: {Cantidad} ({Lista})", pendientes.Count, string.Join(", ", pendientes));
                return;
            }
            catch (Exception ex) when (intento < 20)
            {
                log.LogWarning("La base todavía no responde (intento {Intento}/20): {Mensaje}", intento, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(3));
            }
        }
    }

    // Usa los mismos services que la app, así los datos de demo pasan por las reglas reales (CER, guerra, XP, roles).
    // Cada paso corre en su propio scope, igual que un request HTTP: los repositorios actualizan con ExecuteUpdate
    // y una entidad que ya quedó cargada en el mismo DbContext no se entera (por ejemplo, el rol SILVERBACK recién asignado).
    private static async Task SembrarDemo(IServiceProvider services, ILogger log)
    {
        async Task<T> Paso<T>(Func<IServiceProvider, Task<T>> accion)
        {
            using var scope = services.CreateScope();
            return await accion(scope.ServiceProvider);
        }
        Task Accion(Func<IServiceProvider, Task> accion) => Paso<bool>(async sp => { await accion(sp); return true; });
        static IIncorporacionService Inc(IServiceProvider sp) => sp.GetRequiredService<IIncorporacionService>();
        static ISantuarioService San(IServiceProvider sp) => sp.GetRequiredService<ISantuarioService>();
        static IArenaService Are(IServiceProvider sp) => sp.GetRequiredService<IArenaService>();

        if (await Paso(sp => sp.GetRequiredService<AppDbContext>().Miembros.AnyAsync()))
        {
            log.LogInformation("La base ya tiene datos: no se cargan datos de demo.");
            return;
        }

        var lider = await Paso(async sp => (await Inc(sp).Registrar("Lider Demo", "lider@silverback.demo", PasswordDemo, "VOLUMEN", 30, 88, 180, "AVANZADO")).Miembro.Id);
        var recluta = await Paso(async sp => (await Inc(sp).Registrar("Recluta Demo", "recluta@silverback.demo", PasswordDemo, "ATLETICO", 24, 72, 175, "PRINCIPIANTE")).Miembro.Id);
        var rival = await Paso(async sp => (await Inc(sp).Registrar("Rival Demo", "rival@silverback.demo", PasswordDemo, "DEFINIDO", 27, 80, 178, "INTERMEDIO")).Miembro.Id);

        var manada = await Paso(async sp => (await Inc(sp).CrearClan("Manada Demo", lider)).Clan.Id);
        await Accion(sp => Inc(sp).UnirseAClan(recluta, manada));
        await Paso(async sp => (await Inc(sp).CrearClan("Clan Rival Demo", rival)).Clan.Id);

        await Accion(sp => San(sp).CrearDesafio(manada, lider, "Sumar 5.000 de CER entre todos esta semana", "ORO", 500, DateTime.UtcNow.AddDays(14)));
        await Accion(sp => San(sp).CrearDesafio(manada, lider, "Tres sesiones de piernas", "BRONCE", 100, DateTime.UtcNow.AddDays(7)));
        await Accion(sp => San(sp).EnviarMensaje(manada, lider, "¡Bienvenidos a la Manada Demo! Registren sus entrenamientos para la Guerra Global."));

        // Entrenamientos: arman la guerra de la semana con Manada Demo vs Clan Rival Demo
        await Accion(sp => Are(sp).RegistrarEntrenamiento(lider, "SENTADILLA", 100, 8));
        await Accion(sp => Are(sp).RegistrarEntrenamiento(recluta, "PRESS BANCA", 60, 10));
        await Accion(sp => Are(sp).RegistrarEntrenamiento(rival, "PESO MUERTO", 90, 6));

        log.LogInformation("Datos de demo cargados: 3 usuarios (contraseña {Password}), 2 clanes, 2 desafíos, guerra de la semana con rival.", PasswordDemo);
    }
}
