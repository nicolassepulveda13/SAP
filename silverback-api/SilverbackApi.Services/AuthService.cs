using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SilverbackApi.Data.Repositories;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class AuthService(MiembroRepository miembroRepo, IConfiguration config) : IAuthService
{
    public async Task<LoginResult> Login(string email, string password)
    {
        var miembro = await miembroRepo.BuscarPorEmail(email)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(password, miembro.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var token = GenerarToken(miembro.Id, miembro.Rol.ToString(), miembro.ClanId, miembro.OnboardingCompletado);
        return new LoginResult(miembro, token);
    }

    public string GenerarToken(Guid miembroId, string rol, Guid? clanId, bool onboardingCompletado)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, miembroId.ToString()),
            new(ClaimTypes.Role, rol),
            new("onboarding_completado", onboardingCompletado.ToString().ToLower()),
        };
        if (clanId.HasValue)
            claims.Add(new Claim("clanId", clanId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
