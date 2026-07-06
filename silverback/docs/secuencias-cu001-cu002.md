# 10.5.4 — Diagramas de Secuencia: CU-001 INCORPORACIÓN + CU-002 SANTUARIO

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → PostgreSQL (DB)
**Actores:** Miembro, LiderClan

---

## CU-001 — INCORPORACIÓN

*Flujo lineal de onboarding. El Miembro completa los 4 CUs en secuencia antes de acceder a la app principal. Layout centrado, sin Topbar ni Sidebar.*

---

### CU-001-001 — Registrar Datos Biométricos Iniciales

```plantuml
@startuml CU-001-001

actor Miembro

box "Presentación" #1C1C2E
  participant "CalibracionBiometricaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "ArquetipoPage" as Page
end box

box "Servicios" #1C2E1C
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "RadarManadasPage" as Page
end box

box "Servicios" #1C2E1C
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "ClanRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "RadarManadasPage" as Page
end box

box "Servicios" #1C2E1C
  participant "IncorporacionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "ClanRepository" as ClanRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

## CU-002 — SANTUARIO

*Panel principal del clan. Accesible desde el Topbar. Layout completo con Sidebar.*

---

### CU-002-001 — Visualizar el Panel del Santuario

```plantuml
@startuml CU-002-001

actor Miembro

box "Presentación" #1C1C2E
  participant "SantuarioPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "ClanRepository" as ClanRepo
  participant "DesafioRepository" as DesafioRepo
  participant "GuerraRepository" as GuerraRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "ForjaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "DesafioRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "ForjaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "DesafioRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "TacticasPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MensajeRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "RolesPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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

box "Presentación" #1C1C2E
  participant "RolesPage" as Page
end box

box "Servicios" #1C2E1C
  participant "SantuarioService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as MiembroRepo
  participant "ClanRepository" as ClanRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
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
