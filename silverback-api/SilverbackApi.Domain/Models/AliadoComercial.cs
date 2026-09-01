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
