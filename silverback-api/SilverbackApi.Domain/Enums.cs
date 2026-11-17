namespace SilverbackApi.Domain;

public enum Arquetipo { VOLUMEN, DEFINIDO, ATLETICO }
public enum Rol { SILVERBACK, BETA, EXPLORADOR, RECLUTA }
public enum Rango { BRONCE, PLATA, ORO, RANGO_S }
public enum NivelExperiencia { PRINCIPIANTE, INTERMEDIO, AVANZADO, ELITE }
public enum EstadoFatiga { OPTIMA, MODERADA, ELEVADA, CRITICA }
public enum EstadoRacha { ACTIVA, EN_RIESGO, ROTA }
public enum EstadoGuerra { ACTIVA, FINALIZADA }
public enum TierDesafio { BRONCE, PLATA, ORO }
public enum EstadoDesafio { PENDIENTE, ACTIVO, COMPLETADO, EXPIRADO }
public enum TipoMensaje { TEXTO, SISTEMA, DESAFIO }
public enum EstadoNodo { BLOQUEADO, DISPONIBLE, DESBLOQUEADO }
public enum RarezaCofre { COMUN, RARO, EPICO, LEGENDARIO }
public enum EstadoCofre { DISPONIBLE, RECLAMADO }
public enum OrigenCofre { BOTIN_DIARIO, HITO, GUERRA } // CU-004-003: de dónde salió el cofre
public enum CategoriaItem { SKIN, AURA, ICONO } // CU-004-004: SKINS, AURAS, ICONOS
public enum RarezaItem { COMUN, RARO, EPICO, LEGENDARIO } // DER 10.5.8c: ITEM.rareza
public enum TipoTrofeo { RACHA, CER, CLAN, EVENTO }
public enum TipoBeneficio { CODIGO, REDIRECCION, CUPON, SUSCRIPCION }
public enum EstadoBeneficio { DISPONIBLE, RECLAMADO, EXPIRADO }
