# 10.5.7b — Diagrama de Clases: Capa de Dominio

**Capa:** Dominio — proyecto `SilverbackApi.Domain`  
**Descripción:** Entidades del negocio. Solo atributos y relaciones. Son el modelo persistido en SQL Server vía EF Core 9. Los enums se almacenan como strings (`HasConversion<string>()`).

---

```plantuml
@startuml clases-dominio
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam defaultFontName Arial
skinparam defaultFontSize 11

skinparam class {
  BackgroundColor #FFFFFF
  BorderColor #3B82F6
  HeaderBackgroundColor #DBEAFE
  FontColor #111111
}
skinparam arrow {
  Color #444444
  FontColor #333333
  FontSize 10
}
skinparam package {
  BorderThickness 2
  FontStyle bold
  FontSize 12
}

package "Dominio" #EBF4FF {

  ' ── Fila 1: Núcleo
  class Miembro {
    +UUID id
    +String nombre
    +String email
    +Arquetipo arquetipo
    +Rol rol
    +Rango rango
    +Int xp
    +Int coins
    +UUID clanId
  }
  class Clan {
    +UUID id
    +String nombre
    +UUID liderClanId
    +Float puntajeCER
    +Int cantidadMiembros
    +Int puntosClan
  }

  ' ── Fila 2: Perfil biométrico
  class DatosBiometricos {
    +UUID miembroId
    +Int edad
    +Float pesoKg
    +Int alturaCm
    +NivelExperiencia nivelExperiencia
  }
  class Racha {
    +UUID miembroId
    +Int diasConsecutivos
    +EstadoRacha estado
    +Date ultimoEntrenamiento
  }
  class DatosFatiga {
    +UUID miembroId
    +EstadoFatiga nivelFatiga
    +Int frecuenciaCardiacaReposo
    +Int calidadSueno
    +Float cargaSemanal
  }

  ' ── Fila 3: Arena
  class Entrenamiento {
    +UUID id
    +UUID miembroId
    +String ejercicio
    +Float pesoKg
    +Int repeticiones
    +Float puntajeCER
    +Date fecha
  }
  class ResultadoCER {
    +Float puntaje
    +Float multiplicador
    +Arquetipo arquetipo
  }
  class GuerraGlobal {
    +UUID id
    +String semana
    +String estado
    +Date fechaFin
  }
  class ParticipacionGuerra {
    +UUID guerraId
    +UUID clanId
    +Float puntajeCER
  }

  ' ── Fila 4: Santuario
  class Desafio {
    +UUID id
    +UUID clanId
    +String nombre
    +TierDesafio tier
    +EstadoDesafio estado
    +Int xpRecompensa
    +Date fechaExpiracion
  }
  class AceptacionDesafio {
    +UUID id
    +UUID desafioId
    +UUID miembroId
    +EstadoDesafio estado
    +Date fechaAceptacion
  }
  class Mensaje {
    +UUID id
    +UUID clanId
    +UUID miembroId
    +String contenido
    +TipoMensaje tipo
    +Date timestamp
  }

  ' ── Fila 5: Evolución
  class Nodo {
    +UUID id
    +String nombre
    +Int costoXP
    +EstadoNodo estado
  }
  class InversionNodo {
    +UUID miembroId
    +UUID nodoId
    +Date fechaInversion
  }
  class Cofre {
    +UUID id
    +UUID miembroId
    +RarezaCofre rareza
    +EstadoCofre estado
  }
  class Item {
    +UUID id
    +String nombre
    +CategoriaItem categoria
    +Int precio
    +RarezaCofre rareza
  }

  ' ── Fila 6: Perfil
  class Trofeo {
    +UUID id
    +UUID miembroId
    +String nombre
    +TipoTrofeo tipo
    +Date fechaObtencion
  }
  class BeneficioAliado {
    +UUID id
    +UUID aliadoId
    +UUID miembroId
    +String nombre
    +TipoBeneficio tipo
    +Rango rangoMinimo
    +EstadoBeneficio estado
    +Date fechaReclamo
  }
  class AliadoComercial {
    +UUID id
    +String nombre
    +String urlBase
    +String logoUrl
  }

  ' ── Hidden links para grilla vertical ──────────────────
  Miembro -[hidden]r- Clan
  Miembro -[hidden]d- DatosBiometricos
  DatosBiometricos -[hidden]r- Racha
  Racha -[hidden]r- DatosFatiga
  DatosBiometricos -[hidden]d- Entrenamiento
  Entrenamiento -[hidden]r- ResultadoCER
  ResultadoCER -[hidden]r- GuerraGlobal
  GuerraGlobal -[hidden]r- ParticipacionGuerra
  Entrenamiento -[hidden]d- Desafio
  Desafio -[hidden]r- AceptacionDesafio
  AceptacionDesafio -[hidden]r- Mensaje
  Desafio -[hidden]d- Nodo
  Nodo -[hidden]r- InversionNodo
  InversionNodo -[hidden]r- Cofre
  Cofre -[hidden]r- Item
  Nodo -[hidden]d- Trofeo
  Trofeo -[hidden]r- BeneficioAliado
  BeneficioAliado -[hidden]r- AliadoComercial
}

' ─── Relaciones ───────────────────────────────────────────

Miembro "N" --> "1" Clan : pertenece a
Miembro "1" *-- "1" DatosBiometricos : tiene
Miembro "1" *-- "1" Racha : tiene
Miembro "1" *-- "1" DatosFatiga : tiene
Miembro "1" o-- "*" Trofeo : acumula
Miembro "1" o-- "*" Entrenamiento : registra

Clan "1" o-- "*" Desafio : publica
Clan "1" o-- "*" ParticipacionGuerra : acumula
GuerraGlobal "1" o-- "*" ParticipacionGuerra : registra

Desafio "1" o-- "*" AceptacionDesafio : genera
AceptacionDesafio "N" --> "1" Miembro : pertenece a
Mensaje "N" --> "1" Clan : enviado en
Mensaje "N" --> "1" Miembro : enviado por

InversionNodo "N" --> "1" Miembro : realizada por
InversionNodo "N" --> "1" Nodo : sobre
Nodo "*" --> "*" Nodo : depende de
Cofre "N" --> "1" Miembro : pertenece a

BeneficioAliado "N" --> "1" AliadoComercial : provisto por
BeneficioAliado "N" --> "0..1" Miembro : reclamado por

@enduml
```
