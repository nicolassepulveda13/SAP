using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Api.Controllers;

// PKG_EVOLUCIÓN / BÓVEDA (CU-004-001 a 004). Todas las respuestas son DTOs (las entidades tienen navegación a Miembro).
[ApiController]
[Route("api/evolucion")]
[Authorize]
public class EvolucionController(IEvolucionService svc) : SilverbackControllerBase
{
    public record ComprarItemRequest(Guid ItemId);
    public record MejorarNodoRequest(Guid NodoId);

    // CU-004-001
    [HttpGet("progreso")]
    public async Task<IActionResult> ObtenerProgreso()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var p = await svc.CargarProgreso(miembroId.Value);
            return Ok(new
            {
                Miembro = new
                {
                    p.Miembro.Id, p.Miembro.Nombre, Rango = p.Miembro.Rango.ToString(),
                    Arquetipo = p.Miembro.Arquetipo?.ToString(), p.Miembro.Xp, p.Miembro.Coins, p.Miembro.LlavesAcero,
                },
                p.Nivel,
                p.XpParaSiguienteRango,
                RangoSiguiente = p.RangoSiguiente?.ToString(),
                Rangos = Progresion.Rangos.Select(r => new { Rango = r.Rango.ToString(), r.XpMinima }),
                p.Atributos,
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-004-002
    [HttpGet("arbol")]
    public async Task<IActionResult> ObtenerArbol()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var a = await svc.ObtenerArbol(miembroId.Value);
            return Ok(new
            {
                a.PuntosClan,
                Nodos = a.Nodos.Select(n => new
                {
                    n.Nodo.Id, n.Nodo.Nombre, n.Nodo.Descripcion, n.Nivel, n.Nodo.NivelMaximo,
                    n.Bloqueado, n.PrerequisitosFaltantes, n.CostoSiguienteNivel,
                    Prerequisitos = n.Nodo.Requiere.Select(d => d.PrerequisiteId),
                    EfectoActual = n.Nivel > 0 ? Efecto(n.Nodo, n.Nivel) : null,
                    EfectoSiguiente = n.Nivel < n.Nodo.NivelMaximo ? Efecto(n.Nodo, n.Nivel + 1) : null,
                }),
                UltimasInversiones = a.UltimasInversiones.Select(i => new
                {
                    Nodo = i.Nodo.Nombre, i.NivelAlcanzado, i.Costo, Miembro = i.Miembro.Nombre, i.InvertidoEn,
                }),
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    private static string Efecto(Nodo n, int nivel) => $"+{n.BonusPorNivel * nivel}% {n.Efecto}";

    [HttpPost("nodos/mejorar")]
    public async Task<IActionResult> MejorarNodo([FromBody] MejorarNodoRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var inv = await svc.MejorarNodo(req.NodoId, miembroId.Value);
            return Ok(new { inv.NodoId, inv.NivelAlcanzado, inv.Costo, inv.InvertidoEn });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-004-003
    [HttpGet("boveda")]
    public async Task<IActionResult> ObtenerBoveda()
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try
        {
            var b = await svc.ObtenerBoveda(miembroId.Value);
            return Ok(new
            {
                b.TotalCajas, b.Listos, b.MultiplicadorXp, b.ProximoBotinUtc, b.LlavesAcero,
                Cofres = b.Cofres.Select(v => new
                {
                    v.Cofre.Id, Rareza = v.Cofre.Rareza.ToString(), Nombre = Progresion.NombreCofre(v.Cofre.Rareza),
                    Contenido = Progresion.ContenidoCofre(v.Cofre.Rareza), v.Cofre.LlavesRequeridas,
                    v.Bloqueado, Evento = v.Cofre.Rareza == RarezaCofre.LEGENDARIO, Origen = v.Cofre.Origen.ToString(), v.Cofre.ObtendioEn,
                }),
            });
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("cofres/{cofreId:guid}/reclamar")]
    public async Task<IActionResult> ReclamarCofre(Guid cofreId)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(await svc.ReclamarCofre(cofreId, miembroId.Value)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    // CU-004-004
    [HttpGet("items")]
    public async Task<IActionResult> ObtenerItems([FromQuery] string? categoria = null)
    {
        CategoriaItem? cat = null;
        if (!string.IsNullOrWhiteSpace(categoria))
        {
            if (!Enum.TryParse<CategoriaItem>(categoria, out var c))
                return BadRequest(new { error = "Categoría inválida." });
            cat = c;
        }
        var items = await svc.ObtenerItems(cat);
        return Ok(items.Select(ItemDto));
    }

    private static object ItemDto(Item i) =>
        new { i.Id, i.Nombre, i.Descripcion, Categoria = i.Categoria.ToString(), Rareza = i.Rareza.ToString(), i.Precio, i.ImagenUrl };

    [HttpPost("items/comprar")]
    public async Task<IActionResult> ComprarItem([FromBody] ComprarItemRequest req)
    {
        var miembroId = ObtenerMiembroId();
        if (miembroId is null) return Unauthorized();
        try { return Ok(ItemDto(await svc.ComprarItem(req.ItemId, miembroId.Value))); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
}
