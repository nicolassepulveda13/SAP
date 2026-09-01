# 10.5.8b — DER: Arena y Santuario

**Área:** Mecánicas de gameplay — Entrenamientos, guerra global, desafíos y mensajes.  
**Nota:** MIEMBRO y CLAN aparecen simplificados como referencia cruzada.

---

```plantuml
@startuml er-arena-santuario
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

' ─── Referencia cruzada (simplificada) ────────────────────

entity MIEMBRO {
  * id : UUID <<PK>>
}

entity CLAN {
  * id : UUID <<PK>>
}

' ─── ARENA ────────────────────────────────────────────────

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
}

' ─── SANTUARIO ────────────────────────────────────────────

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
  * id : UUID <<PK>>
  --
  * desafio_id : UUID <<FK>>
  * miembro_id : UUID <<FK>>
  * estado : ENUM(ACTIVO,COMPLETADO,EXPIRADO)
  * fecha_aceptacion : TIMESTAMP DEFAULT NOW()
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

entity ADMIN_HISTORIAL {
  * id : UUID <<PK>>
  --
  * miembro_id : UUID <<FK>>
  * tipo : VARCHAR(50)
  * descripcion : TEXT
  * timestamp : TIMESTAMP DEFAULT NOW()
}

' ─── Relaciones ───────────────────────────────────────────

ENTRENAMIENTO }|--|| MIEMBRO : "registrado por"

PARTICIPACION_GUERRA }|--|| GUERRA_GLOBAL : "de"
PARTICIPACION_GUERRA }|--|| CLAN : "de"

DESAFIO }o--|| CLAN : "propuesto por"
ACEPTACION_DESAFIO }|--|| DESAFIO : "sobre"
ACEPTACION_DESAFIO }|--|| MIEMBRO : "aceptado por"

MENSAJE }|--|| CLAN : "en"
MENSAJE }|--|| MIEMBRO : "enviado por"

ADMIN_HISTORIAL }|--|| MIEMBRO : "registra acciones de"

@enduml
```
