using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public record ProgresoEvolucion(Miembro Miembro, int? XpParaSiguienteRango);

public interface IEvolucionService
{
    Task<ProgresoEvolucion> CargarProgreso(Guid miembroId);
    Task<List<Cofre>> ObtenerCofresDisponibles(Guid miembroId);
    Task<object> ReclamarCofre(Guid cofreId, Guid miembroId);
    Task<List<Item>> ObtenerItems(CategoriaItem categoria);
    Task<Item> ComprarItem(Guid itemId, Guid miembroId);
    Task<InversionNodo> MejorarNodo(Guid nodoId, Guid miembroId);
}
