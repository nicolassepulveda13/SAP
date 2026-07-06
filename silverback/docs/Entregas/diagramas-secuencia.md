# SILVERBACK — Diagramas de Secuencia de Diseño

**Sección:** 10.5.4 — Diagramas de Secuencia  
**Entrega:** E2  
**Versión:** 1.0  
**Autor:** Sepulveda, Nicolas

---

## CU-001 — INCORPORACIÓN

---

### CU-001-001 — Registrar Datos Biométricos Iniciales

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as CalibracionBiometricaPage
    participant Svc as IncorporacionService
    participant Repo as MiembroRepository
    participant DB as PostgreSQL

    Miembro ->> Page: ingresaDatos(edad, peso, altura, nivelExperiencia: NivelExperiencia)
    Page ->> Page: validarFormulario(): boolean
    alt campos vacíos o fuera de rango
        Page -->> Miembro: mostrarErroresValidacion(campos: string[])
    else datos válidos
        Page ->> Svc: registrarBiometricos(datos: DatosBiometricos): Promise<Miembro>
        Svc ->> Svc: construirLineaBase(datos: DatosBiometricos): DatosBiometricos
        Svc ->> Repo: crear(datos: DatosBiometricos): Promise<Miembro>
        Repo ->> DB: INSERT INTO miembros (edad, peso, altura, nivel_experiencia)
        alt INSERT falla (error de red o constraint)
            DB -->> Repo: DatabaseError
            Repo -->> Svc: throw RepositoryException(mensaje: string)
            Svc -->> Page: throw ServiceException("Error al guardar datos biométricos")
            Page -->> Miembro: mostrarToastError("No se pudieron guardar tus datos. Intentá de nuevo.")
        else INSERT exitoso
            DB -->> Repo: Miembro (id, datos biométricos)
            Repo -->> Svc: Miembro
            Svc -->> Page: Miembro
            Page ->> Page: avanzarPaso(paso: 2)
            Page -->> Miembro: redirigirA(ArquetipoPage)
        end
    end
```

---

### CU-001-002 — Seleccionar Arquetipo de Entrenamiento

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as ArquetipoPage
    participant Svc as IncorporacionService
    participant Repo as MiembroRepository
    participant DB as PostgreSQL

    Miembro ->> Page: abrirPantalla()
    Page -->> Miembro: mostrarOpciones([VOLUMEN, DEFINIDO, ATLETICO])
    Miembro ->> Page: seleccionarArquetipo(arquetipo: Arquetipo)
    Page ->> Page: resaltarSeleccion(arquetipo: Arquetipo)

    alt arquetipo === VOLUMEN
        Page -->> Miembro: mostrarInfo("Multiplicador CER: 1.15x — El Gorila")
    else arquetipo === DEFINIDO
        Page -->> Miembro: mostrarInfo("Multiplicador CER: 1.10x — La Pantera")
    else arquetipo === ATLETICO
        Page -->> Miembro: mostrarInfo("Multiplicador CER: 1.20x — El Chimpancé")
    end

    Miembro ->> Page: confirmarSeleccion()
    Page ->> Svc: asignarArquetipo(miembroId: string, arquetipo: Arquetipo): Promise<Miembro>
    Svc ->> Svc: calcularMultiplicadorCER(arquetipo: Arquetipo): number
    Svc ->> Repo: actualizarArquetipo(miembroId: string, arquetipo: Arquetipo, multiplicadorCER: number): Promise<Miembro>
    Repo ->> DB: UPDATE miembros SET arquetipo, multiplicador_cer WHERE id = miembroId
    DB -->> Repo: Miembro (actualizado)
    Repo -->> Svc: Miembro
    Svc -->> Page: Miembro
    Page ->> Page: avanzarPaso(paso: 3)
    Page -->> Miembro: redirigirA(RadarManadasPage)
```

---

### CU-001-003 — Buscar Manadas Disponibles

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as RadarManadasPage
    participant Svc as IncorporacionService
    participant Repo as ClanRepository
    participant DB as PostgreSQL

    Miembro ->> Page: abrirPantalla()
    Page ->> Svc: buscarManadas(filtros: FiltrosClan): Promise<Clan[]>
    Svc ->> Repo: listarDisponibles(filtros: FiltrosClan, pagina: number, limite: number): Promise<Clan[]>
    Repo ->> DB: SELECT * FROM clanes WHERE disponible = true AND (nivel, idioma, estilo) MATCH filtros LIMIT limite OFFSET pagina
    DB -->> Repo: Clan[]
    Repo -->> Svc: Clan[]

    alt resultado vacío
        Svc -->> Page: []
        Page -->> Miembro: mostrarEstadoVacio("No hay manadas disponibles con esos filtros. Probá con otros criterios.")
    else hay resultados
        Svc -->> Page: Clan[]
        Page -->> Miembro: renderizarListaPaginada(clanes: Clan[])
        Miembro ->> Page: cambiarFiltros(nuevosFiltros: FiltrosClan)
        Page ->> Svc: buscarManadas(nuevosFiltros: FiltrosClan): Promise<Clan[]>
        Svc ->> Repo: listarDisponibles(nuevosFiltros: FiltrosClan, pagina: number, limite: number): Promise<Clan[]>
        Repo ->> DB: SELECT * FROM clanes WHERE disponible = true AND (...) LIMIT limite OFFSET pagina
        DB -->> Repo: Clan[]
        Repo -->> Svc: Clan[]
        Svc -->> Page: Clan[]
        Page -->> Miembro: renderizarListaPaginada(clanes: Clan[])
    end
```

---

### CU-001-004 — Unirse a una Manada

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as RadarManadasPage
    participant Svc as IncorporacionService
    participant ClanRepo as ClanRepository
    participant MiembroRepo as MiembroRepository
    participant DB as PostgreSQL

    Miembro ->> Page: seleccionarClan(clanId: string)
    Page -->> Miembro: mostrarDetalleClan(clan: Clan)
    Miembro ->> Page: presionarUnirse(clanId: string)
    Page ->> Svc: unirseAManada(miembroId: string, clanId: string): Promise<Clan>
    Svc ->> ClanRepo: verificarDisponibilidad(clanId: string): Promise<boolean>
    ClanRepo ->> DB: SELECT capacidad_actual, capacidad_maxima FROM clanes WHERE id = clanId
    DB -->> ClanRepo: { capacidadActual: number, capacidadMaxima: number }
    ClanRepo -->> Svc: boolean (disponible)

    alt clan lleno (capacidadActual >= capacidadMaxima)
        Svc -->> Page: throw ClanLlenoException("La manada está completa. Buscá otra.")
        Page -->> Miembro: mostrarError("Esta manada ya no tiene cupo disponible.")
    else clan disponible
        Svc ->> MiembroRepo: asignarClan(miembroId: string, clanId: string, rol: Rol.RECLUTA): Promise<Miembro>
        MiembroRepo ->> DB: UPDATE miembros SET clan_id = clanId, rol = 'RECLUTA' WHERE id = miembroId
        DB -->> MiembroRepo: Miembro (actualizado)
        Svc ->> ClanRepo: incrementarContador(clanId: string): Promise<Clan>
        ClanRepo ->> DB: UPDATE clanes SET capacidad_actual = capacidad_actual + 1 WHERE id = clanId
        DB -->> ClanRepo: Clan (actualizado)
        ClanRepo -->> Svc: Clan
        MiembroRepo -->> Svc: Miembro
        Svc -->> Page: Clan
        Page -->> Miembro: redirigirA(SantuarioPage)
    end
```

---

## CU-002 — SANTUARIO

---

### CU-002-001 — Visualizar el Panel del Santuario

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as SantuarioPage
    participant Svc as SantuarioService
    participant ClanRepo as ClanRepository
    participant DesafioRepo as DesafioRepository
    participant GuerraRepo as GuerraRepository
    participant DB as PostgreSQL

    Miembro ->> Page: abrirSantuario()
    Page ->> Svc: cargarDashboard(miembroId: string, clanId: string): Promise<DashboardSantuario>
    Svc ->> Svc: Promise.all([getClan, getDesafios, getGuerra])
    par Carga en paralelo
        Svc ->> ClanRepo: obtenerConMiembros(clanId: string): Promise<Clan>
        ClanRepo ->> DB: SELECT clan, miembros WHERE clan_id = clanId
        DB -->> ClanRepo: Clan (con miembros)
        ClanRepo -->> Svc: Clan
    and
        Svc ->> DesafioRepo: listarActivos(clanId: string): Promise<Desafio[]>
        DesafioRepo ->> DB: SELECT * FROM desafios WHERE clan_id = clanId AND estado = 'ACTIVO'
        DB -->> DesafioRepo: Desafio[]
        DesafioRepo -->> Svc: Desafio[]
    and
        Svc ->> GuerraRepo: obtenerPuntajeActual(clanId: string): Promise<GuerraGlobal>
        GuerraRepo ->> DB: SELECT puntaje, ranking FROM guerras WHERE clan_id = clanId AND activa = true
        DB -->> GuerraRepo: GuerraGlobal
        GuerraRepo -->> Svc: GuerraGlobal
    end
    Svc -->> Page: DashboardSantuario { clan, desafios, guerra }
    Page ->> Page: renderizarSidebar(clan: Clan)
    Page -->> Miembro: mostrarDashboard(DashboardSantuario)
```

---

### CU-002-002 — Consultar Desafíos en La Forja

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as ForjaPage
    participant Svc as SantuarioService
    participant Repo as DesafioRepository
    participant DB as PostgreSQL

    Miembro ->> Page: abrirForja()
    Page ->> Svc: listarDesafiosPorTier(clanId: string, tier: TierDesafio): Promise<Desafio[]>
    Svc ->> Repo: listarPorTier(clanId: string, tier: TierDesafio): Promise<Desafio[]>
    Repo ->> DB: SELECT * FROM desafios WHERE clan_id = clanId AND tier = tier ORDER BY fecha_vencimiento ASC
    DB -->> Repo: Desafio[]
    Repo -->> Svc: Desafio[]
    Svc -->> Page: Desafio[]
    Page -->> Miembro: renderizarListado(desafios: Desafio[], tiersDisponibles: TierDesafio[])

    Miembro ->> Page: filtrarPorTier(nuevoTier: TierDesafio)
    Page ->> Svc: listarDesafiosPorTier(clanId: string, nuevoTier: TierDesafio): Promise<Desafio[]>
    Svc ->> Repo: listarPorTier(clanId: string, nuevoTier: TierDesafio): Promise<Desafio[]>
    Repo ->> DB: SELECT * FROM desafios WHERE clan_id = clanId AND tier = nuevoTier ORDER BY fecha_vencimiento ASC
    DB -->> Repo: Desafio[]
    Repo -->> Svc: Desafio[]
    Svc -->> Page: Desafio[]
    Page -->> Miembro: renderizarListadoFiltrado(desafios: Desafio[], estadosFiltrados: EstadoDesafio[])
```

---

### CU-002-003 — Aceptar un Desafío Semanal

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as ForjaPage
    participant Svc as SantuarioService
    participant Repo as DesafioRepository
    participant DB as PostgreSQL

    Miembro ->> Page: seleccionarDesafio(desafioId: string)
    Page -->> Miembro: mostrarDetalleDesafio(desafio: Desafio)
    Miembro ->> Page: presionarAceptar(desafioId: string)
    Page ->> Svc: aceptarDesafio(miembroId: string, desafioId: string): Promise<AceptacionDesafio>
    Svc ->> Repo: verificarAceptacionExistente(miembroId: string, desafioId: string): Promise<AceptacionDesafio | null>
    Repo ->> DB: SELECT * FROM aceptaciones_desafio WHERE miembro_id = miembroId AND desafio_id = desafioId
    DB -->> Repo: AceptacionDesafio | null

    alt ya fue aceptado previamente
        Repo -->> Svc: AceptacionDesafio (existente)
        Svc -->> Page: throw DesafioYaAceptadoException("Ya aceptaste este desafío.")
        Page -->> Miembro: mostrarEstado("Ya estás participando en este desafío.", estado: EstadoDesafio.ACTIVO)
    else desafío disponible para aceptar
        Repo -->> Svc: null
        Svc ->> Repo: crearAceptacion(miembroId: string, desafioId: string, estado: EstadoDesafio.ACTIVO): Promise<AceptacionDesafio>
        Repo ->> DB: INSERT INTO aceptaciones_desafio (miembro_id, desafio_id, estado, fecha_inicio)
        DB -->> Repo: AceptacionDesafio (creada)
        Repo -->> Svc: AceptacionDesafio
        Svc -->> Page: AceptacionDesafio
        Page -->> Miembro: mostrarConfirmacion("Desafío aceptado. ¡Arriba la manada!")
    end
```

---

### CU-002-004 — Comunicarse en la Sala de Tácticas

```mermaid
sequenceDiagram
    actor Miembro
    participant Page as TacticasPage
    participant Svc as SantuarioService
    participant Repo as MensajeRepository
    participant DB as PostgreSQL
    participant RT as Polling HTTP

    Miembro ->> Page: abrirTacticas(clanId: string)
    Page ->> Repo: listarMensajesRecientes(clanId: string, limite: number): Promise<Mensaje[]>
    Repo ->> DB: SELECT * FROM mensajes WHERE clan_id = clanId ORDER BY created_at DESC LIMIT limite
    DB -->> Repo: Mensaje[]
    Repo -->> Page: Mensaje[]
    Page ->> RT: suscribirCanal(canal: string(`clan-${clanId}`))
    RT -->> Page: suscripcionActiva()
    Page -->> Miembro: renderizarChat(mensajes: Mensaje[])

    Miembro ->> Page: escribirMensaje(contenido: string)
    Page ->> Page: validarMensaje(contenido: string): boolean
    Miembro ->> Page: enviarMensaje()
    Page ->> Svc: enviarMensaje(clanId: string, miembroId: string, contenido: string, tipo: TipoMensaje): Promise<Mensaje>
    Svc ->> Repo: persistir(mensaje: Mensaje): Promise<Mensaje>
    Repo ->> DB: INSERT INTO mensajes (clan_id, miembro_id, contenido, tipo)
    DB -->> Repo: Mensaje (persistido)
    Repo -->> Svc: Mensaje
    Svc -->> Page: Mensaje
    RT -->> Page: onNuevoMensaje(mensaje: Mensaje)
    Page -->> Miembro: agregarMensajeAlChat(mensaje: Mensaje)
```

---

### CU-002-005 — Asignar Rol a un Miembro del Clan

```mermaid
sequenceDiagram
    actor LiderClan
    participant Page as RolesPage
    participant Svc as SantuarioService
    participant Repo as MiembroRepository
    participant DB as PostgreSQL

    LiderClan ->> Page: abrirGestionRoles(clanId: string)
    Page ->> Svc: listarMiembrosClan(clanId: string): Promise<Miembro[]>
    Svc ->> Repo: listarPorClan(clanId: string): Promise<Miembro[]>
    Repo ->> DB: SELECT * FROM miembros WHERE clan_id = clanId ORDER BY rol ASC
    DB -->> Repo: Miembro[]
    Repo -->> Svc: Miembro[]
    Svc -->> Page: Miembro[]
    Page -->> LiderClan: renderizarListaMiembros(miembros: Miembro[])

    LiderClan ->> Page: seleccionarMiembro(miembroId: string)
    Page -->> LiderClan: mostrarSelectorRol(rolesDisponibles: Rol[])
    LiderClan ->> Page: asignarNuevoRol(miembroId: string, nuevoRol: Rol)

    alt LiderClan intenta asignarse a sí mismo
        Page ->> Page: verificarAutoAsignacion(liderClanId: string, miembroId: string): boolean
        Page -->> LiderClan: mostrarError("No podés modificar tu propio rol.")
    else asignación válida
        Page ->> Svc: actualizarRol(miembroId: string, nuevoRol: Rol, liderClanId: string): Promise<Miembro>
        Svc ->> Repo: actualizarRol(miembroId: string, nuevoRol: Rol): Promise<Miembro>
        Repo ->> DB: UPDATE miembros SET rol = nuevoRol WHERE id = miembroId
        DB -->> Repo: Miembro (actualizado)
        Repo -->> Svc: Miembro
        Svc -->> Page: Miembro
        Page -->> LiderClan: mostrarConfirmacion("Rol actualizado correctamente.")
    end
```

---

### CU-002-006 — Expulsar a un Miembro del Clan

```mermaid
sequenceDiagram
    actor LiderClan
    participant Page as RolesPage
    participant Svc as SantuarioService
    participant MiembroRepo as MiembroRepository
    participant ClanRepo as ClanRepository
    participant DB as PostgreSQL

    LiderClan ->> Page: presionarExpulsar(miembroId: string)
    Page ->> Svc: obtenerMiembro(miembroId: string): Promise<Miembro>
    Svc ->> MiembroRepo: obtenerPorId(miembroId: string): Promise<Miembro>
    MiembroRepo ->> DB: SELECT * FROM miembros WHERE id = miembroId
    DB -->> MiembroRepo: Miembro
    MiembroRepo -->> Svc: Miembro
    Svc -->> Page: Miembro

    alt target tiene rol SILVERBACK
        Page ->> Page: verificarRolTarget(miembro: Miembro): boolean
        Page -->> LiderClan: mostrarError("No podés expulsar a otro líder de clan.")
    else target es expulsable
        Page -->> LiderClan: mostrarConfirmacion("¿Seguro que querés expulsar a este miembro?")
        LiderClan ->> Page: confirmarExpulsion()
        Page ->> Svc: expulsarMiembro(miembroId: string, clanId: string, liderClanId: string): Promise<void>
        Svc ->> MiembroRepo: eliminarMembresia(miembroId: string): Promise<void>
        MiembroRepo ->> DB: UPDATE miembros SET clan_id = NULL, rol = NULL WHERE id = miembroId
        DB -->> MiembroRepo: OK
        MiembroRepo -->> Svc: void
        Svc ->> ClanRepo: decrementarContador(clanId: string): Promise<Clan>
        ClanRepo ->> DB: UPDATE clanes SET capacidad_actual = capacidad_actual - 1 WHERE id = clanId
        DB -->> ClanRepo: Clan (actualizado)
        ClanRepo -->> Svc: Clan
        Svc -->> Page: void
        Page -->> LiderClan: mostrarConfirmacion("Miembro expulsado. El clan sigue en pie.")
    end
```
