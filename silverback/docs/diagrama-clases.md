# 10.5.7 — Diagrama de Clases

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama de clases UML — Arquitectura en capas  
**Descripción:** Métodos 100% derivados de los diagramas de secuencia. Cada clase pertenece a su capa explícita.

---

## Enumeraciones del Dominio

| Enum | Valores |
|------|---------|
| `Arquetipo` | VOLUMEN · DEFINIDO · ATLETICO |
| `Rol` | SILVERBACK · BETA · EXPLORADOR · RECLUTA |
| `Rango` | BRONCE · PLATA · ORO · RANGO_S |
| `NivelExperiencia` | PRINCIPIANTE · INTERMEDIO · AVANZADO · ELITE |
| `EstadoRacha` | ACTIVA · EN_RIESGO · ROTA |
| `EstadoFatiga` | OPTIMA · MODERADA · ELEVADA · CRITICA |
| `TierDesafio` | BRONCE · PLATA · ORO |
| `EstadoDesafio` | PENDIENTE · ACTIVO · COMPLETADO · EXPIRADO |
| `TipoMensaje` | TEXTO · SISTEMA · DESAFIO |
| `EstadoNodo` | BLOQUEADO · DISPONIBLE · DESBLOQUEADO |
| `RarezaCofre` | COMUN · RARO · EPICO · LEGENDARIO |
| `EstadoCofre` | DISPONIBLE · RECLAMADO |
| `CategoriaItem` | SKIN · HABITAT · ACCESORIO · AURA |
| `TipoTrofeo` | RACHA · CER · CLAN · EVENTO |
| `TipoBeneficio` | CODIGO · REDIRECCION · CUPON · SUSCRIPCION |
| `EstadoBeneficio` | DISPONIBLE · RECLAMADO · EXPIRADO |

---

## Diagrama

```plantuml
@startuml class-diagram
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle

' ═══════════════════════════════════════════════════════════
' CAPA DE DOMINIO
' ═══════════════════════════════════════════════════════════

package "Dominio" #1C1C2E {

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
  class ParticipacionGuerra {
    +UUID guerraId
    +UUID clanId
    +Float puntajeCER
  }
}

' ═══════════════════════════════════════════════════════════
' CAPA DE REPOSITORIOS
' ═══════════════════════════════════════════════════════════

package "Repositorios" #2E1C10 {

  class MiembroRepository <<repository>> {
    +crear(datos: DatosBiometricos): Miembro
    +buscarPorId(id: UUID): Miembro
    +listarPorClan(clanId: UUID): Miembro[]
    +asignarClan(miembroId: UUID, clanId: UUID, rol: Rol): Miembro
    +actualizarArquetipo(miembroId: UUID, arquetipo: Arquetipo, multiplicadorCER: Float): Miembro
    +actualizarRol(miembroId: UUID, rol: Rol): Miembro
    +actualizarXP(miembroId: UUID, xp: Int): Miembro
    +actualizarCoins(miembroId: UUID, delta: Int): Miembro
    +actualizar(miembroId: UUID, datos: Object): void
    +eliminarMembresia(miembroId: UUID): void
  }
  class ClanRepository <<repository>> {
    +listarDisponibles(filtros: Object, pagina: Int, limite: Int): Clan[]
    +buscarPorId(id: UUID): Clan
    +obtenerConMiembros(id: UUID): Clan
    +verificarDisponibilidad(id: UUID): boolean
    +actualizarContadorMiembros(id: UUID, delta: Int): Clan
    +descontarPuntos(id: UUID, puntos: Int): void
  }
  class EntrenamientoRepository <<repository>> {
    +crear(entrenamiento: Entrenamiento): Entrenamiento
    +listar(miembroId: UUID, filtros: Object, pagina: Int): Entrenamiento[]
    +obtenerEstadisticas(miembroId: UUID): Object
  }
  class GuerraRepository <<repository>> {
    +findGuerraActiva(): GuerraGlobal
    +findRankingClanes(guerraId: UUID, top: Int): Clan[]
    +obtenerPuntajeActual(clanId: UUID): GuerraGlobal
  }
  class DesafioRepository <<repository>> {
    +listarActivos(clanId: UUID): Desafio[]
    +listarPorTier(clanId: UUID, tier: TierDesafio): Desafio[]
    +buscarAceptacion(desafioId: UUID, miembroId: UUID): AceptacionDesafio
    +crearAceptacion(miembroId: UUID, desafioId: UUID, estado: EstadoDesafio): AceptacionDesafio
  }
  class MensajeRepository <<repository>> {
    +crear(mensaje: Mensaje): Mensaje
    +listarPorClan(clanId: UUID, desde: Date): Mensaje[]
  }
  class RachaRepository <<repository>> {
    +obtenerPorMiembro(miembroId: UUID): Racha
    +actualizar(miembroId: UUID, datos: Object): Racha
    +restaurar(miembroId: UUID): Racha
  }
  class SkillTreeRepository <<repository>> {
    +obtenerArbol(miembroId: UUID): Nodo[]
    +crearInversion(inversion: InversionNodo): InversionNodo
  }
  class CofreRepository <<repository>> {
    +listarDisponibles(miembroId: UUID): Cofre[]
    +marcarReclamado(cofreId: UUID): void
  }
  class MarketplaceRepository <<repository>> {
    +listar(categoria: CategoriaItem): Item[]
    +buscarItem(itemId: UUID): Item
    +registrarCompra(miembroId: UUID, itemId: UUID): void
  }
  class TrofeoRepository <<repository>> {
    +listarPorMiembro(miembroId: UUID): Trofeo[]
    +obtenerProgreso(miembroId: UUID): Object
  }
  class BeneficioRepository <<repository>> {
    +listarElegibles(miembroId: UUID, rango: Rango): BeneficioAliado[]
    +registrarReclamo(beneficioId: UUID, miembroId: UUID): void
    +actualizarEstado(beneficioId: UUID, datos: Object): void
  }
  class FatigaRepository <<repository>> {
    +obtenerPorMiembro(miembroId: UUID): DatosFatiga
  }
  class AdminHistorialRepository <<repository>> {
    +registrar(evento: String): void
  }
}

' ═══════════════════════════════════════════════════════════
' CAPA DE SERVICIOS
' ═══════════════════════════════════════════════════════════

package "Servicios" #1C2E1C {

  class IncorporacionService <<service>> {
    +registrarBiometricos(datos: DatosBiometricos): Miembro
    +asignarArquetipo(miembroId: UUID, arquetipo: Arquetipo): Miembro
    +buscarManadas(filtros: Object): Clan[]
    +unirseAManada(miembroId: UUID, clanId: UUID): Clan
    -construirLineaBase(datos: DatosBiometricos): DatosBiometricos
    -calcularMultiplicadorCER(arquetipo: Arquetipo): Float
  }
  class SantuarioService <<service>> {
    +cargarDashboard(miembroId: UUID, clanId: UUID): Object
    +listarDesafiosPorTier(clanId: UUID, tier: TierDesafio): Desafio[]
    +aceptarDesafio(miembroId: UUID, desafioId: UUID): AceptacionDesafio
    +obtenerMensajes(clanId: UUID, desde: Date): Mensaje[]
    +enviarMensaje(clanId: UUID, miembroId: UUID, contenido: String, tipo: TipoMensaje): Mensaje
    +listarMiembrosClan(clanId: UUID): Miembro[]
    +actualizarRol(miembroId: UUID, nuevoRol: Rol, liderClanId: UUID): Miembro
    +obtenerMiembro(miembroId: UUID): Miembro
    +expulsarMiembro(miembroId: UUID, clanId: UUID, liderClanId: UUID): void
  }
  class ArenaService <<service>> {
    +obtenerGuerraActiva(): GuerraGlobal
    +registrarEntrenamiento(datos: Entrenamiento): ResultadoCER
    +obtenerHistorial(miembroId: UUID, filtros: Object, pagina: Int): Entrenamiento[]
  }
  class CERService <<service>> {
    +calcular(pesoKg: Float, reps: Int, arquetipo: Arquetipo): ResultadoCER
    +obtenerMultiplicador(arquetipo: Arquetipo): Float
    -calcularPuntaje(pesoKg: Float, reps: Int, multiplicador: Float): Float
  }
  class EvolucionService <<service>> {
    +cargarProgreso(miembroId: UUID): Object
    +obtenerCofresDisponibles(miembroId: UUID): Cofre[]
    +mejorarNodo(nodoId: UUID, miembroId: UUID): Object
    +reclamarCofre(cofreId: UUID, miembroId: UUID): Object
    +obtenerItems(categoria: CategoriaItem): Item[]
    +comprarItem(itemId: UUID, miembroId: UUID): Object
    -determinarLoot(rareza: RarezaCofre): Item
    -calcularXPParaSiguienteRango(rango: Rango, xpActual: Int): Int
  }
  class PerfilService <<service>> {
    +cargarDashboard(miembroId: UUID): Object
    +consultarRacha(miembroId: UUID): Racha
    +salvarRacha(miembroId: UUID, clanId: UUID): void
    +cargarFatiga(miembroId: UUID): DatosFatiga
    +cargarTrofeos(miembroId: UUID): Trofeo[]
    +cargarBeneficios(miembroId: UUID): BeneficioAliado[]
    +reclamarBeneficio(beneficioId: UUID, miembroId: UUID): Object
    -construirDashboard(miembro: Miembro, entrenamientos: Entrenamiento[], racha: Racha): Object
    -evaluarFatiga(datos: DatosFatiga, cargaSemanal: Float): EstadoFatiga
    -calcularProgresoHaciaProximo(miembroId: UUID, proximo: Trofeo): Float
    -generarCupon(beneficioId: UUID, miembroId: UUID): String
  }
}

' ═══════════════════════════════════════════════════════════
' RELACIONES ENTRE ENTIDADES
' ═══════════════════════════════════════════════════════════

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

' ═══════════════════════════════════════════════════════════
' DEPENDENCIAS: SERVICIOS → REPOSITORIOS
' ═══════════════════════════════════════════════════════════

IncorporacionService ..> MiembroRepository : usa
IncorporacionService ..> ClanRepository : usa

SantuarioService ..> ClanRepository : usa
SantuarioService ..> DesafioRepository : usa
SantuarioService ..> MensajeRepository : usa
SantuarioService ..> MiembroRepository : usa

ArenaService ..> EntrenamientoRepository : usa
ArenaService ..> GuerraRepository : usa
ArenaService ..> RachaRepository : usa
ArenaService ..> MiembroRepository : usa
ArenaService ..> AdminHistorialRepository : usa
ArenaService ..> CERService : compone

EvolucionService ..> SkillTreeRepository : usa
EvolucionService ..> CofreRepository : usa
EvolucionService ..> MarketplaceRepository : usa
EvolucionService ..> MiembroRepository : usa

PerfilService ..> MiembroRepository : usa
PerfilService ..> RachaRepository : usa
PerfilService ..> FatigaRepository : usa
PerfilService ..> TrofeoRepository : usa
PerfilService ..> BeneficioRepository : usa
PerfilService ..> EntrenamientoRepository : usa
PerfilService ..> ClanRepository : usa

@enduml
```
