# 10.5.7a — Diagrama de Clases: Capa de Presentación

**Capa:** Presentación (Pages) — proyecto `silverback/` (Next.js 16)  
**Descripción:** Pages de Next.js App Router. Cada clase agrupa los handlers de una sección funcional. Se comunican con la capa de Servicios vía HTTP REST al .NET API (`apiFetch<T>()` desde Server Components, Server Actions para mutaciones). No acceden directamente a servicios ni repositorios.

---

```plantuml
@startuml clases-presentacion
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam defaultFontName Arial
skinparam defaultFontSize 11

skinparam class {
  BackgroundColor #FFFFFF
  BorderColor #7C3AED
  HeaderBackgroundColor #DDD6FE
  FontColor #111111

  BackgroundColor<<service>> #FFFFFF
  BorderColor<<service>> #2E8B57
  HeaderBackgroundColor<<service>> #C3EDCF
  FontColor<<service>> #111111
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

' ─── PRESENTACIÓN ─────────────────────────────────────────

package "Presentación" #F5F0FF {

  class IncorporacionPage <<page>> {
    +onRegistrarBiometricos(datos: DatosBiometricos): void
    +onAsignarArquetipo(arquetipo: Arquetipo): void
    +onBuscarManadas(filtros: Object): void
    +onUnirseAManada(clanId: UUID): void
  }

  class SantuarioPage <<page>> {
    +onCargarDashboard(): void
    +onListarDesafiosPorTier(tier: TierDesafio): void
    +onAceptarDesafio(desafioId: UUID): void
    +onObtenerMensajes(desde: Date): void
    +onEnviarMensaje(contenido: String, tipo: TipoMensaje): void
    +onListarMiembrosClan(): void
    +onActualizarRol(miembroId: UUID, nuevoRol: Rol): void
    +onExpulsarMiembro(miembroId: UUID): void
  }

  class ArenaPage <<page>> {
    +onObtenerGuerraActiva(): void
    +onRegistrarEntrenamiento(datos: Entrenamiento): void
    +onObtenerHistorial(filtros: Object, pagina: Int): void
    +onCalcularCER(pesoKg: Float, reps: Int, arquetipo: Arquetipo): void
  }

  class EvolucionPage <<page>> {
    +onCargarProgreso(): void
    +onObtenerCofresDisponibles(): void
    +onMejorarNodo(nodoId: UUID): void
    +onReclamarCofre(cofreId: UUID): void
    +onObtenerItems(categoria: CategoriaItem): void
    +onComprarItem(itemId: UUID): void
  }

  class PerfilPage <<page>> {
    +onCargarDashboard(): void
    +onConsultarRacha(): void
    +onSalvarRacha(): void
    +onCargarFatiga(): void
    +onCargarTrofeos(): void
    +onCargarBeneficios(): void
    +onReclamarBeneficio(beneficioId: UUID): void
  }

  ' Forzar layout 3 columnas fila 1 + 2 columnas fila 2
  IncorporacionPage -[hidden]r- SantuarioPage
  SantuarioPage -[hidden]r- ArenaPage
  IncorporacionPage -[hidden]d- EvolucionPage
  EvolucionPage -[hidden]r- PerfilPage
}

' ─── SERVICIOS (referencia) ───────────────────────────────

package "Servicios" #EBFBF0 {

  class IncorporacionService <<service>> {
  }
  class SantuarioService <<service>> {
  }
  class ArenaService <<service>> {
  }
  class CERService <<service>> {
  }
  class EvolucionService <<service>> {
  }
  class PerfilService <<service>> {
  }

  IncorporacionService -[hidden]r- SantuarioService
  SantuarioService -[hidden]r- ArenaService
  CERService -[hidden]r- EvolucionService
  EvolucionService -[hidden]r- PerfilService
  IncorporacionService -[hidden]d- CERService
}

' ─── Forzar Pages ARRIBA, Servicios ABAJO ─────────────────

IncorporacionPage -[hidden]d- IncorporacionService
ArenaPage -[hidden]d- CERService

' ─── Dependencias ─────────────────────────────────────────

IncorporacionPage ..> IncorporacionService : usa
SantuarioPage ..> SantuarioService : usa
ArenaPage ..> ArenaService : usa
ArenaPage ..> CERService : usa
EvolucionPage ..> EvolucionService : usa
PerfilPage ..> PerfilService : usa

@enduml
```
