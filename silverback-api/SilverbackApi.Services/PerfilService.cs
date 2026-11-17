// S8: PKG_PERFIL alineado con la carpeta (CU-005-001 a 007, RF-007 a RF-010, RF-016).
// Decisiones numéricas (no definidas en la carpeta) registradas en Modificacion-Carpeta.md §4.7.
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class PerfilService(
    MiembroRepository miembroRepo,
    ClanRepository clanRepo,
    RachaRepository rachaRepo,
    FatigaRepository fatigaRepo,
    BiometricosRepository biometricosRepo,
    EntrenamientoRepository entrenamientoRepo,
    TrofeoRepository trofeoRepo,
    BeneficioRepository beneficioRepo,
    MarketplaceRepository marketplaceRepo) : IPerfilService
{
    public const int CostoSalvarRacha = 50;

    // ---------- CU-005-001: dashboard comparativo ----------
    public async Task<DashboardData> CargarDashboard(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        var clan = miembro.ClanId.HasValue ? await clanRepo.BuscarPorId(miembro.ClanId.Value) : null;
        var idsClan = clan?.Miembros.Select(m => m.Id).ToList() ?? [miembroId];
        var todos = await entrenamientoRepo.ListarDeMiembros(idsClan);
        var hace7 = DateTime.UtcNow.AddDays(-7);

        var porMiembro = idsClan.ToDictionary(id => id, id => todos.Where(e => e.MiembroId == id).ToList());
        var propios = porMiembro[miembroId];
        var semana = propios.Where(e => e.FechaHora >= hace7).ToList();
        var stats = new EstadisticasPerfilDto(
            semana.Count, semana.Sum(e => e.PuntajeCer), semana.Count > 0 ? semana.Average(e => (double)e.PuntajeCer) : 0);

        // Solo cuentan para las comparaciones los miembros que entrenaron alguna vez
        var activos = porMiembro.Where(kv => kv.Value.Count > 0).ToDictionary(kv => kv.Key, kv => kv.Value);
        decimal Cer7(List<Entrenamiento> l) => l.Where(e => e.FechaHora >= hace7).Sum(e => e.PuntajeCer);

        // Índice de Dominancia: percentil del CER de 7 días dentro del clan (FA-1: con menos de 3 sesiones → "--")
        var ranking = activos.OrderByDescending(kv => Cer7(kv.Value)).Select(kv => kv.Key).ToList();
        var posicion = ranking.IndexOf(miembroId) + 1;
        int? dominancia = propios.Count < 3 || ranking.Count == 0
            ? null
            : (int)Math.Round(100.0 * ranking.Count(id => Cer7(activos[id]) <= Cer7(propios)) / ranking.Count);

        // Perfil Táctico (radar): FUERZA BRUTA · RESISTENCIA · AGILIDAD · TÉCNICA (CER promedio por sesión)
        var ejes = activos.ToDictionary(kv => kv.Key, kv =>
        {
            var a = EvolucionService.CalcularAtributos(kv.Value);
            var tecnica = (int)Math.Round(kv.Value.Average(e => e.PuntajeCer));
            return new[] { a.Fuerza, a.Resistencia, a.Agilidad, tecnica };
        });
        var nombresEje = new[] { "FUERZA BRUTA", "RESISTENCIA", "AGILIDAD", "TÉCNICA" };
        var radar = nombresEje.Select((nombre, i) =>
        {
            var max = ejes.Count == 0 ? 0 : ejes.Values.Max(v => v[i]);
            int Norm(double v) => max <= 0 ? 0 : (int)Math.Round(v * 100 / max);
            var usuario = ejes.TryGetValue(miembroId, out var u) ? u[i] : 0;
            var promedio = ejes.Count == 0 ? 0 : ejes.Values.Average(v => v[i]);
            return new EjeRadar(nombre, Norm(usuario), Norm(promedio));
        }).ToList();

        // Volumen total (kg × reps) contra la media del clan
        decimal Volumen(List<Entrenamiento> l) => l.Sum(e => e.PesoKg * e.Repeticiones);
        var volUsuario = Volumen(propios);
        var volPromedio = activos.Count == 0 ? 0 : activos.Values.Average(Volumen);
        int? diferencial = volPromedio <= 0 ? null : (int)Math.Round((volUsuario - volPromedio) * 100 / volPromedio);

        // PUNTAJE C.E.R.: Capacidad (vs. CER máximo del clan, RF-007) · Eficiencia (vs. promedio del clan) · Recuperación
        var cerMaxClan = todos.Count == 0 ? 0 : todos.Max(e => e.PuntajeCer);
        var cerPromUsuario = propios.Count == 0 ? 0 : propios.Average(e => e.PuntajeCer);
        var cerPromClan = todos.Count == 0 ? 0 : todos.Average(e => e.PuntajeCer);
        var capacidad = cerMaxClan <= 0 ? 0 : (int)Math.Round(Math.Min(100, cerPromUsuario * 100 / cerMaxClan));
        var eficiencia = cerPromClan <= 0 ? 0 : (int)Math.Round(Math.Min(100, cerPromUsuario * 50 / cerPromClan));
        var recuperacion = 100 - (await CalcularCarga(miembroId)).Porcentaje;
        var promedioCer = (capacidad + eficiencia + recuperacion) / 3;
        var rangoCer = promedioCer >= 85 ? "S" : promedioCer >= 70 ? "A" : promedioCer >= 50 ? "B" : "C";

        return new DashboardData(miembro, clan, stats, dominancia, posicion, ranking.Count, radar,
            volUsuario, Math.Round(volPromedio, 0), diferencial, capacidad, eficiencia, recuperacion, rangoCer, DateTime.UtcNow);
    }

    // ---------- CU-005-002 / 003: racha (RF-008) ----------
    // Hoy entrenó → ACTIVA · último ayer → EN_RIESGO (se puede salvar) · antes → ROTA: el contador vuelve a 0
    public async Task<Racha?> ConsultarRacha(Guid miembroId)
    {
        var racha = await rachaRepo.ObtenerPorMiembro(miembroId);
        if (racha is null) return null;

        var estado = EstadoRacha.ACTIVA;
        if (racha.DiasConsecutivos > 0 && racha.UltimoEntrenamiento is { } u)
        {
            var hoy = HoraArgentina.Hoy();
            var ultimo = HoraArgentina.FechaDe(u);
            estado = ultimo >= hoy ? EstadoRacha.ACTIVA
                : ultimo == hoy.AddDays(-1) ? EstadoRacha.EN_RIESGO
                : EstadoRacha.ROTA;
        }
        if (estado == EstadoRacha.ROTA)
        {
            await rachaRepo.CrearOActualizar(miembroId, 0, EstadoRacha.ROTA, racha.UltimoEntrenamiento);
            racha.DiasConsecutivos = 0;
        }
        else if (estado != racha.Estado)
        {
            await rachaRepo.ActualizarEstado(miembroId, estado);
        }
        racha.Estado = estado;
        return racha;
    }

    public async Task SalvarRacha(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        if (miembro.ClanId is null)
            throw new InvalidOperationException("Necesitás pertenecer a un clan para salvar la racha.");

        var racha = await ConsultarRacha(miembroId);
        if (racha is null || racha.Estado != EstadoRacha.EN_RIESGO)
            throw new InvalidOperationException("Tu racha no está en riesgo.");

        if (!await clanRepo.DescontarPuntos(miembro.ClanId.Value, CostoSalvarRacha))
            throw new InvalidOperationException("Puntos de clan insuficientes para salvar la racha.");
        await rachaRepo.Restaurar(miembroId, DateTime.UtcNow);
    }

    // CU-005-003 FA-2: "DEJAR MORIR LA RACHA" → contador a 0, sin cargo
    public async Task DejarMorirRacha(Guid miembroId)
    {
        var racha = await ConsultarRacha(miembroId);
        if (racha is null || racha.Estado != EstadoRacha.EN_RIESGO)
            throw new InvalidOperationException("Tu racha no está en riesgo.");
        await rachaRepo.CrearOActualizar(miembroId, 0, EstadoRacha.ROTA, racha.UltimoEntrenamiento);
    }

    // ---------- CU-005-004: fatiga (RF-009) ----------
    // Carga relativa = CER de los últimos 7 días / peso corporal (kg). Porcentaje de carga = carga relativa, tope 100.
    // ÓPTIMA ≤ 40 · MODERADA ≤ 70 · ELEVADA ≤ 100 · CRÍTICA > 100 (sobrecarga → protocolo mandatorio)
    public static EstadoFatiga EvaluarFatiga(decimal cargaRelativa) => cargaRelativa switch
    {
        <= 40 => EstadoFatiga.OPTIMA,
        <= 70 => EstadoFatiga.MODERADA,
        <= 100 => EstadoFatiga.ELEVADA,
        _ => EstadoFatiga.CRITICA,
    };

    private const decimal PesoPorDefectoKg = 75;
    private static readonly TimeSpan VigenciaBiometria = TimeSpan.FromDays(90);

    private async Task<(decimal Carga, decimal Relativa, int Porcentaje, decimal PesoKg, bool Pendiente)> CalcularCarga(Guid miembroId)
    {
        var stats = await entrenamientoRepo.ObtenerEstadisticas(miembroId);
        var bio = await biometricosRepo.ObtenerPorMiembro(miembroId);
        var peso = bio?.PesoKg > 0 ? bio.PesoKg : PesoPorDefectoKg;
        var pendiente = bio is null || DateTime.UtcNow - bio.ActualizadoEn > VigenciaBiometria; // FA-2
        var relativa = Math.Round(stats.CargaSemanal / peso, 1);
        return (stats.CargaSemanal, relativa, (int)Math.Min(100, Math.Round(relativa)), peso, pendiente);
    }

    public async Task<FatigaVista> CargarFatiga(Guid miembroId)
    {
        var c = await CalcularCarga(miembroId);
        var datos = await fatigaRepo.ActualizarOCrear(miembroId, c.Carga, EvaluarFatiga(c.Relativa));

        // Tendencia semanal: lunes a domingo de la semana actual (hora Argentina)
        var hoy = HoraArgentina.Hoy();
        var lunes = hoy.AddDays(-(((int)hoy.DayOfWeek + 6) % 7));
        var sesiones = await entrenamientoRepo.ListarDesde(miembroId, HoraArgentina.InicioDelDiaUtc(lunes));
        var tendencia = Enumerable.Range(0, 7).Select(i =>
        {
            var dia = lunes.AddDays(i);
            var cer = sesiones.Where(e => HoraArgentina.FechaDe(e.FechaHora) == dia).Sum(e => e.PuntajeCer);
            return new DiaCarga(dia, cer, dia == hoy, dia > hoy);
        }).ToList();

        return new FatigaVista(datos, c.Porcentaje, c.PesoKg, c.Pendiente, tendencia);
    }

    // ---------- CU-005-005 ----------
    public Task<List<Trofeo>> CargarTrofeos(Guid miembroId) => trofeoRepo.ListarPorMiembro(miembroId);

    // ---------- CU-005-006 / RF-016 ----------
    public async Task<List<BeneficioVista>> CargarBeneficios(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        await beneficioRepo.ExpirarVencidos(DateTime.UtcNow); // RF-016: pasan a EXPIRADO automáticamente
        var beneficios = await beneficioRepo.Listar(miembroId);
        var suscripciones = await beneficioRepo.SuscripcionesVigentes(miembroId);
        return beneficios.Select(b => new BeneficioVista(b, EstadoPara(b, miembro.Rango),
            b.Tipo == TipoBeneficio.SUSCRIPCION
                ? suscripciones.Where(s => s.AliadoId == b.AliadoId).Select(s => (DateTime?)s.FechaFin).Max()
                : null)).ToList();
    }

    private static string EstadoPara(BeneficioAliado b, Rango rango) =>
        b.Reclamos.Count > 0 ? "RECLAMADO"
        : b.Estado == EstadoBeneficio.EXPIRADO ? "EXPIRADO"
        : b.RangoMinimo > rango ? "BLOQUEADO"
        : "DISPONIBLE";

    public async Task<ReclamoResultado> ReclamarBeneficio(Guid beneficioId, Guid miembroId)
    {
        var vista = (await CargarBeneficios(miembroId)).FirstOrDefault(v => v.Beneficio.Id == beneficioId)
            ?? throw new InvalidOperationException("Beneficio no encontrado.");
        switch (vista.Estado)
        {
            case "BLOQUEADO":
                throw new InvalidOperationException($"Requiere rango {vista.Beneficio.RangoMinimo}.");
            case "EXPIRADO":
                throw new InvalidOperationException("El beneficio expiró.");
            case "RECLAMADO":
                throw new InvalidOperationException("Ya reclamaste este beneficio.");
        }
        await beneficioRepo.RegistrarReclamo(beneficioId, miembroId);
        // Paso 18: "ACTIVAR OFERTA" deja una suscripción activa con el aliado por 30 días
        if (vista.Beneficio.Tipo == TipoBeneficio.SUSCRIPCION)
            await beneficioRepo.CrearSuscripcion(miembroId, vista.Beneficio.AliadoId, DiasSuscripcion);
        return new ReclamoResultado(CodigoDe(beneficioId, miembroId), vista.Beneficio.Aliado.UrlBase);
    }

    public const int DiasSuscripcion = 30;

    // ---------- CU-004-004 paso 18: inventario ----------
    public Task<List<InventarioItem>> Inventario(Guid miembroId) => marketplaceRepo.Inventario(miembroId);

    public async Task ActivarItem(Guid miembroId, Guid itemId)
    {
        if (!await marketplaceRepo.Activar(miembroId, itemId))
            throw new InvalidOperationException("No tenés ese ítem en tu inventario.");
    }

    public static string CodigoDe(Guid beneficioId, Guid miembroId) =>
        $"SB-{beneficioId.ToString()[..4].ToUpper()}-{miembroId.ToString()[..4].ToUpper()}";

    // ---------- CU-005-007 ----------
    public async Task<Miembro> ActualizarCuenta(Guid miembroId, string nombre, string email)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");

        nombre = (nombre ?? "").Trim();
        email = (email ?? "").Trim();
        if (nombre.Length == 0) throw new InvalidOperationException("El nombre no puede estar vacío.");
        if (nombre.Length < 2) throw new InvalidOperationException("El nombre es demasiado corto.");
        if (!email.Contains('@')) throw new InvalidOperationException("El email no es válido.");

        if (!string.Equals(email, miembro.Email, StringComparison.OrdinalIgnoreCase))
        {
            var otro = await miembroRepo.BuscarPorEmail(email);
            if (otro != null && otro.Id != miembroId)
                throw new InvalidOperationException("Este email ya está en uso."); // FA-1
        }

        await miembroRepo.ActualizarDatosCuenta(miembroId, nombre, email);
        miembro.Nombre = nombre;
        miembro.Email = email;
        return miembro;
    }

    public async Task CambiarPassword(Guid miembroId, string passwordActual, string passwordNueva, string confirmacion)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        if (string.IsNullOrEmpty(passwordActual) || !BCrypt.Net.BCrypt.Verify(passwordActual, miembro.PasswordHash))
            throw new InvalidOperationException("Contraseña actual incorrecta."); // FA-2
        if (passwordNueva != confirmacion)
            throw new InvalidOperationException("Las contraseñas nuevas no coinciden."); // FA-3
        if (string.IsNullOrEmpty(passwordNueva) || passwordNueva.Length < 8)
            throw new InvalidOperationException("La nueva contraseña debe tener al menos 8 caracteres.");
        await miembroRepo.ActualizarPassword(miembroId, BCrypt.Net.BCrypt.HashPassword(passwordNueva, 10));
    }
}
