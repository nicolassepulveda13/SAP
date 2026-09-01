using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Domain;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/evolucion")]
[Authorize]
public class EvolucionController(IEvolucionService svc) : SilverbackControllerBase
{
    public record ComprarItemRequest(Guid ItemId);
    public record MejorarNodoRequest(Guid NodoId);

    [HttpGet("progreso")]
    public async Task<IActionResult> ObtenerProgreso()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(await svc.CargarProgreso(miembroId.Value)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("cofres")]
    public async Task<IActionResult> ObtenerCofres()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        return Ok(await svc.ObtenerCofresDisponibles(miembroId.Value));
    }

    [HttpPost("cofres/{cofreId:guid}/reclamar")]
    public async Task<IActionResult> ReclamarCofre(Guid cofreId)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(await svc.ReclamarCofre(cofreId, miembroId.Value)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("items")]
    public async Task<IActionResult> ObtenerItems([FromQuery] string categoria = "SKIN")
    {
        if (!Enum.TryParse<CategoriaItem>(categoria, out var cat))
            return BadRequest(new { error = "Categoría inválida." });
        return Ok(await svc.ObtenerItems(cat));
    }

    [HttpPost("items/comprar")]
    public async Task<IActionResult> ComprarItem([FromBody] ComprarItemRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(await svc.ComprarItem(req.ItemId, miembroId.Value)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("nodos/mejorar")]
    public async Task<IActionResult> MejorarNodo([FromBody] MejorarNodoRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(await svc.MejorarNodo(req.NodoId, miembroId.Value)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

}
