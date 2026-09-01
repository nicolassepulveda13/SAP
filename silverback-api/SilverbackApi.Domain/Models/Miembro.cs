namespace SilverbackApi.Domain.Models;

public class Miembro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public Rol Rol { get; set; } = Rol.RECLUTA;
    public Rango Rango { get; set; } = Rango.BRONCE;
    public Arquetipo? Arquetipo { get; set; }
    public int Xp { get; set; } = 0;
    public int Coins { get; set; } = 0;
    public Guid? ClanId { get; set; }
    public bool OnboardingCompletado { get; set; } = false;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    public Clan? Clan { get; set; }
    public DatosBiometricos? DatosBiometricos { get; set; }
    public Racha? Racha { get; set; }
    public DatosFatiga? DatosFatiga { get; set; }
    public ICollection<Entrenamiento> Entrenamientos { get; set; } = [];
    public ICollection<Trofeo> Trofeos { get; set; } = [];
    public ICollection<Cofre> Cofres { get; set; } = [];
    public ICollection<InversionNodo> InversionesNodo { get; set; } = [];
    public ICollection<ReclamoBeneficio> ReclamosBeneficio { get; set; } = [];
    public ICollection<InventarioItem> InventarioItems { get; set; } = [];
    public ICollection<MensajeClan> MensajesClan { get; set; } = [];
    public ICollection<AdminHistorial> HistorialAdmin { get; set; } = [];
}
