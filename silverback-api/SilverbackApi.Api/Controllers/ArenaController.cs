// S4-Arena: ArenaController — módulo de registro de entrenamientos y Guerra Global
// S4-RegistrarEntrenamiento: POST /api/arena/entrenar — calcula CER, acumula al clan, actualiza racha (CU-003-002 + CU-003-003)
// S4-Historial: GET /api/arena/historial — lista entrenamientos del miembro paginados (CU-003-004)
// S4-GuerraGlobal: GET /api/arena/guerra — estado de la guerra activa con participaciones (CU-003-001)
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
        if (guerra is null) return NotFound();
        return Ok(new
        {
            guerra.Id,
            guerra.Semana,
            Estado = guerra.Estado.ToString(),
            guerra.FechaFin,
            Participaciones = guerra.Participaciones
                .Select(p => new { p.ClanId, p.CerAcumulado, p.Posicion })
                .OrderByDescending(p => p.CerAcumulado)
                .ToList(),
        });
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
