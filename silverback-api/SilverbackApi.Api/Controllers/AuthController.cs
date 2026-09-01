using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    public record LoginRequest(string Email, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            var result = await authService.Login(req.Email, req.Password);
            return Ok(new
            {
                token = result.Token,
                miembro = new
                {
                    result.Miembro.Id,
                    result.Miembro.Nombre,
                    result.Miembro.Email,
                    result.Miembro.Rol,
                    result.Miembro.Rango,
                    result.Miembro.Xp,
                    result.Miembro.Coins,
                    result.Miembro.ClanId,
                }
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
