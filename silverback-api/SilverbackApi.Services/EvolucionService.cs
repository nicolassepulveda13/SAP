using SilverbackApi.Data.Repositories;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class EvolucionService(
    MiembroRepository miembroRepo,
    NodoRepository nodoRepo,
    CofreRepository cofreRepo,
    MarketplaceRepository marketplaceRepo) : IEvolucionService
{
    private static readonly Dictionary<Rango, int> CostoXpPorRango = new()
    {
        [Rango.BRONCE]  = 0,
        [Rango.PLATA]   = 500,
        [Rango.ORO]     = 1500,
        [Rango.RANGO_S] = 3000,
    };

    private static readonly Rango[] RangosOrden = [Rango.BRONCE, Rango.PLATA, Rango.ORO, Rango.RANGO_S];

    public async Task<ProgresoEvolucion> CargarProgreso(Guid miembroId)
    {
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");

        var idx = Array.IndexOf(RangosOrden, miembro.Rango);
        var proximoRango = idx < RangosOrden.Length - 1 ? RangosOrden[idx + 1] : (Rango?)null;
        var xpParaSiguiente = proximoRango.HasValue ? CostoXpPorRango[proximoRango.Value] - miembro.Xp : (int?)null;

        return new ProgresoEvolucion(miembro, xpParaSiguiente);
    }

    public Task<List<Cofre>> ObtenerCofresDisponibles(Guid miembroId) =>
        cofreRepo.ListarDisponibles(miembroId);

    public async Task<object> ReclamarCofre(Guid cofreId, Guid miembroId)
    {
        var cofre = await cofreRepo.BuscarDisponible(cofreId, miembroId)
            ?? throw new InvalidOperationException("Cofre no disponible.");
        await cofreRepo.MarcarReclamado(cofreId);
        return new { tipo = "cosmético", rareza = cofre.Rareza.ToString() };
    }

    public Task<List<Item>> ObtenerItems(CategoriaItem categoria) =>
        marketplaceRepo.Listar(categoria);

    public async Task<Item> ComprarItem(Guid itemId, Guid miembroId)
    {
        var item = await marketplaceRepo.BuscarItem(itemId)
            ?? throw new InvalidOperationException("Ítem no encontrado.");
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        if (miembro.Coins < item.Precio)
            throw new InvalidOperationException("Coins insuficientes.");

        await miembroRepo.ActualizarCoins(miembroId, -item.Precio);
        await marketplaceRepo.RegistrarCompra(miembroId, itemId);
        return item;
    }

    public async Task<InversionNodo> MejorarNodo(Guid nodoId, Guid miembroId)
    {
        var nodo = await nodoRepo.BuscarPorId(nodoId)
            ?? throw new InvalidOperationException("Nodo no encontrado.");
        var miembro = await miembroRepo.BuscarPorId(miembroId)
            ?? throw new InvalidOperationException("Miembro no encontrado.");
        if (miembro.Xp < nodo.CostoXp)
            throw new InvalidOperationException("XP insuficiente.");

        await miembroRepo.ActualizarXP(miembroId, -nodo.CostoXp);
        return await nodoRepo.CrearInversion(miembroId, nodoId);
    }
}
