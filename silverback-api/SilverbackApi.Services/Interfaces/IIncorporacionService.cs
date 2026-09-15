using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record RegistrarResult(Miembro Miembro, string Token);
public record CrearClanResult(Clan Clan, string Token);

public interface IIncorporacionService
{
    Task<RegistrarResult> Registrar(string nombre, string email, string password, string arquetipo, int edad, decimal pesoKg, decimal alturaCm, string nivelExperiencia);
    Task<CrearClanResult> CrearClan(string nombre, Guid liderClanId);
    Task<string> UnirseAClan(Guid miembroId, Guid clanId);
    Task<List<Clan>> GetClanesDisponibles();
}
