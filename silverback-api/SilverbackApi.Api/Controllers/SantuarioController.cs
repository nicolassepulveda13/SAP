using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/santuario")]
[Authorize]
public class SantuarioController(ISantuarioService svc) : SilverbackControllerBase
{
    public record CrearDesafioRequest(string Descripcion, string Tier, int RecompensaXp, DateTime FechaExpiracion);
    public record EnviarMensajeRequest(string Contenido);

    [HttpGet("{clanId:guid}")]
    public async Task<IActionResult> ObtenerClan(Guid clanId)
    {
        try { return Ok(await svc.ObtenerClan(clanId)); }
        catch (Exception ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpGet("{clanId:guid}/miembros")]
    public async Task<IActionResult> ListarMiembros(Guid clanId) =>
        Ok(await svc.ListarMiembros(clanId));

    [HttpGet("{clanId:guid}/desafios")]
    public async Task<IActionResult> ListarDesafios(Guid clanId) =>
        Ok(await svc.ListarDesafios(clanId));

    [HttpPost("{clanId:guid}/desafios")]
    public async Task<IActionResult> CrearDesafio(Guid clanId, [FromBody] CrearDesafioRequest req)
    {
        var silverbackId = ObtenerMiembroId();
        if (silverbackId is null) return Unauthorized();
        try
        {
            var desafio = await svc.CrearDesafio(clanId, silverbackId.Value, req.Descripcion, req.Tier, req.RecompensaXp, req.FechaExpiracion);
            return CreatedAtAction(nameof(ListarDesafios), new { clanId }, desafio);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("{clanId:guid}/mensajes")]
    public async Task<IActionResult> ListarMensajes(Guid clanId) =>
        Ok(await svc.ListarMensajes(clanId));

    [HttpPost("{clanId:guid}/mensajes")]
    public async Task<IActionResult> EnviarMensaje(Guid clanId, [FromBody] EnviarMensajeRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var mensaje = await svc.EnviarMensaje(clanId, miembroId.Value, req.Contenido);
        return CreatedAtAction(nameof(ListarMensajes), new { clanId }, mensaje);
    }

}
