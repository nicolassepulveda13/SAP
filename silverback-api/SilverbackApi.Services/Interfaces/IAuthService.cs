using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record LoginResult(Miembro Miembro, string Token);

public interface IAuthService
{
    Task<LoginResult> Login(string email, string password);
    string GenerarToken(Guid miembroId, string rol, Guid? clanId, bool onboardingCompletado);
}
