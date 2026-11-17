using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

// CU-005-001 / RF-007: dashboard comparativo contra el promedio del clan
public record EstadisticasPerfilDto(int TotalSesiones, decimal CargaSemanal, double CerPromedio);
public record EjeRadar(string Eje, int Usuario, int PromedioClan); // 0..100, relativo al máximo del clan en ese eje
public record DashboardData(
    Miembro Miembro, Clan? Clan, EstadisticasPerfilDto Estadisticas,
    int? IndiceDominancia, int PosicionEnClan, int MiembrosConDatos,
    List<EjeRadar> Radar,
    decimal VolumenUsuario, decimal VolumenPromedioClan, int? DiferencialVolumen,
    int Capacidad, int Eficiencia, int Recuperacion, string RangoCer,
    DateTime CalculadoEn);

// CU-005-004 / RF-009
public record DiaCarga(DateTime Fecha, decimal Cer, bool EsHoy, bool EsFuturo);
public record FatigaVista(DatosFatiga Datos, int PorcentajeCarga, decimal PesoReferenciaKg, bool SincronizacionPendiente, List<DiaCarga> Tendencia);

// CU-005-006 / RF-016
public record BeneficioVista(BeneficioAliado Beneficio, string Estado, DateTime? SuscripcionHasta); // DISPONIBLE · RECLAMADO · BLOQUEADO · EXPIRADO
public record ReclamoResultado(string Codigo, string? UrlAliado);

public interface IPerfilService
{
    Task<DashboardData> CargarDashboard(Guid miembroId);
    Task<Racha?> ConsultarRacha(Guid miembroId);
    Task SalvarRacha(Guid miembroId);
    Task DejarMorirRacha(Guid miembroId);
    Task<FatigaVista> CargarFatiga(Guid miembroId);
    Task<List<Trofeo>> CargarTrofeos(Guid miembroId);
    Task<List<BeneficioVista>> CargarBeneficios(Guid miembroId);
    Task<ReclamoResultado> ReclamarBeneficio(Guid beneficioId, Guid miembroId);
    // CU-004-004 paso 18: inventario de ítems comprados, activables desde el perfil
    Task<List<InventarioItem>> Inventario(Guid miembroId);
    Task ActivarItem(Guid miembroId, Guid itemId);
    // CU-005-007: Gestionar Datos de Cuenta
    Task<Miembro> ActualizarCuenta(Guid miembroId, string nombre, string email);
    Task CambiarPassword(Guid miembroId, string passwordActual, string passwordNueva, string confirmacion);
}
