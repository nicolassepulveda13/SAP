using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class BiometricosRepository(AppDbContext db)
{
    public Task<DatosBiometricos?> ObtenerPorMiembro(Guid miembroId) =>
        db.DatosBiometricos.FirstOrDefaultAsync(d => d.MiembroId == miembroId);

    public async Task<DatosBiometricos> Crear(DatosBiometricos datos)
    {
        db.DatosBiometricos.Add(datos);
        await db.SaveChangesAsync();
        return datos;
    }

    public async Task<DatosBiometricos> Actualizar(DatosBiometricos datos)
    {
        datos.ActualizadoEn = DateTime.UtcNow;
        db.DatosBiometricos.Update(datos);
        await db.SaveChangesAsync();
        return datos;
    }
}
