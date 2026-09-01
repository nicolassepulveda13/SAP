using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Services.Interfaces;

public interface ICerService
{
    ResultadoCER Calcular(decimal pesoKg, int repeticiones, Arquetipo arquetipo);
}
