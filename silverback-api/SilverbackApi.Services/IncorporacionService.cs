// S1-Onboarding: IncorporacionService — lógica del flujo de registro y asignación a clan
// S1-Onboarding: Registrar() — hash BCrypt, crea Miembro + DatosBiometricos + Racha + Fatiga; token preliminar (sin clan, onboarding=false)
// S2-Onboarding: UnirseAClan() — asigna clanId, marca OnboardingCompletado=true; devuelve token definitivo con rol=RECLUTA
// S3-CrearClan: CrearClan() — crea Clan, asigna rol=SILVERBACK, marca OnboardingCompletado=true; devuelve token definitivo
using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class IncorporacionService(
    MiembroRepository miembroRepo,
    ClanRepository clanRepo,
    BiometricosRepository bioRepo,
    RachaRepository rachaRepo,
    FatigaRepository fatigaRepo,
    IAuthService authService) : IIncorporacionService
{
    public async Task<RegistrarResult> Registrar(string nombre, string email, string password, string arquetipo,
        int edad, decimal pesoKg, decimal alturaCm, string nivelExperiencia)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password, 10);
        var miembro = new Miembro
        {
            Nombre = nombre,
            Email = email,
            PasswordHash = hash,
            Arquetipo = Enum.Parse<Arquetipo>(arquetipo),
            OnboardingCompletado = false,
        };
        await miembroRepo.Crear(miembro);

        await bioRepo.Crear(new DatosBiometricos
        {
            MiembroId = miembro.Id,
            Edad = edad,
            PesoKg = pesoKg,
            AlturaCm = alturaCm,
            NivelExperiencia = Enum.Parse<NivelExperiencia>(nivelExperiencia),
        });
        await rachaRepo.CrearOActualizar(miembro.Id, 0, EstadoRacha.ACTIVA, null);
        await fatigaRepo.ActualizarOCrear(miembro.Id, 0, EstadoFatiga.OPTIMA);

        var token = authService.GenerarToken(miembro.Id, miembro.Rol.ToString(), null, false);
        return new RegistrarResult(miembro, token);
    }

    public async Task<CrearClanResult> CrearClan(string nombre, Guid liderClanId)
    {
        var clan = new Clan { Nombre = nombre, LiderClanId = liderClanId, CantidadMiembros = 1 };
        await clanRepo.Crear(clan);
        await miembroRepo.ActualizarClan(liderClanId, clan.Id);
        await miembroRepo.ActualizarRol(liderClanId, Rol.SILVERBACK);
        await miembroRepo.CompletarOnboarding(liderClanId);
        await clanRepo.ActualizarCantidadMiembros(clan.Id, 0);
        var token = authService.GenerarToken(liderClanId, Rol.SILVERBACK.ToString(), clan.Id, true);
        return new CrearClanResult(clan, token);
    }

    private const int CapacidadMaximaClan = 20;

    public Task<List<Clan>> GetClanesDisponibles() =>
        clanRepo.ListarDisponibles(CapacidadMaximaClan);

    public async Task<string> UnirseAClan(Guid miembroId, Guid clanId)
    {
        var clan = await clanRepo.BuscarPorId(clanId)
            ?? throw new InvalidOperationException("Clan no encontrado.");
        await miembroRepo.ActualizarClan(miembroId, clanId);
        await miembroRepo.CompletarOnboarding(miembroId);
        await clanRepo.ActualizarCantidadMiembros(clanId, 1);
        var token = authService.GenerarToken(miembroId, Rol.RECLUTA.ToString(), clanId, true);
        return token;
    }
}
