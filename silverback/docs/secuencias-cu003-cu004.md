# 10.5.4 — Diagramas de Secuencia: CU-003 ARENA + CU-004 EVOLUCIÓN/BÓVEDA

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → SQL Server (DB)
**Nota CER:** `puntajeCER = pesoKg × repeticiones × multiplicadorArquetipo`

---

## CU-003 — ARENA

---

### CU-003-001 — Consultar el Estado de la Guerra Global

> **Modificado S6:** ciclo semanal real. La guerra de la semana se abre sola y la anterior se cierra al vencer (sin procesos programados). El rival es la pareja consecutiva del ranking (1º vs 2º, 3º vs 4º…).

```plantuml
@startuml CU-003-001

actor Miembro

box "Presentación" #F5F0FF
  participant "GuerraGlobalPage" as Page
end box

box "Server Actions" #FAF5FF
  participant "getGuerra()\n[arena.ts]" as Action
end box

box "API Controllers" #ECFEFF
  participant "ArenaController" as Ctrl
end box

box "Servicios" #EBFBF0
  participant "ArenaService" as Arena
  participant "GuerraService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MRepo
  participant "GuerraRepository" as Repo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a La Arena
Page -> Action: getGuerra()
Action -> Ctrl: GET /api/arena/guerra\nAuthorization: Bearer sb_token
Ctrl -> Arena: ObtenerClanId(miembroId)
Arena -> MRepo: BuscarPorId(miembroId)
MRepo -> DB: SELECT * FROM Miembros WHERE Id = miembroId
DB --> MRepo: Miembro
Arena --> Ctrl: clanId (desde la base, no del JWT)

Ctrl -> Svc: ObtenerEstado(clanId)
Svc -> Svc: AsegurarGuerraActiva()

group Cierre de guerras vencidas
    Svc -> Repo: ListarActivasVencidas(ahoraUtc)
    Repo -> DB: SELECT * FROM GuerrasGlobales\nWHERE Estado = 'ACTIVA' AND FechaFin <= ahora
    DB --> Repo: GuerraGlobal[]
    loop por cada guerra vencida
        Svc -> Repo: Finalizar(guerraId)
        Repo -> DB: UPDATE ParticipacionesGuerra SET Posicion = 1..N\n(orden: CER desc, nombre de clan)
        Repo -> DB: UPDATE GuerrasGlobales SET Estado = 'FINALIZADA'
    end
end

Svc -> Svc: SemanaDe(ahora) → clave "2026-S41",\nfin = próximo lunes 00:00 (hora Argentina)
Svc -> Repo: BuscarPorSemana(clave)
Repo -> DB: SELECT * FROM GuerrasGlobales WHERE Semana = clave
DB --> Repo: GuerraGlobal | null

alt no existe la guerra de la semana
    Svc -> Repo: Crear(GuerraGlobal { Semana, ACTIVA, FechaFin })
    Repo -> DB: INSERT INTO GuerrasGlobales
    alt otra request la creó en paralelo (índice único en Semana)
        DB --> Repo: error de clave duplicada
        Svc -> Repo: BuscarPorSemana(clave)
    end
end

Svc -> Repo: Ranking(guerraId)
Repo -> DB: SELECT p.ClanId, c.Nombre, p.CerAcumulado\nFROM ParticipacionesGuerra p JOIN Clanes c\nORDER BY CerAcumulado DESC, Nombre
DB --> Repo: PosicionGuerra[]
Svc -> Svc: nuestro = posición del clan\nrival = pareja (impar → +1, par → −1)\nprogreso = CER / CER del líder

Svc --> Ctrl: EstadoGuerraDto { semana, diasRestantes, nuestro, rival, top 10 }
Ctrl --> Action: 200 OK
Action --> Page: GuerraDto

alt el clan ya sumó CER esta semana
    Page --> Miembro: NUESTRA MANADA vs CLAN RIVAL + barras + top 10 + cuenta regresiva
else el clan todavía no participa
    Page --> Miembro: "Registrá un entrenamiento para entrar a la guerra" (FA-1)
end
alt sin pareja (cantidad impar de clanes)
    Page --> Miembro: tarjeta rival "SIN RIVAL ASIGNADO" (FA-1)
end

@enduml
```

---

### CU-003-002 — Registrar un Entrenamiento

> **Modificado S6:** la entrada por voz muestra lo que entendió y pide confirmación antes de completar los campos. El CER se acredita a la guerra de la semana con un incremento atómico y se suma XP al miembro (1 XP cada 10 de CER).
>
> **Actualizado 17/11:** la API valida los rangos (peso 0–500 kg, 1–200 reps) aunque el front ya valide, la racha se cuenta en hora Argentina, y al final se otorgan las recompensas del entrenamiento (`RecompensasService.alEntrenar`: Llave de Acero cada 5 sesiones, hitos con trofeo y cofre, subida de rango) y se registra el evento en el historial.

```plantuml
@startuml CU-003-002

actor Miembro

box "Presentación" #F5F0FF
  participant "RegistrarClient" as Page
end box

box "Externo" #FEFCE8
  participant "Web Speech API\n(navegador)" as Voice
end box

box "Server Actions" #FAF5FF
  participant "registrarEntrenamiento()\n[arena.ts]" as Action
end box

box "API Controllers" #ECFEFF
  participant "ArenaController" as Ctrl
end box

box "Servicios" #EBFBF0
  participant "ArenaService" as Svc
  participant "CerService" as CER
  participant "GuerraService" as GSvc
  participant "RecompensasService" as Rec
end box

box "Repositorios" #FFF3EB
  participant "EntrenamientoRepository" as EntreRepo
  participant "ClanRepository" as ClanRepo
  participant "GuerraRepository" as GRepo
  participant "MiembroRepository" as MiembroRepo
  participant "RachaRepository" as RachaRepo
  participant "AdminHistorialRepository" as HistRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

opt entrada por voz (navegador compatible)
    Miembro -> Page: presiona "DICTAR"
    Page -> Voice: start() [lang = es-AR]
    Voice --> Page: transcripción ("sentadilla 80 kilos 10 repeticiones")
    Page -> Page: interpretarDictado(texto)\n→ { ejercicio, peso, reps }
    Page --> Miembro: muestra lo que entendió
    alt confirma
        Miembro -> Page: "USAR ESTOS DATOS"
        Page --> Miembro: autocompleta ejercicio, peso y reps
    else descarta
        Miembro -> Page: "DESCARTAR"
    end
end

Miembro -> Page: ajusta campos a mano (siempre disponibles)
Miembro -> Page: presiona "REGISTRAR ESFUERZO"
Page -> Action: registrarEntrenamiento(formData)
Action -> Action: validar (ejercicio no vacío, peso > 0, reps ≥ 1)
Action -> Ctrl: POST /api/arena/entrenar { ejercicio, pesoKg, repeticiones }
Ctrl -> Svc: registrarEntrenamiento(miembroId, ejercicio, pesoKg, repeticiones)
alt datos fuera de rango (peso ≤ 0 o > 500 kg, reps < 1 o > 200)
    Svc --> Ctrl: error de validación
    Ctrl --> Action: 400 { error }
    Action --> Page: mensaje de error
else datos válidos
Svc -> MiembroRepo: buscarPorId(miembroId): Miembro (arquetipo, clan)
Svc -> CER: calcular(pesoKg, reps, arquetipo)
CER --> Svc: ResultadoCER { puntaje, modificador }
Svc -> EntreRepo: crear(entrenamiento)
EntreRepo -> DB: INSERT INTO Entrenamientos

opt el miembro tiene clan
    Svc -> GSvc: asegurarGuerraActiva()
    GSvc --> Svc: guerra de la semana
    Svc -> ClanRepo: sumarCER(clanId, puntaje)
    ClanRepo -> DB: UPDATE Clanes SET PuntosClan = PuntosClan + @cer
    Svc -> GRepo: sumarCER(guerraId, clanId, puntaje)
    GRepo -> DB: UPDATE ParticipacionesGuerra\nSET CerAcumulado = CerAcumulado + @cer
    alt el clan todavía no participaba
        GRepo -> DB: INSERT INTO ParticipacionesGuerra
    end
end

Svc -> MiembroRepo: actualizarXP(miembroId, floor(puntaje / 10))
MiembroRepo -> DB: UPDATE Miembros SET Xp = Xp + @xp
Svc -> RachaRepo: crearOActualizar(miembroId, dias, ACTIVA, ahora)
note right: dias + 1 si el último entrenamiento fue ayer\n(hora Argentina); si fue hoy no cambia; si no, 1
RachaRepo -> DB: UPDATE Rachas SET DiasConsecutivos = @dias, Estado = 'ACTIVA'
Svc -> Rec: alEntrenar(miembroId, dias)
Rec -> DB: Llave de Acero cada 5 sesiones · hitos (trofeo + cofre) · rango según XP
Svc -> HistRepo: registrar(miembroId, "ENTRENAMIENTO", "CER · XP")
HistRepo -> DB: INSERT INTO AdminHistorial
Svc --> Ctrl: ResultadoCER { puntaje, modificador, xpGanado }
Ctrl --> Action: 200 OK
Action --> Page: resultado
Page --> Miembro: puntaje CER + XP ganada
end

@enduml
```

---

### CU-003-003 — Calcular el Puntaje CER

```plantuml
@startuml CU-003-003

actor Miembro

box "Presentación" #F5F0FF
  participant "CalculadoraCERPage" as Page
end box

box "Servicios" #EBFBF0
  participant "CerService" as Svc
end box

Miembro -> Page: accede a la Calculadora CER
Page --> Miembro: muestra formulario (peso, reps, arquetipo)

Miembro -> Page: ingresa pesoKg, reps, selecciona Arquetipo
Page -> Svc: calcular(pesoKg, reps, arquetipo: Arquetipo): ResultadoCER
Svc -> Svc: obtenerMultiplicador(arquetipo): number

alt arquetipo = VOLUMEN
    Svc --> Svc: multiplicador = 1.15
else arquetipo = DEFINIDO
    Svc --> Svc: multiplicador = 1.10
else arquetipo = ATLETICO
    Svc --> Svc: multiplicador = 1.20
end

Svc -> Svc: puntajeCER = pesoKg x reps x multiplicador
Svc --> Page: ResultadoCER
Page --> Miembro: muestra desglose: peso x reps x multiplicador = puntajeCER

@enduml
```

---

### CU-003-004 — Consultar el Historial de Batallas

> **Modificado S6:** la pantalla combina lo que piden el texto del CU (batallas con VICTORIA/DERROTA, tasa de victoria y racha) y la secuencia aprobada (entrenamientos con filtro). Una batalla es una semana de Guerra Global cerrada; el rival es la pareja del ranking final.

```plantuml
@startuml CU-003-004

actor Miembro

box "Presentación" #F5F0FF
  participant "HistorialBatallasPage" as Page
end box

box "Server Actions" #FAF5FF
  participant "getBatallas() /\ngetHistorial()\n[arena.ts]" as Action
end box

box "API Controllers" #ECFEFF
  participant "ArenaController" as Ctrl
end box

box "Servicios" #EBFBF0
  participant "GuerraService" as GSvc
  participant "ArenaService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "GuerraRepository" as GRepo
  participant "EntrenamientoRepository" as EntreRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede al Historial de Batallas [?ejercicio=filtro]
par batallas del clan
    Page -> Action: getBatallas()
    Action -> Ctrl: GET /api/arena/batallas
    Ctrl -> GSvc: ObtenerHistorialBatallas(clanId)
    GSvc -> GSvc: AsegurarGuerraActiva()\n[cierra la semana anterior si venció]
    GSvc -> GRepo: ListarFinalizadasDeClan(clanId)
    GRepo -> DB: SELECT guerras FINALIZADAS con participación del clan\n+ participaciones + clanes
    DB --> GRepo: GuerraGlobal[]
    GSvc -> GSvc: por guerra: rival = pareja de la posición final\nVICTORIA si nuestra posición < la del rival\nsin pareja → SIN_RIVAL
    GSvc -> GSvc: total, tasa de victoria, racha de victorias consecutivas
    GSvc --> Ctrl: HistorialBatallasDto
    Ctrl --> Action: 200 OK
else sesiones del miembro
    Page -> Action: getHistorial(1, ejercicio)
    Action -> Ctrl: GET /api/arena/historial?pagina=1&ejercicio=...
    Ctrl -> Svc: ObtenerHistorial(miembroId, 1, ejercicio)
    Svc -> EntreRepo: Listar(miembroId, 1, 20, ejercicio)
    EntreRepo -> DB: SELECT TOP 20 * FROM Entrenamientos\nWHERE MiembroId = @id AND Ejercicio LIKE %filtro%\nORDER BY FechaHora DESC
    DB --> EntreRepo: Entrenamiento[]
    Ctrl --> Action: 200 OK
end

alt el clan tiene guerras cerradas
    Page --> Miembro: estadísticas + compromisos recientes (VICTORIA / DERROTA / SIN RIVAL)
else sin guerras cerradas (FA-2)
    Page --> Miembro: estadísticas en cero + mensaje de instrucción
end
Page --> Miembro: lista de sesiones (filtrada si corresponde)

@enduml
```

---

## CU-004 — EVOLUCIÓN / BÓVEDA

> **Actualizado 17/11 (alineado con la carpeta):** árbol de habilidades colectivo con Puntos de Clan (RF-015), atributos FUERZA / AGILIDAD / RESISTENCIA (RF-006), Bóveda con botín diario, Llaves de Acero y cofre de evento, Marketplace con confirmación e historial de compras. Los descuentos de saldo son `UPDATE` condicionados (atómicos).

---

### CU-004-001 — Visualizar Progreso de Evolución

```plantuml
@startuml CU-004-001

actor Miembro

box "Presentación" #F5F0FF
  participant "EvolucionPage" as Page
end box

box "Servicios" #EBFBF0
  participant "EvolucionService" as Svc
  participant "Progresion" as Prog
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MiembroRepo
  participant "EntrenamientoRepository" as EntRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a Evolución (Bóveda/Evolución)
Page -> Svc: cargarProgreso(miembroId): ProgresoEvolucion
Svc -> MiembroRepo: buscarPorId(miembroId): Miembro
MiembroRepo -> DB: SELECT xp, rango, coins, llaves_acero FROM miembros WHERE id = miembroId
DB --> MiembroRepo: Miembro
MiembroRepo --> Svc: Miembro
Svc -> EntRepo: listarTodos(miembroId): Entrenamiento[]
EntRepo -> DB: SELECT peso_kg, repeticiones, fecha_hora FROM entrenamientos WHERE miembro_id = miembroId
DB --> EntRepo: Entrenamiento[]
EntRepo --> Svc: Entrenamiento[]
Svc -> Svc: calcularAtributos(historial): FUERZA = Σ(kg×reps)/100 · RESISTENCIA = Σ reps · AGILIDAD = días × 10
Svc -> Prog: nivel(xp) · xpParaSiguiente(rango, xp) · rangoSiguiente(rango)
Prog --> Svc: nivel, XP faltante, próximo rango
Svc --> Page: ProgresoEvolucion
Page --> Miembro: avatar + NIVEL, barra de XP (rango actual → próximo), BRONCE — PLATA — ORO, tarjetas de atributos
alt rango ORO (FA-1)
    Page --> Miembro: "MAX LEVEL"
end
alt atributo > 999 (FA-2)
    Page --> Miembro: "999+ PTS" con estrella
end
Miembro -> Page: RENDIMIENTO
Page --> Miembro: redirige al Dashboard (CU-005-001)

@enduml
```

---

### CU-004-002 — Mejorar Nodo del Árbol de Habilidades

```plantuml
@startuml CU-004-002

actor Miembro

box "Presentación" #F5F0FF
  participant "SkillTreePage" as Page
end box

box "Servicios" #EBFBF0
  participant "EvolucionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "SkillTreeRepository" as STRepo
  participant "ClanRepository" as ClanRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a SKILL TREE
Page -> Svc: obtenerArbol(miembroId): ArbolClan
Svc -> ClanRepo: buscarPorId(clanId): Clan
ClanRepo -> DB: SELECT puntos_clan FROM clanes WHERE id = clanId
DB --> ClanRepo: Clan
Svc -> STRepo: listar() · nivelesDelClan(clanId) · ultimasInversiones(clanId)
STRepo -> DB: SELECT nodos + nodo_dependencia · SELECT nivel FROM nodo_clan WHERE clan_id = clanId · SELECT TOP 5 FROM inversion_nodo
DB --> STRepo: catálogo, niveles del clan, historial
STRepo --> Svc: datos del árbol
Svc --> Page: ArbolClan (saldo de Puntos de Clan, nodos con nivel / bloqueo, últimas inversiones)
Page --> Miembro: árbol SVG (FUERZA → RESISTENCIA / ATAQUE…) y saldo arriba a la derecha

alt clic en nodo BLOQUEADO (FA-1)
    Page --> Miembro: no se selecciona; tooltip con el prerrequisito
else nodo desbloqueado
    Miembro -> Page: selecciona el nodo
    Page --> Miembro: panel: nombre, nivel actual / máximo, efecto actual y del próximo nivel, costo en Puntos de Clan
    Miembro -> Page: MEJORAR NODO
    Page -> Svc: mejorarNodo(nodoId, miembroId): InversionNodo
    Svc -> STRepo: buscarPorId(nodoId) · nivelesDelClan(clanId)
    STRepo --> Svc: nodo + prerrequisitos, nivel actual
    alt prerrequisito sin invertir o nivel máximo
        Svc --> Page: error
    else
        Svc -> ClanRepo: descontarPuntos(clanId, costo)
        ClanRepo -> DB: UPDATE clanes SET puntos_clan = puntos_clan - costo WHERE id = clanId AND puntos_clan >= costo
        alt 0 filas: puntos insuficientes (FA-2)
            ClanRepo --> Svc: false
            Svc --> Page: "PUNTOS INSUFICIENTES"
            Page --> Miembro: botón deshabilitado con "PUNTOS INSUFICIENTES"
        else 1 fila
            ClanRepo --> Svc: true
            Svc -> STRepo: subirNivel(clanId, nodoId, nivel)
            STRepo -> DB: INSERT nodo_clan (nivel 1) / UPDATE nodo_clan SET nivel = nivel + 1 WHERE nivel = nivelActual
            alt otro miembro del clan lo mejoró al mismo tiempo (0 filas)
                Svc -> ClanRepo: sumarPuntos(clanId, costo)
                ClanRepo -> DB: UPDATE clanes SET puntos_clan = puntos_clan + costo
                Svc --> Page: "El nodo cambió de nivel mientras mejorabas"
            else
                Svc -> STRepo: registrarInversion(clan, nodo, miembro, nivelAlcanzado, costo)
                STRepo -> DB: INSERT INTO inversion_nodo
                Svc --> Page: InversionNodo
                Page --> Miembro: nodo sube de nivel, saldo actualizado, "ÚLTIMAS INVERSIONES" con la mejora
            end
        end
    end
end

@enduml
```

---

### CU-004-003 — Reclamar Recompensa de la Bóveda

```plantuml
@startuml CU-004-003

actor Miembro

box "Presentación" #F5F0FF
  participant "BovedaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "EvolucionService" as Svc
  participant "RecompensasService" as Rec
end box

box "Repositorios" #FFF3EB
  participant "CofreRepository" as CofreRepo
  participant "MiembroRepository" as MiembroRepo
  participant "EntrenamientoRepository" as EntRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a BÓVEDA
Page -> Svc: obtenerBoveda(miembroId): Boveda
Svc -> EntRepo: listarDesde(miembroId, ayer 00:00 ART)
EntRepo --> Svc: entrenamientos recientes
alt entrenó ayer u hoy y no tiene botín de hoy
    Svc -> CofreRepo: crear(miembroId, COMUN, BOTIN_DIARIO)
    CofreRepo -> DB: INSERT INTO cofres
end
Svc -> CofreRepo: listarDisponibles(miembroId): Cofre[]
CofreRepo -> DB: SELECT * FROM cofres WHERE miembro_id = miembroId AND estado = 'DISPONIBLE'
DB --> CofreRepo: Cofre[]
Svc --> Page: Boveda (cajas, listos, MULTIPLICADOR XP según racha, PRÓXIMO = medianoche ART, llaves de acero)
Page --> Miembro: 4 tarjetas + cofres: ALPHA "LISTO", OMEGA "BLOQUEADO" (Llaves de Acero), "EVENTO LIMITADO"

alt cofre bloqueado sin llaves suficientes (FA-1)
    Page --> Miembro: botón deshabilitado + "Ganás una cada 5 entrenamientos"
else RECLAMAR / ABRIR / RECLAMAR AHORA
    Miembro -> Page: reclamar cofre
    Page -> Svc: reclamarCofre(cofreId, miembroId): RecompensaCofre
    opt cofre con llaves requeridas
        Svc -> MiembroRepo: gastarLlaves(miembroId, n)
        MiembroRepo -> DB: UPDATE miembros SET llaves_acero = llaves_acero - n WHERE id = miembroId AND llaves_acero >= n
    end
    Svc -> CofreRepo: marcarReclamado(cofreId, miembroId)
    CofreRepo -> DB: UPDATE cofres SET estado = 'RECLAMADO' WHERE id = cofreId AND estado = 'DISPONIBLE'
    Svc -> MiembroRepo: actualizarCoins(+SB por rareza) · actualizarXP(+XP base × multiplicador)
    MiembroRepo -> DB: UPDATE miembros SET coins = coins + n, xp = xp + m
    Svc -> Rec: actualizarRango(miembroId)
    Svc --> Page: RecompensaCofre
    Page --> Miembro: "Abriste el COFRE ALPHA: +100 SB · +11 XP"
end
alt el contador PRÓXIMO llega a cero (FA-2)
    Page -> Page: refresca la pantalla → el botín del día aparece LISTO
end

@enduml
```

---

### CU-004-004 — Adquirir Ítem en el Marketplace

```plantuml
@startuml CU-004-004

actor Miembro

box "Presentación" #F5F0FF
  participant "MarketplacePage" as Page
end box

box "Servicios" #EBFBF0
  participant "EvolucionService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MarketplaceRepository" as MktRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a MARKETPLACE (Mercado)
Page -> Svc: obtenerItems(categoria): Item[]
Svc -> MktRepo: listar(categoria)
MktRepo -> DB: SELECT * FROM items [WHERE categoria = SKIN | AURA | ICONO]
DB --> MktRepo: Item[]
Page --> Miembro: saldo en SB, filtros TODOS / SKINS / AURAS / ICONOS, catálogo
alt categoría sin ítems (FA-2)
    Page --> Miembro: "No hay ítems disponibles en esta categoría."
end
alt saldo < precio (FA-1)
    Page --> Miembro: COMPRAR deshabilitado y precio en rojo
else
    Miembro -> Page: COMPRAR
    Page --> Miembro: confirmación con nombre del ítem y costo final
    Miembro -> Page: CONFIRMAR
    Page -> Svc: comprarItem(itemId, miembroId): Item
    Svc -> MktRepo: posee(miembroId, itemId)
    alt ya lo tiene
        Svc --> Page: "Ya tenés este ítem."
    else
        Svc -> MiembroRepo: gastarCoins(miembroId, precio)
        MiembroRepo -> DB: UPDATE miembros SET coins = coins - precio WHERE id = miembroId AND coins >= precio
        alt 0 filas
            Svc --> Page: "Coins insuficientes."
        else
            Svc -> MktRepo: registrarCompra(miembroId, itemId)
            MktRepo -> DB: INSERT INTO inventario_items + INSERT INTO transaccion_marketplace (una transacción)
            Svc --> Page: Item
            Page --> Miembro: saldo actualizado; el ítem queda en el inventario
        end
    end
end
Miembro -> Page: Perfil → INVENTARIO → ACTIVAR (paso 18)
Page -> MktRepo: activar(miembroId, itemId)
MktRepo -> DB: UPDATE inventario_items SET activo = (item_id = itemId) WHERE miembro_id = miembroId AND categoría = la del ítem

@enduml
```
