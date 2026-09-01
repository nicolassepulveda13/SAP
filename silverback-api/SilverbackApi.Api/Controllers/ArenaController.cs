using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/arena")]
[Authorize]
public class ArenaController(IArenaService svc) : SilverbackControllerBase
{
    public record EntrenamientoRequest(string Ejercicio, decimal PesoKg, int Repeticiones);

    [HttpGet("guerra")]
    public async Task<IActionResult> ObtenerGuerra()
    {
        var guerra = await svc.ObtenerGuerraActiva();
        return guerra is null ? NotFound() : Ok(guerra);
    }

    [HttpPost("entrenar")]
    public async Task<IActionResult> Entrenar([FromBody] EntrenamientoRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var resultado = await svc.RegistrarEntrenamiento(miembroId.Value, req.Ejercicio, req.PesoKg, req.Repeticiones);
            return Ok(resultado);
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial([FromQuery] int pagina = 1)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var historial = await svc.ObtenerHistorial(miembroId.Value, pagina);
        return Ok(historial);
    }

}
