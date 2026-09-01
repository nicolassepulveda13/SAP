using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

[ApiController]
[Route("api/perfil")]
[Authorize]
public class PerfilController(IPerfilService svc) : SilverbackControllerBase
{
    public record SalvarRachaRequest(Guid ClanId);
    public record ReclamarBeneficioRequest(Guid BeneficioId);

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var d = await svc.CargarDashboard(miembroId.Value);
            return Ok(new
            {
                miembro = new
                {
                    d.Miembro.Id,
                    d.Miembro.Nombre,
                    d.Miembro.Email,
                    Rol = d.Miembro.Rol.ToString(),
                    Rango = d.Miembro.Rango.ToString(),
                    d.Miembro.Xp,
                    d.Miembro.Coins,
                    d.Miembro.ClanId,
                },
                estadisticas = d.Estadisticas,
                clan = d.Clan is null ? null : new
                {
                    d.Clan.Id,
                    d.Clan.Nombre,
                    d.Clan.PuntosClan,
                },
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("racha")]
    public async Task<IActionResult> ConsultarRacha()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var racha = await svc.ConsultarRacha(miembroId.Value);
        return racha is null ? NotFound() : Ok(racha);
    }

    [HttpPost("racha/salvar")]
    public async Task<IActionResult> SalvarRacha([FromBody] SalvarRachaRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { await svc.SalvarRacha(miembroId.Value, req.ClanId); return Ok(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("fatiga")]
    public async Task<IActionResult> ObtenerFatiga()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        return Ok(await svc.CargarFatiga(miembroId.Value));
    }

    [HttpGet("trofeos")]
    public async Task<IActionResult> ObtenerTrofeos()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        return Ok(await svc.CargarTrofeos(miembroId.Value));
    }

    [HttpGet("beneficios")]
    public async Task<IActionResult> ObtenerBeneficios()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        return Ok(await svc.CargarBeneficios(miembroId.Value));
    }

    [HttpPost("beneficios/reclamar")]
    public async Task<IActionResult> ReclamarBeneficio([FromBody] ReclamarBeneficioRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var cupon = await svc.ReclamarBeneficio(req.BeneficioId, miembroId.Value);
            return Ok(new { cupon });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

}
