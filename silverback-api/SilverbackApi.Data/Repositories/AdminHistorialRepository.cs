using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data.Repositories;

public class AdminHistorialRepository(AppDbContext db)
{
    public async Task Registrar(Guid miembroId, string tipo, string detalle)
    {
        db.AdminHistorial.Add(new AdminHistorial
        {
            MiembroId = miembroId,
            Tipo = tipo,
            Detalle = detalle,
        });
        await db.SaveChangesAsync();
    }
}
