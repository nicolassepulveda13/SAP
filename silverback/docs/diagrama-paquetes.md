# 10.5.5 — Diagrama de Paquetes

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama de paquetes UML  
**Descripción:** Organización en paquetes funcionales distribuidos en dos servidores. El frontend (Next.js) se comunica con el backend (ASP.NET Core) vía HTTP REST con JWT. Las dependencias fluyen hacia abajo dentro de cada servidor.

> **Cambio arquitectónico (S1):** Se migró de Next.js full-stack a Clean Architecture con dos proyectos separados. Los paquetes de presentación viven en `silverback/` (Next.js 16); los paquetes de servicios, repositorios y dominio viven en `silverback-api/` (ASP.NET Core 9 — 4 proyectos: Domain, Data, Services, Api).

---

```plantuml
@startuml package-diagram
allowmixing
skinparam packageStyle rectangle

node "silverback/\n(Next.js 16 — Puerto 3000)" as NEXTJS {

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
}

node "silverback-api/\n(ASP.NET Core 9 — Puerto 5057)" as DOTNET {

  package "PKG_API\nSilverbackApi.Api\n(Controllers)" as PAPI {
    class AuthController
    class IncorporacionController
    class ArenaController
    class PerfilController
    class EvolucionController
    class SantuarioController
  }

  package "PKG_SERVICIOS\nSilverbackApi.Services" as PSVC {
    class IncorporacionService
    class SantuarioService
    class ArenaService
    class CERService
    class EvolucionService
    class PerfilService
  }

  package "PKG_REPOSITORIOS\nSilverbackApi.Data\n(EF Core + Repositories)" as PREP {
    class MiembroRepository
    class ClanRepository
    class EntrenamientoRepository
    class GuerraRepository
    class RachaRepository
    class FatigaRepository
    class TrofeoRepository
    class BeneficioRepository
    class AdminHistorialRepository
  }

  package "PKG_DOMINIO\nSilverbackApi.Domain\n(Entities y Enums)" as PDOM {
    class Miembro
    class Clan
    class Entrenamiento
    class GuerraGlobal
    class Racha
    class DatosBiometricos
    class DatosFatiga
  }

  package "PKG_INFRAESTRUCTURA\nBase de Datos" as PINF {
    database "SQL Server\n(NICO-DESKTOP\\SQLEXPRESS)"
  }
}

PINC ..> PAPI : HTTP REST\nBearer JWT
PSAN ..> PAPI : HTTP REST\nBearer JWT
PARE ..> PAPI : HTTP REST\nBearer JWT
PEVO ..> PAPI : HTTP REST\nBearer JWT
PPER ..> PAPI : HTTP REST\nBearer JWT

PAPI ..> PSVC : inyección DI
PSVC ..> PREP : inyección DI
PSVC ..> PDOM : modela
PREP ..> PINF : EF Core

@enduml
```
