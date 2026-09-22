// S4-CER: CerService — fórmula de Capacidad de Esfuerzo Registrado (CU-003-003)
// Fórmula: puntaje = pesoKg × repeticiones × modificador(arquetipo)
// Modificadores: VOLUMEN=1.1, DEFINIDO=1.05, ATLETICO=1.0
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;
using SilverbackApi.Services.Interfaces;

namespace SilverbackApi.Services;

public class CerService : ICerService
{
    private static readonly Dictionary<Arquetipo, decimal> Modificadores = new()
    {
        [Arquetipo.VOLUMEN]  = 1.1m,
        [Arquetipo.DEFINIDO] = 1.05m,
        [Arquetipo.ATLETICO] = 1.0m,
    };

    public ResultadoCER Calcular(decimal pesoKg, int repeticiones, Arquetipo arquetipo)
    {
        var modificador = Modificadores[arquetipo];
        var puntaje = Math.Round(pesoKg * repeticiones * modificador, 2);
        return new ResultadoCER(puntaje, modificador, $"CER calculado con arquetipo {arquetipo}");
    }
}
