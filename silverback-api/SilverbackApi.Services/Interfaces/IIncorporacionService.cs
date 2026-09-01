using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record RegistrarResult(Miembro Miembro, string Token);

public interface IIncorporacionService
{
    Task<RegistrarResult> Registrar(string nombre, string email, string password, string arquetipo, int edad, decimal pesoKg, decimal alturaCm, string nivelExperiencia);
    Task<Clan> CrearClan(string nombre, Guid liderClanId);
    Task<string> UnirseAClan(Guid miembroId, Guid clanId);
}
