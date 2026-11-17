# 10.5.8 — Diagrama Entidad-Relación

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama ER — Notación pata de gallo (Information Engineering)  
**Base de datos:** SQL Server  
**Descripción:** Modelo relacional completo. Cardinalidades en notación crow's foot.

---

```plantuml
@startuml er-silverback
hide circle
skinparam linetype ortho
skinparam entity {
  BackgroundColor #242424
  BorderColor #F97316
  FontColor #FFFFFF
  AttributeFontColor #CCCCCC
}
skinparam arrow {
  Color #F97316
}

' ════════════════════════════════════════
' FILA 1 — NÚCLEO
' ════════════════════════════════════════

entity CLAN {
  * id : UUID <<PK>>
  --
  * nombre : VARCHAR(100)
  * lider_clan_id : UUID <<FK>>
  * puntaje_cer : DECIMAL DEFAULT 0
  * cantidad_miembros : INTEGER DEFAULT 0
  * puntos_clan : INTEGER DEFAULT 0
}

entity MIEMBRO {
  * id : UUID <<PK>>
  --
  * nombre : VARCHAR(100)
  * email : VARCHAR(100)
  * arquetipo : ENUM(VOLUMEN,DEFINIDO,ATLETICO)
  * rol : ENUM(SILVERBACK,BETA,EXPLORADOR,RECLUTA)
  * rango : ENUM(BRONCE,PLATA,ORO)
  * xp : INTEGER DEFAULT 0
  * coins : INTEGER DEFAULT 0
  * llaves_acero : INTEGER DEFAULT 0
  clan_id : UUID <<FK>>
}

' ════════════════════════════════════════
' FILA 2 — PERFIL BIOMÉTRICO
' ════════════════════════════════════════

entity DATOS_BIOMETRICOS {
  * miembro_id : UUID <<PK,FK>>
  --
  * edad : INTEGER
  * peso_kg : DECIMAL
  * altura_cm : INTEGER
  * nivel_experiencia : ENUM
}

entity DATOS_FATIGA {
  * miembro_id : UUID <<PK,FK>>
  --
  * nivel_fatiga : ENUM(OPTIMA,MODERADA,ELEVADA,CRITICA)
  * fc_reposo : INTEGER
  * calidad_sueno : INTEGER
  * carga_semanal : DECIMAL DEFAULT 0
}

entity RACHA {
  * miembro_id : UUID <<PK,FK>>
  --
  * dias_consecutivos : INTEGER DEFAULT 0
  * estado : ENUM(ACTIVA,EN_RIESGO,ROTA)
  * ultimo_entrenamiento : TIMESTAMP
}

' ════════════════════════════════════════
' FILA 3 — ARENA
' ════════════════════════════════════════

entity ENTRENAMIENTO {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * ejercicio : VARCHAR(100)
  * peso_kg : DECIMAL
  * repeticiones : INTEGER
  * puntaje_cer : DECIMAL
  * fecha : TIMESTAMP DEFAULT NOW()
}

entity GUERRA_GLOBAL {
  * id : UUID <<PK>>
  --
  * semana : VARCHAR(20)
  * estado : ENUM(ACTIVA,FINALIZADA)
  * fecha_fin : TIMESTAMP
}

entity PARTICIPACION_GUERRA {
  * guerra_id : UUID <<PK,FK>>
  * clan_id : UUID <<PK,FK>>
  --
  * puntaje_cer : DECIMAL DEFAULT 0
  * posicion : INTEGER DEFAULT 0
}

' ════════════════════════════════════════
' FILA 4 — SANTUARIO
' ════════════════════════════════════════

entity DESAFIO {
  * id : UUID <<PK>>
  --
  * clan_id : UUID <<FK>>
  * nombre : VARCHAR(150)
  * tier : ENUM(BRONCE,PLATA,ORO)
  * estado : ENUM(PENDIENTE,ACTIVO,COMPLETADO,EXPIRADO)
  * xp_recompensa : INTEGER
  * fecha_expiracion : TIMESTAMP
}

entity ACEPTACION_DESAFIO {
  * desafio_id : UUID <<PK,FK>>
  * miembro_id : UUID <<PK,FK>>
  --
  * aceptado_en : TIMESTAMP DEFAULT NOW()
}

entity MENSAJE {
  * id : UUID <<PK>>
  --
  * clan_id : UUID <<FK>>
  * miembro_id : UUID <<FK>>
  * contenido : TEXT
  * tipo : ENUM(TEXTO,SISTEMA,DESAFIO)
  * timestamp : TIMESTAMP DEFAULT NOW()
}

' ════════════════════════════════════════
' FILA 5 — EVOLUCIÓN: SKILL TREE + BÓVEDA
' ════════════════════════════════════════

entity NODO {
  * id : UUID <<PK>>
  --
  * nombre : VARCHAR(100)
  * descripcion : TEXT
  * costo_puntos : INTEGER
  * nivel_maximo : INTEGER DEFAULT 3
  * efecto : VARCHAR(200)
  * bonus_por_nivel : INTEGER
  * estado : ENUM(BLOQUEADO,DISPONIBLE,DESBLOQUEADO)
}

entity NODO_DEPENDENCIA {
  * nodo_id : UUID <<PK,FK>>
  * prerequisito_id : UUID <<PK,FK>>
}

entity NODO_CLAN {
  * clan_id : UUID <<PK,FK>>
  * nodo_id : UUID <<PK,FK>>
  --
  * nivel : INTEGER
}

entity INVERSION_NODO {
  * id : UUID <<PK>>
  --
  * clan_id : UUID <<FK>>
  * nodo_id : UUID <<FK>>
  * miembro_id : UUID <<FK>>
  * nivel_alcanzado : INTEGER
  * costo : INTEGER
  * fecha_inversion : TIMESTAMP DEFAULT NOW()
}

entity COFRE {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * rareza : ENUM(COMUN,RARO,EPICO,LEGENDARIO)
  * estado : ENUM(DISPONIBLE,RECLAMADO)
  * origen : ENUM(BOTIN_DIARIO,HITO,GUERRA)
  * llaves_requeridas : INTEGER DEFAULT 0
  * fecha_obtencion : TIMESTAMP DEFAULT NOW()
}

' ════════════════════════════════════════
' FILA 6 — EVOLUCIÓN: MARKETPLACE
' ════════════════════════════════════════

entity ITEM {
  * id : UUID <<PK>>
  --
  * nombre : VARCHAR(100)
  * categoria : ENUM(SKIN,AURA,ICONO)
  * precio : INTEGER
  * rareza : ENUM(COMUN,RARO,EPICO,LEGENDARIO)
}

entity INVENTARIO_ITEMS {
  * miembro_id : UUID <<PK,FK>>
  * item_id : UUID <<PK,FK>>
  --
  * fecha_obtencion : TIMESTAMP DEFAULT NOW()
  * activo : BOOLEAN DEFAULT FALSE
}

entity TRANSACCION_MARKETPLACE {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * item_id : UUID <<FK>>
  * fecha : TIMESTAMP DEFAULT NOW()
}

' ════════════════════════════════════════
' FILA 7 — PERFIL: TROFEOS + BENEFICIOS
' ════════════════════════════════════════

entity TROFEO {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * nombre : VARCHAR(100)
  * descripcion : TEXT
  * tipo : ENUM(RACHA,CER,CLAN,EVENTO)
  * fecha_obtencion : TIMESTAMP DEFAULT NOW()
}

entity ALIADO_COMERCIAL {
  * id : UUID <<PK>>
  --
  * nombre : VARCHAR(100)
  * url_base : VARCHAR(255)
  logo_url : VARCHAR(255)
}

entity BENEFICIO_ALIADO {
  * id : UUID <<PK>>
  --
  * aliado_id : UUID <<FK>>
  * titulo : VARCHAR(150)
  * descripcion : TEXT
  * categoria : VARCHAR(50)
  * tipo : ENUM(CODIGO,REDIRECCION,CUPON,SUSCRIPCION)
  * rango_minimo : ENUM(BRONCE,PLATA,ORO)
  * estado : ENUM(DISPONIBLE,EXPIRADO)
  * destacado : BOOLEAN DEFAULT FALSE
  fecha_vencimiento : TIMESTAMP
}

entity RECLAMO_BENEFICIO {
  * beneficio_id : UUID <<PK,FK>>
  * miembro_id : UUID <<PK,FK>>
  --
  * fecha_reclamo : TIMESTAMP DEFAULT NOW()
}

entity SUSCRIPCION_ACTIVA {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * aliado_id : UUID <<FK>>
  * fecha_inicio : TIMESTAMP DEFAULT NOW()
  * fecha_fin : TIMESTAMP
}

entity ADMIN_HISTORIAL {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * tipo : VARCHAR(50)
  * descripcion : TEXT
  * timestamp : TIMESTAMP DEFAULT NOW()
}

' ════════════════════════════════════════
' HIDDEN LINKS — FORZAR APILAMIENTO VERTICAL
' ════════════════════════════════════════

CLAN -[hidden]d- DATOS_BIOMETRICOS
MIEMBRO -[hidden]d- RACHA
DATOS_BIOMETRICOS -[hidden]d- ENTRENAMIENTO
RACHA -[hidden]d- GUERRA_GLOBAL
ENTRENAMIENTO -[hidden]d- DESAFIO
GUERRA_GLOBAL -[hidden]d- ACEPTACION_DESAFIO
DESAFIO -[hidden]d- NODO
ACEPTACION_DESAFIO -[hidden]d- COFRE
NODO -[hidden]d- ITEM
COFRE -[hidden]d- INVENTARIO_ITEMS
ITEM -[hidden]d- TROFEO
INVENTARIO_ITEMS -[hidden]d- ALIADO_COMERCIAL
TROFEO -[hidden]d- BENEFICIO_ALIADO
ALIADO_COMERCIAL -[hidden]d- ADMIN_HISTORIAL

' ════════════════════════════════════════
' RELACIONES
' ════════════════════════════════════════

MIEMBRO }o--|| CLAN : "pertenece a"
CLAN ||--|| MIEMBRO : "liderado por"

DATOS_BIOMETRICOS ||-|| MIEMBRO : "corresponde a"
DATOS_FATIGA ||-|| MIEMBRO : "corresponde a"
RACHA ||-|| MIEMBRO : "corresponde a"

ENTRENAMIENTO }|--|| MIEMBRO : "registrado por"
PARTICIPACION_GUERRA }|--|| GUERRA_GLOBAL : "de"
PARTICIPACION_GUERRA }|--|| CLAN : "de"

DESAFIO }o--|| CLAN : "propuesto por"
ACEPTACION_DESAFIO }|--|| DESAFIO : "sobre"
ACEPTACION_DESAFIO }|--|| MIEMBRO : "aceptado por"
MENSAJE }|--|| CLAN : "en"
MENSAJE }|--|| MIEMBRO : "enviado por"

NODO_DEPENDENCIA }o--|| NODO : "nodo / requiere"
NODO_CLAN }o--|| CLAN : "nivel en"
NODO_CLAN }o--|| NODO : "de"
INVERSION_NODO }o--|| CLAN : "del clan"
INVERSION_NODO }o--|| NODO : "sobre"
INVERSION_NODO }o--|| MIEMBRO : "realizada por"
COFRE }o--|| MIEMBRO : "pertenece a"
INVENTARIO_ITEMS }o--|| MIEMBRO : "de"
INVENTARIO_ITEMS }o--|| ITEM : "contiene"
TRANSACCION_MARKETPLACE }o--|| MIEMBRO : "realizada por"
TRANSACCION_MARKETPLACE }o--|| ITEM : "sobre"
BENEFICIO_ALIADO }o--|| ALIADO_COMERCIAL : "provisto por"
RECLAMO_BENEFICIO }o--|| BENEFICIO_ALIADO : "de"
RECLAMO_BENEFICIO }o--|| MIEMBRO : "reclamado por"
SUSCRIPCION_ACTIVA }o--|| MIEMBRO : "de"
SUSCRIPCION_ACTIVA }o--|| ALIADO_COMERCIAL : "con"


TROFEO }o--|| MIEMBRO : "obtenido por"
ADMIN_HISTORIAL }|--|| MIEMBRO : "registra acciones de"

@enduml
```
