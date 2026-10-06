// S4-Arena: ArenaController — módulo de registro de entrenamientos y Guerra Global
// S4-RegistrarEntrenamiento: POST /api/arena/entrenar — calcula CER, acumula al clan, actualiza racha (CU-003-002 + CU-003-003)
// S4-Historial: GET /api/arena/historial — lista entrenamientos del miembro paginados (CU-003-004)
// S6-GuerraGlobal: GET /api/arena/guerra — guerra de la semana: nuestro clan, rival, top 10 (CU-003-001)
// S6-Batallas: GET /api/arena/batallas — historial de batallas cerradas del clan (CU-003-004)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/arena")]
[Authorize]
public class ArenaController(IArenaService svc, IGuerraService guerraSvc) : SilverbackControllerBase
{
    public record EntrenamientoRequest(string Ejercicio, decimal PesoKg, int Repeticiones);

    // S6-Guerra: siempre hay una guerra de la semana (se abre sola). Devuelve nuestro clan, rival, top 10 y cuenta regresiva.
    // El clanId se lee de la base (no del JWT) porque puede haber cambiado desde que se emitió el token.
    [HttpGet("guerra")]
    public async Task<IActionResult> ObtenerGuerra()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var clanId = await svc.ObtenerClanId(miembroId.Value);
        return Ok(await guerraSvc.ObtenerEstado(clanId));
    }

    // S6-Historial: batallas de semanas cerradas del clan del miembro (CU-003-004)
    [HttpGet("batallas")]
    public async Task<IActionResult> ObtenerBatallas()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var clanId = await svc.ObtenerClanId(miembroId.Value);
        if (clanId is null) return Ok(new HistorialBatallasDto(0, 0, 0, 0, []));
        return Ok(await guerraSvc.ObtenerHistorialBatallas(clanId.Value));
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
    public async Task<IActionResult> ObtenerHistorial([FromQuery] int pagina = 1, [FromQuery] string? ejercicio = null)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var historial = await svc.ObtenerHistorial(miembroId.Value, pagina, ejercicio);
        return Ok(historial.Select(e => new { e.Id, e.Ejercicio, e.PesoKg, e.Repeticiones, e.PuntajeCer, e.FechaHora }));
    }

}
