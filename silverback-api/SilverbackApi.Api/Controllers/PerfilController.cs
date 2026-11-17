using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Services;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

// PKG_PERFIL (CU-005-001 a 007). DTOs en todo el controller: las entidades tienen navegación a Miembro (PasswordHash).
[ApiController]
[Route("api/perfil")]
[Authorize]
public class PerfilController(IPerfilService svc, IGuerraService guerraSvc) : SilverbackControllerBase
{
    public record ReclamarBeneficioRequest(Guid BeneficioId);
    public record ActualizarCuentaRequest(string Nombre, string Email);
    public record CambiarPasswordRequest(string PasswordActual, string PasswordNueva, string PasswordConfirmacion);

    // CU-005-001
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
                    d.Miembro.Id, d.Miembro.Nombre, d.Miembro.Email,
                    Rol = d.Miembro.Rol.ToString(), Rango = d.Miembro.Rango.ToString(),
                    Arquetipo = d.Miembro.Arquetipo?.ToString() ?? "ATLETICO",
                    d.Miembro.Xp, d.Miembro.Coins, d.Miembro.ClanId,
                },
                estadisticas = d.Estadisticas,
                clan = d.Clan is null ? null : new { d.Clan.Id, d.Clan.Nombre, d.Clan.PuntosClan },
                d.IndiceDominancia, d.PosicionEnClan, d.MiembrosConDatos,
                d.Radar,
                volumen = new { usuario = d.VolumenUsuario, promedioClan = d.VolumenPromedioClan, diferencial = d.DiferencialVolumen },
                cer = new { d.Capacidad, d.Eficiencia, d.Recuperacion, rango = d.RangoCer },
                d.CalculadoEn,
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-005-002
    [HttpGet("racha")]
    public async Task<IActionResult> ConsultarRacha()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var racha = await svc.ConsultarRacha(miembroId.Value);
        return racha is null ? NotFound() : Ok(new
        {
            racha.DiasConsecutivos, Estado = racha.Estado.ToString(), racha.UltimoEntrenamiento,
            CostoRescate = PerfilService.CostoSalvarRacha,
        });
    }

    // CU-005-003 — usa siempre el clan del miembro (antes recibía un clanId y se podían gastar puntos de otro clan)
    [HttpPost("racha/salvar")]
    public async Task<IActionResult> SalvarRacha()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { await svc.SalvarRacha(miembroId.Value); return Ok(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-005-003 FA-2
    [HttpPost("racha/dejar-morir")]
    public async Task<IActionResult> DejarMorirRacha()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { await svc.DejarMorirRacha(miembroId.Value); return Ok(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-005-004
    [HttpGet("fatiga")]
    public async Task<IActionResult> ObtenerFatiga()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var f = await svc.CargarFatiga(miembroId.Value);
        return Ok(new
        {
            f.Datos.CargaSemanal, NivelFatiga = f.Datos.NivelFatiga.ToString(), f.Datos.ActualizadoEn,
            f.PorcentajeCarga, f.PesoReferenciaKg, f.SincronizacionPendiente,
            Tendencia = f.Tendencia.Select(t => new { Fecha = t.Fecha.ToString("yyyy-MM-dd"), t.Cer, t.EsHoy, t.EsFuturo }),
        });
    }

    // CU-005-005: trofeos + victorias del clan en la Guerra Global + rango
    [HttpGet("trofeos")]
    public async Task<IActionResult> ObtenerTrofeos()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var trofeos = await svc.CargarTrofeos(miembroId.Value);
        var d = await svc.CargarDashboard(miembroId.Value);
        var victorias = d.Clan is null ? 0 : (await guerraSvc.ObtenerHistorialBatallas(d.Clan.Id)).Victorias;
        return Ok(new
        {
            Victorias = victorias,
            Rango = d.Miembro.Rango.ToString(),
            Trofeos = trofeos.OrderByDescending(t => t.ObtendioEn)
                .Select(t => new { t.Id, t.Nombre, t.Descripcion, Tipo = t.Tipo.ToString(), t.ObtendioEn }),
        });
    }

    // CU-005-006
    [HttpGet("beneficios")]
    public async Task<IActionResult> ObtenerBeneficios()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var beneficios = await svc.CargarBeneficios(miembroId.Value);
        return Ok(beneficios.Select(v => new
        {
            v.Beneficio.Id, v.Beneficio.AliadoId, Aliado = v.Beneficio.Aliado.Nombre, UrlAliado = v.Beneficio.Aliado.UrlBase,
            v.Beneficio.Titulo, v.Beneficio.Descripcion, Tipo = v.Beneficio.Tipo.ToString(), v.Beneficio.Categoria,
            RangoMinimo = v.Beneficio.RangoMinimo.ToString(), v.Beneficio.FechaVencimiento, v.Beneficio.Destacado,
            v.Estado,
            // El código de un beneficio ya reclamado se vuelve a mostrar (es determinístico)
            Codigo = v.Estado == "RECLAMADO" ? PerfilService.CodigoDe(v.Beneficio.Id, miembroId.Value) : null,
            v.SuscripcionHasta,
        }));
    }

    [HttpPost("beneficios/reclamar")]
    public async Task<IActionResult> ReclamarBeneficio([FromBody] ReclamarBeneficioRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var r = await svc.ReclamarBeneficio(req.BeneficioId, miembroId.Value);
            return Ok(new { cupon = r.Codigo, url = r.UrlAliado });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-004-004 paso 18: inventario y activación de ítems
    [HttpGet("inventario")]
    public async Task<IActionResult> Inventario()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var items = await svc.Inventario(miembroId.Value);
        return Ok(items.Select(i => new
        {
            i.ItemId, i.Item.Nombre, Categoria = i.Item.Categoria.ToString(), Rareza = i.Item.Rareza.ToString(), i.Activo, i.CompradoEn,
        }));
    }

    [HttpPost("inventario/{itemId:guid}/activar")]
    public async Task<IActionResult> ActivarItem(Guid itemId)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { await svc.ActivarItem(miembroId.Value, itemId); return Ok(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-005-007
    [HttpPut("cuenta")]
    public async Task<IActionResult> ActualizarCuenta([FromBody] ActualizarCuentaRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var m = await svc.ActualizarCuenta(miembroId.Value, req.Nombre, req.Email);
            return Ok(new { m.Id, m.Nombre, m.Email });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("cuenta/password")]
    public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { await svc.CambiarPassword(miembroId.Value, req.PasswordActual, req.PasswordNueva, req.PasswordConfirmacion); return Ok(); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
}
