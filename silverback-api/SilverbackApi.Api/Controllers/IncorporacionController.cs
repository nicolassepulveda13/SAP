using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/incorporacion")]
public class IncorporacionController(IIncorporacionService svc) : SilverbackControllerBase
{
    public record RegistrarRequest(string Nombre, string Email, string Password, string Arquetipo,
        int Edad, decimal PesoKg, decimal AlturaCm, string NivelExperiencia);
    public record CrearClanRequest(string Nombre);
    public record UnirseRequest(Guid ClanId);

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
            var clan = await svc.CrearClan(req.Nombre, miembroId.Value);
            return CreatedAtAction(nameof(CrearClan), new { id = clan.Id }, new { clan.Id, clan.Nombre });
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
