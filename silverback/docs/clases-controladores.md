# 10.5.7e — Diagrama de Clases: Capa de Controladores

> **Actualizado 06/10:** arquitectura documentada en **5 capas** (se incorpora Controladores — `SilverbackApi.Api`). Las clases y atributos se alinean con el código: `DesafioClan` y `MensajeClan` (antes `Desafio`/`Mensaje`), `AuthService` y `GuerraService`. Detalle en `Modificacion-Carpeta.md`.

**Capa:** Controladores — SilverbackApi.Api  
**Descripción:** Punto de entrada HTTP de la API. Cada controller expone los endpoints REST de una sección funcional, valida la autenticación (JWT Bearer, `[Authorize]`), obtiene el `miembroId` del token (`SilverbackControllerBase`) y delega en el servicio correspondiente, recibido por inyección de dependencias. No contienen lógica de negocio ni acceden a repositorios. Los servicios se muestran como referencia (detalle en 10.5.7d).

> **Render:** exportar en **SVG** (vectorial, sin límite de tamaño). En PNG, PlantUML recorta a 4096 px (`PLANTUML_LIMIT_SIZE`).

---

```plantuml
@startuml clases-controladores
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam defaultFontName Arial
skinparam defaultFontSize 11
skinparam nodesep 30
skinparam ranksep 70
hide empty members

skinparam class {
  BackgroundColor #FFFFFF
  FontColor #111111
  BorderColor<<controller>> #0E7490
  HeaderBackgroundColor<<controller>> #CFFAFE
  BorderColor<<service>> #2E8B57
  HeaderBackgroundColor<<service>> #C3EDCF
  BorderColor #3B82F6
  HeaderBackgroundColor #DBEAFE
}
skinparam arrow {
  Color #555555
  FontColor #333333
  FontSize 10
}
skinparam package {
  BorderThickness 2
  FontStyle bold
  FontSize 12
}
package "Controladores — SilverbackApi.Api" #ECFEFF {
  abstract class SilverbackControllerBase <<controller>> {
    #obtenerMiembroId(): UUID
  }
  class AuthController <<controller>> {
    +login(req: LoginRequest): IActionResult
  }
  class IncorporacionController <<controller>> {
    +clanesDisponibles(): IActionResult
    +registrar(req: RegistrarRequest): IActionResult
    +crearClan(req: CrearClanRequest): IActionResult
    +unirseAClan(req: UnirseRequest): IActionResult
  }
  class SantuarioController <<controller>> {
    +obtenerClan(clanId: UUID): IActionResult
    +listarMiembros(clanId: UUID): IActionResult
    +obtenerPanel(clanId: UUID): IActionResult
    +listarDesafios(clanId: UUID): IActionResult
    +aceptarDesafio(clanId: UUID, desafioId: UUID): IActionResult
    +crearDesafio(clanId: UUID, req: CrearDesafioRequest): IActionResult
    +listarMensajes(clanId: UUID): IActionResult
    +enviarMensaje(clanId: UUID, req: EnviarMensajeRequest): IActionResult
    +asignarRol(clanId: UUID, miembroId: UUID, req: AsignarRolRequest): IActionResult
    +expulsarMiembro(clanId: UUID, miembroId: UUID): IActionResult
  }
  class ArenaController <<controller>> {
    +obtenerGuerra(): IActionResult
    +obtenerBatallas(): IActionResult
    +entrenar(req: EntrenamientoRequest): IActionResult
    +obtenerHistorial(pagina: Int, ejercicio: String): IActionResult
  }
  class EvolucionController <<controller>> {
    +obtenerProgreso(): IActionResult
    +obtenerCofres(): IActionResult
    +reclamarCofre(cofreId: UUID): IActionResult
    +obtenerItems(categoria: String): IActionResult
    +comprarItem(req: ComprarItemRequest): IActionResult
    +mejorarNodo(req: MejorarNodoRequest): IActionResult
  }
  class PerfilController <<controller>> {
    +dashboard(): IActionResult
    +consultarRacha(): IActionResult
    +salvarRacha(req: SalvarRachaRequest): IActionResult
    +obtenerFatiga(): IActionResult
    +obtenerTrofeos(): IActionResult
    +obtenerBeneficios(): IActionResult
    +reclamarBeneficio(req: ReclamarBeneficioRequest): IActionResult
  }

  SilverbackControllerBase <|-- IncorporacionController
  SilverbackControllerBase <|-- SantuarioController
  SilverbackControllerBase <|-- ArenaController
  SilverbackControllerBase <|-- EvolucionController
  SilverbackControllerBase <|-- PerfilController
}

package "Servicios — SilverbackApi.Services" #EBFBF0 {
  class AuthService <<service>>
  class IncorporacionService <<service>>
  class SantuarioService <<service>>
  class ArenaService <<service>>
  class CERService <<service>>
  class GuerraService <<service>>
  class EvolucionService <<service>>
  class PerfilService <<service>>

  ' Dos filas para que la capa no quede demasiado ancha
  AuthService -[hidden]d- CERService
  IncorporacionService -[hidden]d- GuerraService
  SantuarioService -[hidden]d- EvolucionService
  ArenaService -[hidden]d- PerfilService
}

AuthController ..> AuthService : DI
IncorporacionController ..> IncorporacionService : DI
SantuarioController ..> SantuarioService : DI
ArenaController ..> ArenaService : DI
ArenaController ..> GuerraService : DI
EvolucionController ..> EvolucionService : DI
PerfilController ..> PerfilService : DI
@enduml
```

---

## Endpoints expuestos

| Controller | Ruta base | Auth | Método → Endpoint |
|---|---|---|---|
| `AuthController` | `/api/auth` | Pública | `login` → `POST /login` |
| `IncorporacionController` | `/api/incorporacion` | Pública (salvo `unirse`) | `clanesDisponibles` → `GET /clanes` · `registrar` → `POST /registrar` · `crearClan` → `POST /clan` · `unirseAClan` → `POST /unirse` 🔒 |
| `SantuarioController` | `/api/santuario` | JWT | `obtenerClan` → `GET /{clanId}` · `listarMiembros` → `GET /{clanId}/miembros` · `obtenerPanel` → `GET /{clanId}/panel` · `listarDesafios` → `GET /{clanId}/desafios` · `aceptarDesafio` → `POST /{clanId}/desafios/{desafioId}/aceptar` · `crearDesafio` → `POST /{clanId}/desafios` · `listarMensajes` → `GET /{clanId}/mensajes` · `enviarMensaje` → `POST /{clanId}/mensajes` · `asignarRol` → `PUT /{clanId}/miembros/{miembroId}/rol` · `expulsarMiembro` → `DELETE /{clanId}/miembros/{miembroId}` |
| `ArenaController` | `/api/arena` | JWT | `obtenerGuerra` → `GET /guerra` · `obtenerBatallas` → `GET /batallas` · `entrenar` → `POST /entrenar` · `obtenerHistorial` → `GET /historial` |
| `EvolucionController` | `/api/evolucion` | JWT | `obtenerProgreso` → `GET /progreso` · `obtenerCofres` → `GET /cofres` · `reclamarCofre` → `POST /cofres/{cofreId}/reclamar` · `obtenerItems` → `GET /items` · `comprarItem` → `POST /items/comprar` · `mejorarNodo` → `POST /nodos/mejorar` |
| `PerfilController` | `/api/perfil` | JWT | `dashboard` → `GET /dashboard` · `consultarRacha` → `GET /racha` · `salvarRacha` → `POST /racha/salvar` · `obtenerFatiga` → `GET /fatiga` · `obtenerTrofeos` → `GET /trofeos` · `obtenerBeneficios` → `GET /beneficios` · `reclamarBeneficio` → `POST /beneficios/reclamar` |
