namespace SilverbackApi.Domain.Models;

public class Nodo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int CostoXp { get; set; }
    public EstadoNodo Estado { get; set; } = EstadoNodo.BLOQUEADO;

    public ICollection<NodoDependencia> Requiere { get; set; } = [];
    public ICollection<NodoDependencia> RequeridoPor { get; set; } = [];
    public ICollection<InversionNodo> Inversiones { get; set; } = [];
}

public class NodoDependencia
{
    public Guid NodoId { get; set; }
    public Guid PrerequisiteId { get; set; }

    public Nodo Nodo { get; set; } = null!;
    public Nodo Prerequisito { get; set; } = null!;
}

public class InversionNodo
{
    public Guid MiembroId { get; set; }
    public Guid NodoId { get; set; }
    public DateTime InvertidoEn { get; set; } = DateTime.UtcNow;

    public Miembro Miembro { get; set; } = null!;
    public Nodo Nodo { get; set; } = null!;
}
