// S1-Onboarding: IncorporacionController — rutas públicas + semi-autenticadas del flujo de registro
// S2-Onboarding: GET /clanes (público), POST /registrar (público — devuelve token preliminar sin clan)
// S3-CrearClan: POST /clan (requiere token preliminar — crea clan, asigna SILVERBACK, devuelve token definitivo)
// S3-UnirseAClan: POST /unirse (requiere token preliminar — asigna clan, devuelve token definitivo con onboarding=true)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/incorporacion")]
public class IncorporacionController(IIncorporacionService svc) : SilverbackControllerBase
{
    private const int CapacidadMaximaClan = 20;

    public record RegistrarRequest(string Nombre, string Email, string Password, string Arquetipo,
        int Edad, decimal PesoKg, decimal AlturaCm, string NivelExperiencia);
    public record CrearClanRequest(string Nombre);
    public record UnirseRequest(Guid ClanId);

    [HttpGet("clanes")]
    public async Task<IActionResult> ClanesDisponibles()
    {
        var clanes = await svc.GetClanesDisponibles();
        return Ok(clanes.Select(c => new
        {
            c.Id,
            c.Nombre,
            c.CantidadMiembros,
            CapacidadMaxima = CapacidadMaximaClan,
        }));
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarRequest req)
    {
        try
        {
            var result = await svc.Registrar(req.Nombre, req.Email, req.Password, req.Arquetipo,
                req.Edad, req.PesoKg, req.AlturaCm, req.NivelExperiencia);
            return CreatedAtAction(nameof(Registrar), new { id = result.Miembro.Id },
                new { result.Miembro.Id, result.Miembro.Nombre, result.Miembro.Email, token = result.Token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("clan")]
    public async Task<IActionResult> CrearClan([FromBody] CrearClanRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var result = await svc.CrearClan(req.Nombre, miembroId.Value);
            return CreatedAtAction(nameof(CrearClan), new { id = result.Clan.Id },
                new { result.Clan.Id, result.Clan.Nombre, token = result.Token });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("unirse")]
    [Authorize]
    public async Task<IActionResult> UnirseAClan([FromBody] UnirseRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var token = await svc.UnirseAClan(miembroId.Value, req.ClanId);
            return Ok(new { token, mensaje = "Te uniste al clan correctamente." });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

}
