using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

// CU-004-001 / RF-006
public record Atributos(int Fuerza, int Agilidad, int Resistencia);
public record ProgresoEvolucion(Miembro Miembro, int Nivel, int XpParaSiguienteRango, Rango? RangoSiguiente, Atributos Atributos);

// CU-004-002 / RF-015 (árbol colectivo del clan)
public record NodoArbol(Nodo Nodo, int Nivel, bool Bloqueado, List<string> PrerequisitosFaltantes, int? CostoSiguienteNivel);
public record ArbolClan(int PuntosClan, List<NodoArbol> Nodos, List<InversionNodo> UltimasInversiones);

// CU-004-003
public record CofreVista(Cofre Cofre, bool Bloqueado);
public record Boveda(int TotalCajas, int Listos, decimal MultiplicadorXp, DateTime ProximoBotinUtc, int LlavesAcero, List<CofreVista> Cofres);
public record RecompensaCofre(string Cofre, int Coins, int Xp, decimal Multiplicador);

public interface IEvolucionService
{
    Task<ProgresoEvolucion> CargarProgreso(Guid miembroId);
    Task<ArbolClan> ObtenerArbol(Guid miembroId);
    Task<InversionNodo> MejorarNodo(Guid nodoId, Guid miembroId);
    Task<Boveda> ObtenerBoveda(Guid miembroId);
    Task<RecompensaCofre> ReclamarCofre(Guid cofreId, Guid miembroId);
    Task<List<Item>> ObtenerItems(CategoriaItem? categoria);
    Task<Item> ComprarItem(Guid itemId, Guid miembroId);
}
