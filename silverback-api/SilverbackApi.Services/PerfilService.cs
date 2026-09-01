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
    EntrenamientoRepository entrenamientoRepo,
    TrofeoRepository trofeoRepo,
    BeneficioRepository beneficioRepo) : IPerfilService
{
    private static EstadoFatiga EvaluarFatiga(decimal cargaSemanal) => cargaSemanal switch
    {
        <= 100 => EstadoFatiga.OPTIMA,
        <= 250 => EstadoFatiga.MODERADA,
        <= 400 => EstadoFatiga.ELEVADA,
        _      => EstadoFatiga.CRITICA,
    };

    public async Task<DashboardData> CargarDashboard(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");

        var stats = await entrenamientoRepo.ObtenerEstadisticas(miembroId);
        var clan = miembro.ClanId.HasValue ? await clanRepo.BuscarPorId(miembro.ClanId.Value) : null;

        return new DashboardData(
            miembro,
            new EstadisticasPerfilDto(stats.TotalSesiones, stats.CargaSemanal, stats.CerPromedio),
            clan
        );
    }

    public Task<Racha?> ConsultarRacha(Guid miembroId) =>
        rachaRepo.ObtenerPorMiembro(miembroId);

    public async Task SalvarRacha(Guid miembroId, Guid clanId)
    {
        var clan = await clanRepo.BuscarPorId(clanId)
            ?? throw new InvalidOperationException("Clan no encontrado.");
        if (clan.PuntosClan < 50)
            throw new InvalidOperationException("Puntos de clan insuficientes para salvar la racha.");

        await clanRepo.DescontarPuntos(clanId, 50);
        await rachaRepo.Restaurar(miembroId);
    }

    public async Task<DatosFatiga> CargarFatiga(Guid miembroId)
    {
        var stats = await entrenamientoRepo.ObtenerEstadisticas(miembroId);
        var nivel = EvaluarFatiga(stats.CargaSemanal);
        return await fatigaRepo.ActualizarOCrear(miembroId, stats.CargaSemanal, nivel);
    }

    public Task<List<Trofeo>> CargarTrofeos(Guid miembroId) =>
        trofeoRepo.ListarPorMiembro(miembroId);

    public async Task<List<BeneficioAliado>> CargarBeneficios(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        return await beneficioRepo.ListarElegibles(miembroId, miembro.Rango);
    }

    public async Task<string> ReclamarBeneficio(Guid beneficioId, Guid miembroId)
    {
        await beneficioRepo.RegistrarReclamo(beneficioId, miembroId);
        return $"SB-{beneficioId.ToString()[..4].ToUpper()}-{miembroId.ToString()[..4].ToUpper()}";
    }
}
