// Docker: al arrancar la API aplica las migraciones pendientes y, si la base está vacía, carga datos de demo.
// Se activa con Database:MigrarAlIniciar=true y Database:SembrarDemo=true (variables de entorno en docker-compose).
// En desarrollo local queda apagado: las migraciones se siguen aplicando con `dotnet ef database update`.
// S7-Fix: el catálogo (nodos, ítems, aliados y beneficios) es dato de referencia, no de demo: se siembra SIEMPRE
// que esté vacío, en Docker y en local. Antes solo existía con la demo de Docker y en local el árbol,
// el Marketplace y los Beneficios quedaban vacíos.
using Microsoft.EntityFrameworkCore;
using SilverbackApi.Data;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api;

public static class DbInicializador
{
    public const string PasswordDemo = "Test1234!";

    public static async Task EjecutarAsync(WebApplication app)
    {
        var config = app.Configuration;
        var log = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DbInicializador");
        if (config.GetValue<bool>("Database:MigrarAlIniciar"))
            await MigrarConReintentos(app.Services, log);

        try
        {
            using var scope = app.Services.CreateScope();
            await SembrarCatalogo(scope.ServiceProvider.GetRequiredService<AppDbContext>(), log);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "No se pudo sembrar el catálogo (¿faltan migraciones?). La API sigue funcionando.");
        }

        if (!config.GetValue<bool>("Database:MigrarAlIniciar") || !config.GetValue<bool>("Database:SembrarDemo")) return;
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

        // Un cofre por miembro demo, para que la Bóveda no arranque vacía (el resto se gana por hitos)
        await Accion(async sp =>
        {
            var db = sp.GetRequiredService<AppDbContext>();
            db.Cofres.AddRange(
                new Cofre { MiembroId = lider, Rareza = RarezaCofre.EPICO, Origen = OrigenCofre.HITO, LlavesRequeridas = 2 },
                new Cofre { MiembroId = recluta, Rareza = RarezaCofre.RARO, Origen = OrigenCofre.HITO },
                new Cofre { MiembroId = rival, Rareza = RarezaCofre.RARO, Origen = OrigenCofre.HITO });
            await db.SaveChangesAsync();
        });

        log.LogInformation("Datos de demo cargados: 3 usuarios (contraseña {Password}), 2 clanes, 2 desafíos, guerra de la semana con rival, catálogo S7.", PasswordDemo);
    }

    // Catálogo alineado con la carpeta (CU-004-002, CU-004-004, CU-005-006). Aliados con URLs de ejemplo:
    // sin integración real (10.4.3, Limitaciones Explícitas).
    private static async Task SembrarCatalogo(AppDbContext db, ILogger log)
    {
        if (!await db.Nodos.AnyAsync())
        {
            // Árbol: FUERZA (raíz) → RESISTENCIA (izq.) y ATAQUE (der.) → FUEGO (desde ATAQUE) → TITÁN (RESISTENCIA + FUEGO)
            var fuerza = new Nodo { Nombre = "FUERZA", Descripcion = "Nodo origen del árbol del clan.", Efecto = "CER del clan en ejercicios de fuerza", BonusPorNivel = 2, CostoPuntos = 100, NivelMaximo = 3, Estado = EstadoNodo.DISPONIBLE };
            var resistencia = new Nodo { Nombre = "RESISTENCIA", Descripcion = "Aumenta la tolerancia del clan a la carga semanal.", Efecto = "tolerancia a la fatiga", BonusPorNivel = 5, CostoPuntos = 150, NivelMaximo = 5, Estado = EstadoNodo.BLOQUEADO };
            var ataque = new Nodo { Nombre = "ATAQUE", Descripcion = "Potencia el aporte del clan en la Guerra Global.", Efecto = "aporte a la Guerra Global", BonusPorNivel = 3, CostoPuntos = 150, NivelMaximo = 5, Estado = EstadoNodo.BLOQUEADO };
            var fuego = new Nodo { Nombre = "FUEGO", Descripcion = "Recompensa las rachas largas de los miembros.", Efecto = "XP por racha activa", BonusPorNivel = 5, CostoPuntos = 250, NivelMaximo = 3, Estado = EstadoNodo.BLOQUEADO };
            var titan = new Nodo { Nombre = "TITÁN", Descripcion = "Mejora definitiva del clan.", Efecto = "poder total del clan", BonusPorNivel = 10, CostoPuntos = 500, NivelMaximo = 1, Estado = EstadoNodo.BLOQUEADO };
            db.Nodos.AddRange(fuerza, resistencia, ataque, fuego, titan);
            db.NodoDependencias.AddRange(
                new NodoDependencia { Nodo = resistencia, Prerequisito = fuerza },
                new NodoDependencia { Nodo = ataque, Prerequisito = fuerza },
                new NodoDependencia { Nodo = fuego, Prerequisito = ataque },
                new NodoDependencia { Nodo = titan, Prerequisito = resistencia },
                new NodoDependencia { Nodo = titan, Prerequisito = fuego });
        }

        if (!await db.Items.AnyAsync())
        {
            db.Items.AddRange(
                new Item { Nombre = "Skin Alfa Dorado", Descripcion = "Dorado espejado para tu avatar.", Categoria = CategoriaItem.SKIN, Rareza = RarezaItem.EPICO, Precio = 300 },
                new Item { Nombre = "Skin Guerrero Negro", Descripcion = "Mate con detalles rojos.", Categoria = CategoriaItem.SKIN, Rareza = RarezaItem.RARO, Precio = 200 },
                new Item { Nombre = "Aura de Fuego", Descripcion = "Llamas alrededor de tu avatar mientras entrenás.", Categoria = CategoriaItem.AURA, Rareza = RarezaItem.LEGENDARIO, Precio = 400 },
                new Item { Nombre = "Aura Tormenta", Descripcion = "Rayos azules activos durante el entrenamiento.", Categoria = CategoriaItem.AURA, Rareza = RarezaItem.EPICO, Precio = 350 },
                new Item { Nombre = "Ícono Gorila Alfa", Descripcion = "Imagen de perfil exclusiva.", Categoria = CategoriaItem.ICONO, Rareza = RarezaItem.COMUN, Precio = 100 },
                new Item { Nombre = "Ícono Manada", Descripcion = "Imagen de perfil con el emblema del clan.", Categoria = CategoriaItem.ICONO, Rareza = RarezaItem.RARO, Precio = 150 });
        }

        if (!await db.BeneficiosAliado.AnyAsync())
        {
            var equipo = new AliadoComercial { Nombre = "IronGear", UrlBase = "https://example.com/irongear" };
            var nutri = new AliadoComercial { Nombre = "ProteoLab", UrlBase = "https://example.com/proteolab" };
            var ropa = new AliadoComercial { Nombre = "Apex Wear", UrlBase = "https://example.com/apexwear" };
            var recup = new AliadoComercial { Nombre = "Recovery Lab", UrlBase = "https://example.com/recoverylab" };
            var comida = new AliadoComercial { Nombre = "FitMeals", UrlBase = "https://example.com/fitmeals" };
            db.AliadosComerciales.AddRange(equipo, nutri, ropa, recup, comida);
            db.BeneficiosAliado.AddRange(
                new BeneficioAliado { Aliado = equipo, Categoria = "EQUIPAMIENTO", Destacado = true, Titulo = "15% OFF en equipamiento", Descripcion = "Mancuernas, barras y discos. Desde rango BRONCE.", Tipo = TipoBeneficio.CODIGO, RangoMinimo = Rango.BRONCE },
                new BeneficioAliado { Aliado = nutri, Categoria = "NUTRICIÓN", Titulo = "2x1 en proteína", Descripcion = "Whey y vegana, todos los sabores.", Tipo = TipoBeneficio.REDIRECCION, RangoMinimo = Rango.BRONCE, FechaVencimiento = DateTime.UtcNow.AddDays(5) },
                new BeneficioAliado { Aliado = ropa, Categoria = "ROPA DEPORTIVA", Titulo = "Envío gratis + 20% OFF", Descripcion = "Toda la línea de ropa deportiva.", Tipo = TipoBeneficio.CUPON, RangoMinimo = Rango.BRONCE },
                new BeneficioAliado { Aliado = recup, Categoria = "RECUPERACIÓN", Titulo = "Sesión de crioterapia", Descripcion = "Una sesión sin cargo por mes.", Tipo = TipoBeneficio.CODIGO, RangoMinimo = Rango.ORO },
                new BeneficioAliado { Aliado = comida, Categoria = "ALIMENTACIÓN", Titulo = "Plan de alimentación a precio base", Descripcion = "Suscripción mensual con nutricionista.", Tipo = TipoBeneficio.SUSCRIPCION, RangoMinimo = Rango.PLATA });
        }

        var cambios = await db.SaveChangesAsync();
        if (cambios > 0) log.LogInformation("Catálogo sembrado ({Cambios} filas).", cambios);
    }
}
