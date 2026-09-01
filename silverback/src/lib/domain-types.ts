// Tipos del dominio — reemplazan los enums de Prisma (SQL Server no los soporta).
// Usar estos tipos en servicios, repositorios y pages para mantener type-safety.

export type Arquetipo = "VOLUMEN" | "DEFINIDO" | "ATLETICO";
export type Rol = "SILVERBACK" | "BETA" | "EXPLORADOR" | "RECLUTA";
export type Rango = "BRONCE" | "PLATA" | "ORO" | "RANGO_S";
export type NivelExperiencia = "PRINCIPIANTE" | "INTERMEDIO" | "AVANZADO" | "ELITE";
export type EstadoFatiga = "OPTIMA" | "MODERADA" | "ELEVADA" | "CRITICA";
export type EstadoRacha = "ACTIVA" | "EN_RIESGO" | "ROTA";
export type EstadoGuerra = "ACTIVA" | "FINALIZADA";
export type TierDesafio = "BRONCE" | "PLATA" | "ORO";
export type EstadoDesafio = "PENDIENTE" | "ACTIVO" | "COMPLETADO" | "EXPIRADO";
export type TipoMensaje = "TEXTO" | "SISTEMA" | "DESAFIO";
export type EstadoNodo = "BLOQUEADO" | "DISPONIBLE" | "DESBLOQUEADO";
export type RarezaCofre = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";
export type EstadoCofre = "DISPONIBLE" | "RECLAMADO";
export type CategoriaItem = "SKIN" | "HABITAT" | "ACCESORIO" | "AURA";
export type TipoTrofeo = "RACHA" | "CER" | "CLAN" | "EVENTO";
export type TipoBeneficio = "CODIGO" | "REDIRECCION" | "CUPON" | "SUSCRIPCION";
export type EstadoBeneficio = "DISPONIBLE" | "RECLAMADO" | "EXPIRADO";

export const RANGOS_ORDEN: Rango[] = ["BRONCE", "PLATA", "ORO", "RANGO_S"];
