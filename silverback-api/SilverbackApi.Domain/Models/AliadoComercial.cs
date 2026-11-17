namespace SilverbackApi.Domain.Models;

public class AliadoComercial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string UrlBase { get; set; } = null!;
    public string? LogoUrl { get; set; }

    public ICollection<BeneficioAliado> Beneficios { get; set; } = [];
}

public class BeneficioAliado
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AliadoId { get; set; }
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public TipoBeneficio Tipo { get; set; }
    public Rango RangoMinimo { get; set; } = Rango.BRONCE;
    public EstadoBeneficio Estado { get; set; } = EstadoBeneficio.DISPONIBLE;
    // CU-005-006 / RF-016: categoría visible (EQUIPAMIENTO, NUTRICIÓN, ROPA DEPORTIVA…), vencimiento y destacado
    public string Categoria { get; set; } = null!;
    public DateTime? FechaVencimiento { get; set; }
    public bool Destacado { get; set; }

    public AliadoComercial Aliado { get; set; } = null!;
    public ICollection<ReclamoBeneficio> Reclamos { get; set; } = [];
}

public class ReclamoBeneficio
{
    public Guid BeneficioId { get; set; }
    public Guid MiembroId { get; set; }
    public DateTime ReclamadoEn { get; set; } = DateTime.UtcNow;

    public BeneficioAliado Beneficio { get; set; } = null!;
    public Miembro Miembro { get; set; } = null!;
}

// DER 10.5.8c / CU-005-006 paso 18: "ACTIVAR OFERTA" de un beneficio de tipo SUSCRIPCION
public class SuscripcionActiva
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MiembroId { get; set; }
    public Guid AliadoId { get; set; }
    public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
    public DateTime FechaFin { get; set; }

    public Miembro Miembro { get; set; } = null!;
    public AliadoComercial Aliado { get; set; } = null!;
}
