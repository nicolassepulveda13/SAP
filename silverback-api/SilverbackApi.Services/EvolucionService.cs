// S7: PKG_EVOLUCIÓN / BÓVEDA alineado con la carpeta (CU-004-001 a 004, RF-006, RF-011, RF-015).
// Todas las operaciones que gastan saldo son atómicas (UPDATE condicionado: sin saldo negativo ni doble gasto).
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class EvolucionService(
    MiembroRepository miembroRepo,
    ClanRepository clanRepo,
    EntrenamientoRepository entrenamientoRepo,
    SkillTreeRepository skillTreeRepo,
    CofreRepository cofreRepo,
    RachaRepository rachaRepo,
    MarketplaceRepository marketplaceRepo,
    RecompensasService recompensas) : IEvolucionService
{
    // ---------- CU-004-001: progreso, nivel y atributos ----------
    public async Task<ProgresoEvolucion> CargarProgreso(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        var atributos = CalcularAtributos(await entrenamientoRepo.ListarTodos(miembroId));
        return new ProgresoEvolucion(
            miembro, Progresion.Nivel(miembro.Xp),
            Progresion.XpParaSiguiente(miembro.Rango, miembro.Xp) ?? 0,
            Progresion.RangoSiguiente(miembro.Rango), atributos);
    }

    // RF-006: FUERZA = Σ(kg × reps) / 100 · RESISTENCIA = Σ reps · AGILIDAD = días distintos entrenados × 10
    public static Atributos CalcularAtributos(IReadOnlyCollection<Entrenamiento> historial) => new(
        Fuerza: (int)Math.Round(historial.Sum(e => e.PesoKg * e.Repeticiones) / 100m),
        Agilidad: historial.Select(e => HoraArgentina.FechaDe(e.FechaHora)).Distinct().Count() * 10,
        Resistencia: historial.Sum(e => e.Repeticiones));

    // ---------- CU-004-002: árbol colectivo con Puntos de Clan ----------
    public async Task<ArbolClan> ObtenerArbol(Guid miembroId)
    {
        var clanId = await ClanDe(miembroId);
        var clan = await clanRepo.BuscarPorId(clanId) ?? throw new InvalidOperationException("Clan no encontrado.");
        var nodos = await skillTreeRepo.Listar();
        var niveles = await skillTreeRepo.NivelesDelClan(clanId);
        var nombres = nodos.ToDictionary(n => n.Id, n => n.Nombre);

        var vista = nodos.Select(n =>
        {
            var nivel = niveles.GetValueOrDefault(n.Id);
            var faltan = n.Requiere.Where(r => niveles.GetValueOrDefault(r.PrerequisiteId) < 1)
                .Select(r => nombres[r.PrerequisiteId]).ToList();
            int? costo = nivel < n.NivelMaximo ? CostoNivel(n, nivel + 1) : null;
            return new NodoArbol(n, nivel, faltan.Count > 0, faltan, costo);
        }).ToList();

        return new ArbolClan(clan.PuntosClan, vista, await skillTreeRepo.UltimasInversiones(clanId));
    }

    // Cada nivel cuesta CostoPuntos × nivel (nivel 1 = base, nivel 2 = doble…)
    private static int CostoNivel(Nodo n, int nivel) => n.CostoPuntos * nivel;

    public async Task<InversionNodo> MejorarNodo(Guid nodoId, Guid miembroId)
    {
        var clanId = await ClanDe(miembroId);
        var nodo = await skillTreeRepo.BuscarPorId(nodoId)
            ?? throw new InvalidOperationException("Nodo no encontrado.");
        var niveles = await skillTreeRepo.NivelesDelClan(clanId);
        var nivel = niveles.GetValueOrDefault(nodoId);

        // FA-1: no se mejora un nodo bloqueado
        var faltan = nodo.Requiere.Where(r => niveles.GetValueOrDefault(r.PrerequisiteId) < 1).ToList();
        if (faltan.Count > 0)
            throw new InvalidOperationException(
                $"Nodo bloqueado: requiere {string.Join(" y ", faltan.Select(f => f.Prerequisito.Nombre))}.");
        if (nivel >= nodo.NivelMaximo)
            throw new InvalidOperationException("El nodo ya está en su nivel máximo.");

        // FA-2: puntos insuficientes (descuento atómico sobre los Puntos de Clan)
        var costo = CostoNivel(nodo, nivel + 1);
        if (!await clanRepo.DescontarPuntos(clanId, costo))
            throw new InvalidOperationException("PUNTOS INSUFICIENTES");

        if (!await skillTreeRepo.SubirNivel(clanId, nodoId, nivel))
        {
            await clanRepo.SumarPuntos(clanId, costo); // otro miembro lo mejoró en paralelo: se devuelven los puntos
            throw new InvalidOperationException("El nodo cambió de nivel mientras mejorabas. Probá de nuevo.");
        }

        return await skillTreeRepo.RegistrarInversion(new InversionNodo
        {
            ClanId = clanId, NodoId = nodoId, MiembroId = miembroId, NivelAlcanzado = nivel + 1, Costo = costo,
        });
    }

    // ---------- CU-004-003: Bóveda ----------
    public async Task<Boveda> ObtenerBoveda(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");

        // Botín diario: un cofre ALPHA por día (hora Argentina) para quien entrenó ayer u hoy — las monedas se ganan
        // entrenando (RF-011). Se genera al abrir la Bóveda (FA-2: al llegar el contador a cero, la pantalla se
        // refresca y el cofre aparece LISTO).
        var hoy = HoraArgentina.Hoy();
        var inicioHoy = HoraArgentina.InicioDelDiaUtc(hoy);
        var entrenoReciente = (await entrenamientoRepo.ListarDesde(miembroId, HoraArgentina.InicioDelDiaUtc(hoy.AddDays(-1)))).Count > 0;
        if (entrenoReciente && !await cofreRepo.ExisteDesde(miembroId, OrigenCofre.BOTIN_DIARIO, inicioHoy))
            await cofreRepo.Crear(miembroId, RarezaCofre.COMUN, OrigenCofre.BOTIN_DIARIO);

        var cofres = await cofreRepo.ListarDisponibles(miembroId);
        var vista = cofres
            .OrderBy(c => c.LlavesRequeridas > 0)
            .ThenBy(c => c.Rareza)
            .Select(c => new CofreVista(c, c.LlavesRequeridas > miembro.LlavesAcero))
            .ToList();

        return new Boveda(
            TotalCajas: vista.Count,
            Listos: vista.Count(v => !v.Bloqueado),
            MultiplicadorXp: await Multiplicador(miembroId),
            ProximoBotinUtc: HoraArgentina.InicioDelDiaUtc(HoraArgentina.Hoy().AddDays(1)),
            LlavesAcero: miembro.LlavesAcero,
            Cofres: vista);
    }

    private async Task<decimal> Multiplicador(Guid miembroId) =>
        Progresion.MultiplicadorXp((await rachaRepo.ObtenerPorMiembro(miembroId))?.DiasConsecutivos ?? 0);

    public async Task<RecompensaCofre> ReclamarCofre(Guid cofreId, Guid miembroId)
    {
        var cofre = await cofreRepo.BuscarDisponible(cofreId, miembroId)
            ?? throw new InvalidOperationException("Cofre no disponible.");

        // FA-1: el cofre bloqueado consume Llaves de Acero
        if (cofre.LlavesRequeridas > 0 && !await miembroRepo.GastarLlaves(miembroId, cofre.LlavesRequeridas))
            throw new InvalidOperationException(
                $"Necesitás {cofre.LlavesRequeridas} Llaves de Acero. Ganás una cada {Progresion.EntrenamientosPorLlave} entrenamientos.");

        if (!await cofreRepo.MarcarReclamado(cofreId, miembroId))
        {
            if (cofre.LlavesRequeridas > 0) await miembroRepo.SumarLlaves(miembroId, cofre.LlavesRequeridas);
            throw new InvalidOperationException("Cofre no disponible.");
        }

        var multiplicador = await Multiplicador(miembroId);
        var coins = Progresion.CoinsPorCofre(cofre.Rareza);
        var xp = (int)Math.Round(Progresion.XpBasePorCofre(cofre.Rareza) * multiplicador);
        await miembroRepo.ActualizarCoins(miembroId, coins);
        await miembroRepo.ActualizarXP(miembroId, xp);
        await recompensas.ActualizarRango(miembroId);
        return new RecompensaCofre(Progresion.NombreCofre(cofre.Rareza), coins, xp, multiplicador);
    }

    // ---------- CU-004-004: Marketplace ----------
    public Task<List<Item>> ObtenerItems(CategoriaItem? categoria) => marketplaceRepo.Listar(categoria);

    public async Task<Item> ComprarItem(Guid itemId, Guid miembroId)
    {
        var item = await marketplaceRepo.BuscarItem(itemId)
            ?? throw new InvalidOperationException("Ítem no encontrado.");
        // El inventario tiene PK (miembro, ítem): antes se cobraba y recién después fallaba el INSERT
        if (await marketplaceRepo.Posee(miembroId, itemId))
            throw new InvalidOperationException("Ya tenés este ítem.");
        if (!await miembroRepo.GastarCoins(miembroId, item.Precio))
            throw new InvalidOperationException("Coins insuficientes.");

        try
        {
            await marketplaceRepo.RegistrarCompra(miembroId, itemId);
        }
        catch
        {
            await miembroRepo.ActualizarCoins(miembroId, item.Precio); // compra simultánea del mismo ítem: se devuelve
            throw new InvalidOperationException("Ya tenés este ítem.");
        }
        return item;
    }

    private async Task<Guid> ClanDe(Guid miembroId) =>
        (await miembroRepo.BuscarPorId(miembroId))?.ClanId
        ?? throw new InvalidOperationException("Necesitás pertenecer a un clan.");
}
