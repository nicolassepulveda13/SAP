# 10.5.5 — Diagrama de Paquetes

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama de paquetes UML  
**Descripción:** Organización en paquetes funcionales. Las dependencias fluyen hacia abajo: Pages → Services → Repositories → Infraestructura.

---

```plantuml
@startuml package-diagram
allowmixing
skinparam packageStyle rectangle

package "PKG_INCORPORACION" as PINC {
  class CalibracionBiometricaPage
  class ArquetipoPage
  class RadarManadasPage
}

package "PKG_SANTUARIO" as PSAN {
  class SantuarioPage
  class ForjaPage
  class TacticasPage
  class RolesPage
}

package "PKG_ARENA" as PARE {
  class GuerraGlobalPage
  class RegistrarEntrenamientoPage
  class CalculadoraCERPage
  class HistorialBatallasPage
}

package "PKG_EVOLUCION" as PEVO {
  class EvolucionPage
  class SkillTreePage
  class BovedaPage
  class MarketplacePage
}

package "PKG_PERFIL" as PPER {
  class PerfilPage
  class RachaPage
  class FatigaPage
  class TrofeosPage
  class BeneficiosPage
}

package "PKG_SERVICIOS\nServices Layer" as PSVC {
  class IncorporacionService
  class SantuarioService
  class ArenaService
  class CERService
  class EvolucionService
  class PerfilService
}

package "PKG_REPOSITORIOS\nRepositories Layer" as PREP {
  class MiembroRepository
  class ClanRepository
  class EntrenamientoRepository
  class GuerraRepository
  class DesafioRepository
  class MensajeRepository
  class RachaRepository
  class SkillTreeRepository
  class CofreRepository
  class MarketplaceRepository
  class TrofeoRepository
  class BeneficioRepository
  class FatigaRepository
  class AdminHistorialRepository
}

package "PKG_INFRAESTRUCTURA\nBase de Datos" as PINF {
  database PostgreSQL
  class AuthSession
  class StorageFiles
}

package "PKG_DOMINIO\nEntities y Enums" as PDOM {
  class Miembro
  class Clan
  class Entrenamiento
  class GuerraGlobal
  class Desafio
  class AceptacionDesafio
  class Mensaje
  class Racha
  class Nodo
  class InversionNodo
  class Cofre
  class Item
  class Trofeo
  class BeneficioAliado
  class AliadoComercial
  class DatosBiometricos
  class DatosFatiga
  class ResultadoCER
}

PINC ..> PSVC : usa
PSAN ..> PSVC : usa
PARE ..> PSVC : usa
PEVO ..> PSVC : usa
PPER ..> PSVC : usa
PSVC ..> PREP : accede
PSVC ..> PDOM : modela
PREP ..> PINF : persiste en

@enduml
```
