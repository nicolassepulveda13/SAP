# 10.5.4 — Diagramas de Secuencia: CU-001 INCORPORACIÓN + CU-002 SANTUARIO

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → SQL Server (DB)
**Actores:** Miembro, LiderClan

---

## CU-001 — INCORPORACIÓN

*Flujo lineal de onboarding. El Miembro completa los 4 CUs en secuencia antes de acceder a la app principal. Layout centrado, sin Topbar ni Sidebar.*

---

### CU-001-000 — Crear Cuenta / Iniciar Sesión

> **Agregado S2 (C-25).** Origen: `Modificacion-Carpeta.md`.

```plantuml
@startuml CU-001-000

actor Miembro

box "Presentación" #F5F0FF
  participant "CalibracionBiometricaPage" as Page
end box

box "Server Actions" #FAF5FF
  participant "saveStep1()\n[onboarding.ts]" as Action
end box

box "Infraestructura" #F3F4F6
  participant "Cookie sb_onboarding\n(HTTP-only, 30 min)" as Cookie
end box

== Flujo: Usuario nuevo ==

Miembro -> Page: abrirPantalla()\n[middleware redirige desde / sin token]
Page --> Miembro: mostrarFormulario(nombre, email, password, edad, pesoKg, alturaCm, nivelExperiencia)

Miembro -> Page: completarFormulario(datos)
Miembro -> Page: presionarContinuar()

Page -> Action: saveStep1(formData)
Action -> Action: validarCampos(datos)

alt campos vacíos o fuera de rango
    Action --> Page: { error: "mensaje de validación" }
    Page --> Miembro: mostrarError(mensaje)
else datos válidos
    Action -> Cookie: set("sb_onboarding", JSON.stringify(draft), { httpOnly, maxAge: 1800 })
    Cookie --> Action: ok
    Action --> Page: redirect("/onboarding/archetype")
    Page --> Miembro: redirigirA(ArquetipoPage)
end

note right of Cookie
  Los datos NO se persisten en DB todavía.
  La cuenta se crea en CU-001-004 o CU-001-005
  cuando el usuario elige o funda su clan.
end note

== Flujo: Usuario existente (accede a /login) ==

Miembro -> Page: clickEnlace("¿Ya tenés cuenta? Iniciá sesión")
Page --> Miembro: redirigirA(/login)

actor Miembro2 as "Miembro (login)"
Miembro2 -> LoginPage: ingresarCredenciales(email, password)
LoginPage -> AuthAction: login(formData)

box "API Controller" #ECFEFF
  participant "AuthController" as AuthCtrl
end box

box "Servicios" #EBFBF0
  participant "AuthService" as AuthSvc
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

AuthAction -> AuthCtrl: POST /api/auth/login { email, password }
AuthCtrl -> AuthSvc: Login(email, password)
AuthSvc -> DB: SELECT miembro WHERE email = email
DB --> AuthSvc: Miembro

alt credenciales inválidas
    AuthSvc --> AuthCtrl: throw UnauthorizedException
    AuthCtrl --> AuthAction: 401 Unauthorized
    AuthAction --> LoginPage: { error: "Email o contraseña incorrectos." }
    LoginPage --> Miembro2: mostrarError()
else credenciales válidas
    AuthSvc -> AuthSvc: generarToken(miembro)
    AuthSvc --> AuthCtrl: { token }
    AuthCtrl --> AuthAction: 200 OK { token }
    AuthAction -> Cookie: set("sb_token", token, { httpOnly, sameSite: lax })
    AuthAction --> LoginPage: redirect("/santuario")
    LoginPage --> Miembro2: redirigirA(SantuarioPage)
end

@enduml
```

---

### CU-001-001 — Registrar Datos Biométricos Iniciales

```plantuml
@startuml CU-001-001

actor Miembro

box "Presentación" #F5F0FF
  participant "CalibracionBiometricaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: ingresaDatos(edad, peso, altura, nivelExperiencia)
Page -> Page: validarFormulario(): boolean

alt campos vacíos o fuera de rango
    Page --> Miembro: mostrarErroresValidacion(campos)
else datos válidos
    Page -> Svc: registrarBiometricos(datos: DatosBiometricos): Promise~Miembro~
    Svc -> Svc: construirLineaBase(datos): DatosBiometricos
    Svc -> Repo: crear(datos: DatosBiometricos): Promise~Miembro~
    Repo -> DB: INSERT INTO miembros (edad, peso, altura, nivel_experiencia)

    alt INSERT falla (error de red o constraint)
        DB --> Repo: DatabaseError
        Repo --> Svc: throw RepositoryException
        Svc --> Page: throw ServiceException
        Page --> Miembro: mostrarToastError("No se pudieron guardar tus datos. Intentá de nuevo.")
    else INSERT exitoso
        DB --> Repo: Miembro
        Repo --> Svc: Miembro
        Svc --> Page: Miembro
        Page -> Page: avanzarPaso(2)
        Page --> Miembro: redirigirA(ArquetipoPage)
    end
end

@enduml
```

---

### CU-001-002 — Seleccionar Arquetipo de Entrenamiento

```plantuml
@startuml CU-001-002

actor Miembro

box "Presentación" #F5F0FF
  participant "ArquetipoPage" as Page
end box

box "Servicios" #EBFBF0
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirPantalla()
Page --> Miembro: mostrarOpciones([VOLUMEN, DEFINIDO, ATLETICO])
Miembro -> Page: seleccionarArquetipo(arquetipo: Arquetipo)
Page -> Page: resaltarSeleccion(arquetipo)

alt arquetipo === VOLUMEN
    Page --> Miembro: mostrarInfo("Multiplicador CER: 1.15x — El Gorila")
else arquetipo === DEFINIDO
    Page --> Miembro: mostrarInfo("Multiplicador CER: 1.10x — La Pantera")
else arquetipo === ATLETICO
    Page --> Miembro: mostrarInfo("Multiplicador CER: 1.20x — El Chimpancé")
end

Miembro -> Page: confirmarSeleccion()
Page -> Svc: asignarArquetipo(miembroId: string, arquetipo: Arquetipo): Promise~Miembro~
Svc -> Svc: calcularMultiplicadorCER(arquetipo): number
Svc -> Repo: actualizarArquetipo(miembroId, arquetipo, multiplicadorCER): Promise~Miembro~
Repo -> DB: UPDATE miembros SET arquetipo, multiplicador_cer WHERE id = miembroId
DB --> Repo: Miembro actualizado
Repo --> Svc: Miembro
Svc --> Page: Miembro
Page -> Page: avanzarPaso(3)
Page --> Miembro: redirigirA(RadarManadasPage)

@enduml
```

---

### CU-001-003 — Buscar Manadas Disponibles

```plantuml
@startuml CU-001-003

actor Miembro

box "Presentación" #F5F0FF
  participant "RadarManadasPage" as Page
end box

box "Servicios" #EBFBF0
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "ClanRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirPantalla()
Page -> Svc: buscarManadas(filtros: FiltrosClan): Promise~Clan[]~
Svc -> Repo: listarDisponibles(filtros, pagina, limite): Promise~Clan[]~
Repo -> DB: SELECT * FROM clanes WHERE disponible = true AND filtros LIMIT limite OFFSET pagina
DB --> Repo: Clan[]
Repo --> Svc: Clan[]

alt resultado vacío
    Svc --> Page: []
    Page --> Miembro: mostrarEstadoVacio("No hay manadas con esos filtros. Probá con otros criterios.")
else hay resultados
    Svc --> Page: Clan[]
    Page --> Miembro: renderizarListaPaginada(clanes)

    Miembro -> Page: cambiarFiltros(nuevosFiltros: FiltrosClan)
    Page -> Svc: buscarManadas(nuevosFiltros): Promise~Clan[]~
    Svc -> Repo: listarDisponibles(nuevosFiltros, 1, limite): Promise~Clan[]~
    Repo -> DB: SELECT * FROM clanes WHERE disponible = true AND nuevosFiltros LIMIT limite
    DB --> Repo: Clan[]
    Repo --> Svc: Clan[]
    Svc --> Page: Clan[]
    Page --> Miembro: renderizarListaPaginada(clanes)
end

@enduml
```

---

### CU-001-004 — Unirse a una Manada

```plantuml
@startuml CU-001-004

actor Miembro

box "Presentación" #F5F0FF
  participant "RadarManadasPage" as Page
end box

box "Servicios" #EBFBF0
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "ClanRepository" as ClanRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: seleccionarClan(clanId: string)
Page --> Miembro: mostrarDetalleClan(clan: Clan)
Miembro -> Page: presionarUnirse(clanId)
Page -> Svc: unirseAManada(miembroId: string, clanId: string): Promise~Clan~
Svc -> ClanRepo: verificarDisponibilidad(clanId): Promise~boolean~
ClanRepo -> DB: SELECT capacidad_actual, capacidad_maxima FROM clanes WHERE id = clanId
DB --> ClanRepo: capacidades
ClanRepo --> Svc: disponible: boolean

alt clan lleno
    Svc --> Page: throw ClanLlenoException
    Page --> Miembro: mostrarError("Esta manada ya no tiene cupo disponible.")
else clan disponible
    Svc -> MiembroRepo: asignarClan(miembroId, clanId, rol: Rol.RECLUTA): Promise~Miembro~
    MiembroRepo -> DB: UPDATE miembros SET clan_id = clanId, rol = 'RECLUTA' WHERE id = miembroId
    DB --> MiembroRepo: Miembro actualizado
    MiembroRepo --> Svc: Miembro
    Svc -> ClanRepo: actualizarContadorMiembros(clanId, +1): Promise~Clan~
    ClanRepo -> DB: UPDATE clanes SET capacidad_actual = capacidad_actual + 1 WHERE id = clanId
    DB --> ClanRepo: Clan actualizado
    ClanRepo --> Svc: Clan
    Svc --> Page: Clan
    Page --> Miembro: redirigirA(SantuarioPage)
end

@enduml
```

---

### CU-001-005 — Fundar una Manada

> **Agregado S3 (C-27).** Origen: `Modificacion-Carpeta.md`.

```plantuml
@startuml CU-001-005

actor Miembro

box "Presentación" #F5F0FF
  participant "MatchmakingClient\n(RadarManadasPage)" as Page
end box

box "Server Actions" #FAF5FF
  participant "crearClan()\n[onboarding.ts]" as Action
end box

box "API Controllers" #ECFEFF
  participant "IncorporacionController" as Ctrl
end box

box "Servicios" #EBFBF0
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MRepo
  participant "ClanRepository" as CRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirPantalla()\n[no hay clanes o prefiere liderar]
Page --> Miembro: mostrarListaClanes() + boton "Fundar mi propio clan"

Miembro -> Page: clickExpandir("Fundar mi propio clan")
Page --> Miembro: mostrarFormulario(nombreClan)

Miembro -> Page: ingresarNombreClan(nombre)
Miembro -> Page: presionarFundarClan()

Page -> Action: crearClan(formData)
Action -> Action: validarNombre(nombre): ¿no vacío?

alt nombre vacío
    Action --> Page: { error: "Ingresá un nombre para tu clan." }
    Page --> Miembro: mostrarError()
else nombre válido
    Action -> Action: leerDraft()\n[cookie sb_onboarding]

    alt draft sin arquetipo (sesión expirada)
        Action --> Page: redirect("/onboarding/biometrics")
    else draft completo

        note over Action, Ctrl
          Paso 1: Registrar cuenta (aún sin token en cookie)
        end note

        Action -> Ctrl: POST /api/incorporacion/registrar\n{ nombre, email, password, arquetipo,\n  edad, pesoKg, alturaCm, nivelExperiencia }
        Ctrl -> Svc: Registrar(datos)
        Svc -> MRepo: Crear(miembro)
        MRepo -> DB: INSERT INTO Miembros
        DB --> MRepo: Miembro { Id }
        MRepo --> Svc: Miembro
        Svc -> Svc: generarTokenPreliminar(miembro, RECLUTA, onboarding=false)
        Svc --> Ctrl: { Miembro, tokenPreliminar }
        Ctrl --> Action: 201 Created { id, token: tokenPreliminar }

        note over Action, Ctrl
          Paso 2: Crear clan usando token preliminar
          (no está en cookie todavía — se pasa como Bearer)
        end note

        Action -> Ctrl: POST /api/incorporacion/clan\n{ nombre }\nAuthorization: Bearer tokenPreliminar
        Ctrl -> Svc: CrearClan(nombre, liderClanId)
        Svc -> CRepo: Crear(clan)
        CRepo -> DB: INSERT INTO Clanes
        DB --> CRepo: Clan { Id }
        CRepo --> Svc: Clan
        Svc -> MRepo: ActualizarClan(miembroId, clan.Id)
        MRepo -> DB: UPDATE Miembros SET ClanId
        Svc -> MRepo: ActualizarRol(miembroId, SILVERBACK)
        MRepo -> DB: UPDATE Miembros SET Rol = 'SILVERBACK'
        Svc -> MRepo: CompletarOnboarding(miembroId)
        MRepo -> DB: UPDATE Miembros SET OnboardingCompletado = true
        Svc -> Svc: generarToken(miembroId, SILVERBACK, clanId, onboarding=true)
        Svc --> Ctrl: { Clan, tokenDefinitivo }
        Ctrl --> Action: 201 Created { clanId, nombre, token: tokenDefinitivo }

        note over Action
          Paso 3: Establecer sesión y limpiar draft
        end note

        Action -> Action: setToken(tokenDefinitivo)\n→ cookie sb_token (HTTP-only)
        Action -> Action: deleteCookie("sb_onboarding")
        Action --> Page: redirect("/santuario")
        Page --> Miembro: redirigirA(SantuarioPage)\n[como SILVERBACK, onboarding completo]
    end
end

@enduml
```

---

## CU-002 — SANTUARIO

*Panel principal del clan. Accesible desde el Topbar. Layout completo con Sidebar.*

---

### CU-002-001 — Visualizar el Panel del Santuario

```plantuml
@startuml CU-002-001

actor Miembro

box "Presentación" #F5F0FF
  participant "SantuarioPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "ClanRepository" as ClanRepo
  participant "DesafioRepository" as DesafioRepo
  participant "GuerraRepository" as GuerraRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirSantuario()
Page -> Svc: cargarDashboard(miembroId, clanId): Promise~DashboardSantuario~

group Carga en paralelo
    Svc -> ClanRepo: obtenerConMiembros(clanId): Promise~Clan~
    ClanRepo -> DB: SELECT clan, miembros WHERE clan_id = clanId
    DB --> ClanRepo: Clan con miembros
    ClanRepo --> Svc: Clan
== ==
    Svc -> DesafioRepo: listarActivos(clanId): Promise~Desafio[]~
    DesafioRepo -> DB: SELECT * FROM desafios WHERE clan_id = clanId AND estado = 'ACTIVO'
    DB --> DesafioRepo: Desafio[]
    DesafioRepo --> Svc: Desafio[]
== ==
    Svc -> GuerraRepo: obtenerPuntajeActual(clanId): Promise~GuerraGlobal~
    GuerraRepo -> DB: SELECT puntaje, ranking FROM guerras WHERE clan_id = clanId AND activa = true
    DB --> GuerraRepo: GuerraGlobal
    GuerraRepo --> Svc: GuerraGlobal
end

Svc --> Page: DashboardSantuario
Page -> Page: renderizarSidebar(clan)
Page --> Miembro: mostrarDashboard(DashboardSantuario)

@enduml
```

---

### CU-002-002 — Consultar Desafíos en La Forja

```plantuml
@startuml CU-002-002

actor Miembro

box "Presentación" #F5F0FF
  participant "ForjaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "DesafioRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirForja()
Page -> Svc: listarDesafiosPorTier(clanId, tier: TierDesafio): Promise~Desafio[]~
Svc -> Repo: listarPorTier(clanId, tier): Promise~Desafio[]~
Repo -> DB: SELECT * FROM desafios WHERE clan_id = clanId AND tier = tier ORDER BY fecha_vencimiento ASC
DB --> Repo: Desafio[]
Repo --> Svc: Desafio[]
Svc --> Page: Desafio[]
Page --> Miembro: renderizarListado(desafios, tiersDisponibles)

Miembro -> Page: filtrarPorTier(nuevoTier: TierDesafio)
Page -> Svc: listarDesafiosPorTier(clanId, nuevoTier): Promise~Desafio[]~
Svc -> Repo: listarPorTier(clanId, nuevoTier): Promise~Desafio[]~
Repo -> DB: SELECT * FROM desafios WHERE clan_id = clanId AND tier = nuevoTier ORDER BY fecha_vencimiento ASC
DB --> Repo: Desafio[]
Repo --> Svc: Desafio[]
Svc --> Page: Desafio[]
Page --> Miembro: renderizarListadoFiltrado(desafios)

@enduml
```

---

### CU-002-003 — Aceptar un Desafío Semanal

```plantuml
@startuml CU-002-003

actor Miembro

box "Presentación" #F5F0FF
  participant "ForjaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "DesafioRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: seleccionarDesafio(desafioId: string)
Page --> Miembro: mostrarDetalleDesafio(desafio: Desafio)
Miembro -> Page: presionarAceptar(desafioId)
Page -> Svc: aceptarDesafio(miembroId, desafioId): Promise~AceptacionDesafio~
Svc -> Repo: buscarAceptacion(desafioId, miembroId): Promise~AceptacionDesafio | null~
Repo -> DB: SELECT * FROM aceptaciones_desafio WHERE miembro_id = miembroId AND desafio_id = desafioId
DB --> Repo: AceptacionDesafio | null

alt ya fue aceptado previamente
    Repo --> Svc: AceptacionDesafio existente
    Svc --> Page: throw DesafioYaAceptadoException
    Page --> Miembro: mostrarEstado("Ya estás participando en este desafío.")
else disponible para aceptar
    Repo --> Svc: null
    Svc -> Repo: crearAceptacion(miembroId, desafioId, EstadoDesafio.ACTIVO): Promise~AceptacionDesafio~
    Repo -> DB: INSERT INTO aceptaciones_desafio (miembro_id, desafio_id, estado, fecha_inicio)
    DB --> Repo: AceptacionDesafio creada
    Repo --> Svc: AceptacionDesafio
    Svc --> Page: AceptacionDesafio
    Page --> Miembro: mostrarConfirmacion("¡Desafío aceptado!")
end

@enduml
```

---

### CU-002-004 — Comunicarse en la Sala de Tácticas

```plantuml
@startuml CU-002-004

actor Miembro

box "Presentación" #F5F0FF
  participant "TacticasPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MensajeRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: abrirTacticas(clanId)
Page -> Svc: obtenerMensajes(clanId, limite: 50): Promise~Mensaje[]~
Svc -> Repo: listarPorClan(clanId, limite): Promise~Mensaje[]~
Repo -> DB: SELECT * FROM mensajes WHERE clan_id = clanId ORDER BY timestamp DESC LIMIT 50
DB --> Repo: Mensaje[]
Repo --> Svc: Mensaje[]
Svc --> Page: Mensaje[]
Page --> Miembro: renderizarChat(mensajes)

note over Page: Polling cada 5 segundos para nuevos mensajes
loop Polling activo mientras la pantalla está abierta
    Page -> Svc: obtenerMensajes(clanId, desde: ultimoTimestamp): Promise~Mensaje[]~
    Svc -> Repo: listarPorClan(clanId, desde): Promise~Mensaje[]~
    Repo -> DB: SELECT * FROM mensajes WHERE clan_id = clanId AND timestamp > ultimoTimestamp
    DB --> Repo: Mensaje[] nuevos
    Repo --> Svc: Mensaje[]
    Svc --> Page: Mensaje[] nuevos
    Page --> Miembro: agrega mensajes nuevos al chat
end

Miembro -> Page: escribirMensaje(contenido: string)
Page -> Page: validarMensaje(contenido): boolean
Miembro -> Page: enviarMensaje()
Page -> Svc: enviarMensaje(clanId, miembroId, contenido, TipoMensaje.TEXTO): Promise~Mensaje~
Svc -> Repo: crear(mensaje: Mensaje): Promise~Mensaje~
Repo -> DB: INSERT INTO mensajes (clan_id, miembro_id, contenido, tipo, timestamp)
DB --> Repo: Mensaje persistido
Repo --> Svc: Mensaje
Svc --> Page: Mensaje
Page --> Miembro: agrega el mensaje enviado al chat

@enduml
```

---

### CU-002-005 — Asignar Rol a un Miembro del Clan

```plantuml
@startuml CU-002-005

actor LiderClan

box "Presentación" #F5F0FF
  participant "RolesPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

LiderClan -> Page: abrirGestionRoles(clanId)
Page -> Svc: listarMiembrosClan(clanId): Promise~Miembro[]~
Svc -> Repo: listarPorClan(clanId): Promise~Miembro[]~
Repo -> DB: SELECT * FROM miembros WHERE clan_id = clanId ORDER BY rol ASC
DB --> Repo: Miembro[]
Repo --> Svc: Miembro[]
Svc --> Page: Miembro[]
Page --> LiderClan: renderizarListaMiembros(miembros)

LiderClan -> Page: seleccionarMiembro(miembroId)
Page --> LiderClan: mostrarSelectorRol(rolesDisponibles)
LiderClan -> Page: asignarNuevoRol(miembroId, nuevoRol: Rol)

alt LiderClan intenta asignarse a sí mismo
    Page -> Page: verificarAutoAsignacion(liderClanId, miembroId): boolean
    Page --> LiderClan: mostrarError("No podés modificar tu propio rol.")
else asignación válida
    Page -> Svc: actualizarRol(miembroId, nuevoRol, liderClanId): Promise~Miembro~
    Svc -> Repo: actualizarRol(miembroId, nuevoRol): Promise~Miembro~
    Repo -> DB: UPDATE miembros SET rol = nuevoRol WHERE id = miembroId
    DB --> Repo: Miembro actualizado
    Repo --> Svc: Miembro
    Svc --> Page: Miembro
    Page --> LiderClan: mostrarConfirmacion("Rol actualizado correctamente.")
end

@enduml
```

---

### CU-002-006 — Expulsar a un Miembro del Clan

```plantuml
@startuml CU-002-006

actor LiderClan

box "Presentación" #F5F0FF
  participant "RolesPage" as Page
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MiembroRepo
  participant "ClanRepository" as ClanRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

LiderClan -> Page: presionarExpulsar(miembroId)
Page -> Svc: obtenerMiembro(miembroId): Promise~Miembro~
Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
MiembroRepo -> DB: SELECT * FROM miembros WHERE id = miembroId
DB --> MiembroRepo: Miembro
MiembroRepo --> Svc: Miembro
Svc --> Page: Miembro

alt target tiene rol SILVERBACK
    Page -> Page: verificarRolTarget(miembro): boolean
    Page --> LiderClan: mostrarError("No podés expulsar a otro líder de clan.")
else target es expulsable
    Page --> LiderClan: mostrarModalConfirmacion(miembro.nombre)
    LiderClan -> Page: confirmarExpulsion()
    Page -> Svc: expulsarMiembro(miembroId, clanId, liderClanId): Promise~void~
    Svc -> MiembroRepo: eliminarMembresia(miembroId): Promise~void~
    MiembroRepo -> DB: UPDATE miembros SET clan_id = NULL, rol = NULL WHERE id = miembroId
    DB --> MiembroRepo: OK
    MiembroRepo --> Svc: void
    Svc -> ClanRepo: actualizarContadorMiembros(clanId, -1): Promise~Clan~
    ClanRepo -> DB: UPDATE clanes SET capacidad_actual = capacidad_actual - 1 WHERE id = clanId
    DB --> ClanRepo: Clan actualizado
    ClanRepo --> Svc: Clan
    Svc --> Page: void
    Page --> LiderClan: mostrarConfirmacion("Miembro expulsado.")
end

@enduml
```

---

### CU-002-007 — Publicar Desafío en La Forja

> **Agregado S3 (C-28).** Origen: `Modificacion-Carpeta.md`.

```plantuml
@startuml CU-002-007

actor "Silverback" as Lider

box "Presentación" #F5F0FF
  participant "ForjaClient\n(ChallengeForgePage)" as Page
end box

box "Server Actions" #FAF5FF
  participant "crearDesafio()\n[santuario.ts]" as Action
end box

box "API Controllers" #ECFEFF
  participant "SantuarioController" as Ctrl
end box

box "Servicios" #EBFBF0
  participant "SantuarioService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MRepo
  participant "SantuarioRepository" as SRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Lider -> Page: abrirPantalla(/santuario/forja)
Page --> Lider: mostrarSeccion("Publicar nueva directiva")\n[solo si rol = SILVERBACK]

Lider -> Page: expandirFormulario()
Page --> Lider: mostrarCampos(descripcion, tier, recompensaXp, fechaExpiracion)
Lider -> Page: completarCampos(datos)
Lider -> Page: presionarPublicarDirectiva()

Page -> Action: crearDesafio(formData)
Action -> Action: validarCampos()\n[no vacíos · XP entre 1 y 10.000]

alt campos vacíos o fuera de rango
    Action --> Page: { error: "Completá todos los campos." }
    Page --> Lider: mostrarError()
else datos válidos
    Action -> Ctrl: POST /api/santuario/{clanId}/desafios\n{ descripcion, tier, recompensaXp, fechaExpiracion }\nAuthorization: Bearer sb_token
    Ctrl -> Svc: CrearDesafio(clanId, silverbackId, ...)
    Svc -> MRepo: BuscarPorId(silverbackId)
    MRepo -> DB: SELECT * FROM Miembros WHERE Id = silverbackId
    DB --> MRepo: Miembro
    MRepo --> Svc: Miembro

    alt rol != SILVERBACK
        Svc --> Ctrl: throw UnauthorizedAccessException
        Ctrl --> Action: 403 Forbidden
        Action --> Page: { error: "Error al publicar el desafío." }
        Page --> Lider: mostrarError()
    else rol = SILVERBACK
        Svc -> SRepo: CrearDesafio(desafio [estado = ACTIVO])
        SRepo -> DB: INSERT INTO DesafiosClan
        DB --> SRepo: DesafioClan { Id }
        SRepo --> Svc: DesafioClan
        Svc --> Ctrl: DesafioClan
        Ctrl --> Action: 201 Created
        Action -> Action: revalidatePath("/santuario/forja")
        Action --> Page: {}
        Page --> Lider: refrescarListaDirectivas()\n[nuevo desafío visible para todo el clan]
    end
end

@enduml
```

---
