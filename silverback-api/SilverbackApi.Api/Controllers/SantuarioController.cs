// S3-Santuario: SantuarioController — rutas del Santuario y La Forja (todas requieren [Authorize])
// S3-AceptarDesafio: POST /{clanId}/desafios/{desafioId}/aceptar — persiste AceptacionDesafio, devuelve 204
// S3-CrearDesafio: POST /{clanId}/desafios — solo SILVERBACK; validado en SantuarioService (lanza UnauthorizedAccessException)
// S3-PanelClan: GET /{clanId}/panel — devuelve nombre, puntosClan, cantidadMiembros, posicionRanking
// S4-Tacticas: GET/POST /{clanId}/mensajes — chat persistido del clan con nombre del autor (CU-002-004/005)
// S4-Roles: PUT /{clanId}/miembros/{id}/rol y DELETE /{clanId}/miembros/{id} — solo SILVERBACK (CU-002-006)
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
    public record AsignarRolRequest(string Rol);

    [HttpGet("{clanId:guid}")]
    public async Task<IActionResult> ObtenerClan(Guid clanId)
    {
        try { return Ok(await svc.ObtenerClan(clanId)); }
        catch (Exception ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpGet("{clanId:guid}/miembros")]
    public async Task<IActionResult> ListarMiembros(Guid clanId)
    {
        var miembros = await svc.ListarMiembros(clanId);
        return Ok(miembros.Select(m => new { m.Id, m.Nombre, Rol = m.Rol.ToString(), Rango = m.Rango.ToString(), m.Xp }));
    }

    [HttpGet("{clanId:guid}/panel")]
    public async Task<IActionResult> ObtenerPanel(Guid clanId)
    {
        try { return Ok(await svc.ObtenerPanelClan(clanId)); }
        catch (Exception ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpGet("{clanId:guid}/desafios")]
    public async Task<IActionResult> ListarDesafios(Guid clanId)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        return Ok(await svc.ListarDesafios(clanId, miembroId.Value));
    }

    [HttpPost("{clanId:guid}/desafios/{desafioId:guid}/aceptar")]
    public async Task<IActionResult> AceptarDesafio(Guid clanId, Guid desafioId)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            await svc.AceptarDesafio(clanId, desafioId, miembroId.Value);
            return NoContent();
        }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }

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
    public async Task<IActionResult> ListarMensajes(Guid clanId)
    {
        var mensajes = await svc.ListarMensajes(clanId);
        return Ok(mensajes.Select(m => new { m.Id, m.Contenido, Tipo = m.Tipo.ToString(), m.EnviadoEn, m.MiembroId, AutorNombre = m.Miembro != null ? m.Miembro.Nombre : null }));
    }

    [HttpPost("{clanId:guid}/mensajes")]
    public async Task<IActionResult> EnviarMensaje(Guid clanId, [FromBody] EnviarMensajeRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var mensaje = await svc.EnviarMensaje(clanId, miembroId.Value, req.Contenido);
        return CreatedAtAction(nameof(ListarMensajes), new { clanId },
            new { mensaje.Id, mensaje.Contenido, Tipo = mensaje.Tipo.ToString(), mensaje.EnviadoEn, mensaje.MiembroId });
    }

    [HttpPut("{clanId:guid}/miembros/{miembroId:guid}/rol")]
    public async Task<IActionResult> AsignarRol(Guid clanId, Guid miembroId, [FromBody] AsignarRolRequest req)
    {
        var liderId = ObtenerMiembroId();
        if (liderId is null) return Unauthorized();
        try
        {
            var miembro = await svc.AsignarRol(clanId, liderId.Value, miembroId, req.Rol);
            return Ok(new { miembro.Id, miembro.Nombre, Rol = miembro.Rol.ToString() });
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("{clanId:guid}/miembros/{miembroId:guid}")]
    public async Task<IActionResult> ExpulsarMiembro(Guid clanId, Guid miembroId)
    {
        var liderId = ObtenerMiembroId();
        if (liderId is null) return Unauthorized();
        try
        {
            await svc.ExpulsarMiembro(clanId, liderId.Value, miembroId);
            return Ok(new { ok = true });
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
}
