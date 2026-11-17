namespace SilverbackApi.Domain.Models;

// CU-004-002 / RF-015: el Árbol de Habilidades es COLECTIVO del clan. Cada nodo tiene niveles (1..NivelMaximo);
// mejorar un nivel cuesta CostoPuntos × (nivel siguiente) Puntos de Clan.
public class Nodo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int CostoPuntos { get; set; }
    public int NivelMaximo { get; set; } = 3;
    // Efecto informativo por nivel: "+{BonusPorNivel × nivel}% {Efecto}" (no altera la fórmula del CER, RNF-003)
    public string Efecto { get; set; } = null!;
    public int BonusPorNivel { get; set; }
    public EstadoNodo Estado { get; set; } = EstadoNodo.BLOQUEADO;
    public ICollection<NodoDependencia> Requiere { get; set; } = [];
    public ICollection<NodoDependencia> RequeridoPor { get; set; } = [];
    public ICollection<NodoClan> NivelesPorClan { get; set; } = [];
    public ICollection<InversionNodo> Inversiones { get; set; } = [];
}

public class NodoDependencia
{
    public Guid NodoId { get; set; }
    public Guid PrerequisiteId { get; set; }

    public Nodo Nodo { get; set; } = null!;
    public Nodo Prerequisito { get; set; } = null!;
}

// Nivel actual de cada nodo para cada clan (sin fila = nivel 0)
public class NodoClan
{
    public Guid ClanId { get; set; }
    public Guid NodoId { get; set; }
    public int Nivel { get; set; }

    public Clan Clan { get; set; } = null!;
    public Nodo Nodo { get; set; } = null!;
}

// Historial de inversiones del clan (panel "ÚLTIMAS INVERSIONES")
public class InversionNodo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClanId { get; set; }
    public Guid NodoId { get; set; }
    public Guid MiembroId { get; set; }
    public int NivelAlcanzado { get; set; }
    public int Costo { get; set; }
    public DateTime InvertidoEn { get; set; } = DateTime.UtcNow;

    public Clan Clan { get; set; } = null!;
    public Miembro Miembro { get; set; } = null!;
    public Nodo Nodo { get; set; } = null!;
}
