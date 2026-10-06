using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
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
        try
        {
            // S6-Fix: DTO. Devolver la entidad Miembro generaba un ciclo de serialización (500)
            // y exponía el PasswordHash antes de romper.
            var p = await svc.CargarProgreso(miembroId.Value);
            return Ok(new
            {
                Miembro = new
                {
                    p.Miembro.Id, p.Miembro.Nombre, Rango = p.Miembro.Rango.ToString(),
                    Arquetipo = p.Miembro.Arquetipo?.ToString(), p.Miembro.Xp, p.Miembro.Coins,
                },
                p.XpParaSiguienteRango,
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("cofres")]
    public async Task<IActionResult> ObtenerCofres()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        var cofres = await svc.ObtenerCofresDisponibles(miembroId.Value);
        return Ok(cofres.Select(c => new { c.Id, Rareza = c.Rareza.ToString(), Estado = c.Estado.ToString(), c.ObtendioEn }));
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
        var items = await svc.ObtenerItems(cat);
        return Ok(items.Select(ItemDto));
    }

    // Los DTO evitan serializar navegaciones (Inventarios → Miembro) que pueden estar cargadas en el contexto
    private static object ItemDto(Item i) =>
        new { i.Id, i.Nombre, i.Descripcion, Categoria = i.Categoria.ToString(), i.Precio, i.ImagenUrl };

    [HttpPost("items/comprar")]
    public async Task<IActionResult> ComprarItem([FromBody] ComprarItemRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(ItemDto(await svc.ComprarItem(req.ItemId, miembroId.Value))); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("nodos/mejorar")]
    public async Task<IActionResult> MejorarNodo([FromBody] MejorarNodoRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var inversion = await svc.MejorarNodo(req.NodoId, miembroId.Value);
            return Ok(new { inversion.NodoId, inversion.MiembroId, inversion.InvertidoEn });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

}
