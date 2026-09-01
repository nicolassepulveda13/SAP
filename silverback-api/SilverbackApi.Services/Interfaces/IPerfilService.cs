using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record DashboardData(Miembro Miembro, EstadisticasPerfilDto Estadisticas, Clan? Clan);
public record EstadisticasPerfilDto(int TotalSesiones, decimal CargaSemanal, double CerPromedio);

public interface IPerfilService
{
    Task<DashboardData> CargarDashboard(Guid miembroId);
    Task<Racha?> ConsultarRacha(Guid miembroId);
    Task SalvarRacha(Guid miembroId, Guid clanId);
    Task<DatosFatiga> CargarFatiga(Guid miembroId);
    Task<List<Trofeo>> CargarTrofeos(Guid miembroId);
    Task<List<BeneficioAliado>> CargarBeneficios(Guid miembroId);
    Task<string> ReclamarBeneficio(Guid beneficioId, Guid miembroId);
}
