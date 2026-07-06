# 10.5.4 — Diagramas de Secuencia: CU-003 ARENA + CU-004 EVOLUCIÓN/BÓVEDA

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → PostgreSQL (DB)
**Nota CER:** `puntajeCER = pesoKg × repeticiones × multiplicadorArquetipo`

---

## CU-003 — ARENA

---

### CU-003-001 — Consultar el Estado de la Guerra Global

```plantuml
@startuml CU-003-001

actor Miembro

box "Presentación" #1C1C2E
  participant "GuerraGlobalPage" as Page
end box

box "Servicios" #1C2E1C
  participant "ArenaService" as Svc
end box

box "Repositorios" #2E1C10
  participant "GuerraRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: accede a La Arena
Page -> Svc: obtenerGuerraActiva(): Promise~GuerraGlobal | null~
Svc -> Repo: findGuerraActiva(): Promise~GuerraGlobal | null~
Repo -> DB: SELECT * FROM guerras WHERE estado = 'ACTIVA' LIMIT 1
DB --> Repo: GuerraGlobal | null
Repo --> Svc: GuerraGlobal | null

alt guerra activa encontrada
    Svc -> Repo: findRankingClanes(guerraId, top: 10): Promise~Clan[]~
    Repo -> DB: SELECT clanes ORDER BY puntaje_cer_semanal DESC LIMIT 10
    DB --> Repo: Clan[]
    Repo --> Svc: Clan[]
    Svc --> Page: GuerraGlobal, ranking: Clan[], cuentaRegresiva: number
    Page --> Miembro: muestra top 10 clanes + clan propio destacado + cuenta regresiva
else sin guerra activa
    Svc --> Page: null
    Page --> Miembro: muestra "Próxima guerra en preparación"
end

@enduml
```

---

### CU-003-002 — Registrar un Entrenamiento

```plantuml
@startuml CU-003-002

actor Miembro

box "Presentación" #1C1C2E
  participant "RegistrarEntrenamientoPage" as Page
end box

box "Servicios" #1C2E1C
  participant "ArenaService" as Svc
  participant "CERService" as CER
end box

box "Repositorios" #2E1C10
  participant "EntrenamientoRepository" as EntreRepo
  participant "RachaRepository" as RachaRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Externo" #2E2E10
  participant "Web Speech API" as Voice
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: selecciona ejercicio, ingresa peso y reps

opt entrada por voz
    Miembro -> Page: activa micrófono
    Page -> Voice: startRecognition(): Promise~string~
    Voice --> Page: transcripción ("80 kilos 10 repeticiones")
    Page --> Miembro: autocompleta campos peso y reps
end

Miembro -> Page: confirma "REGISTRAR ESFUERZO"
Page -> Svc: registrarEntrenamiento(datos: Entrenamiento): Promise~ResultadoCER~
Svc -> CER: calcular(pesoKg, reps, arquetipo: Arquetipo): ResultadoCER
CER --> Svc: ResultadoCER
Svc -> EntreRepo: crear(entrenamiento: Entrenamiento): Promise~Entrenamiento~
EntreRepo -> DB: INSERT INTO entrenamientos (ejercicio, peso_kg, repeticiones, puntaje_cer, miembro_id)
DB --> EntreRepo: Entrenamiento persistido
EntreRepo --> Svc: Entrenamiento
Svc -> RachaRepo: actualizar(miembroId, datos): Promise~Racha~
RachaRepo -> DB: UPDATE rachas SET dias_consecutivos = dias_consecutivos + 1 WHERE miembro_id = miembroId
DB --> RachaRepo: Racha actualizada
RachaRepo --> Svc: Racha
Svc -> MiembroRepo: actualizarXP(miembroId, xpGanado): Promise~Miembro~
MiembroRepo -> DB: UPDATE miembros SET xp = xp + xpGanado WHERE id = miembroId
DB --> MiembroRepo: Miembro actualizado
MiembroRepo --> Svc: Miembro
Svc --> Page: ResultadoCER
Page --> Miembro: muestra puntaje CER + XP ganado + estado de racha

@enduml
```

---

### CU-003-003 — Calcular el Puntaje CER

```plantuml
@startuml CU-003-003

actor Miembro

box "Presentación" #1C1C2E
  participant "CalculadoraCERPage" as Page
end box

box "Servicios" #1C2E1C
  participant "CERService" as Svc
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

```plantuml
@startuml CU-003-004

actor Miembro

box "Presentación" #1C1C2E
  participant "HistorialBatallasPage" as Page
end box

box "Servicios" #1C2E1C
  participant "ArenaService" as Svc
end box

box "Repositorios" #2E1C10
  participant "EntrenamientoRepository" as EntreRepo
  participant "AdminHistorialRepository" as LogRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: accede al Historial de Batallas
Page -> Svc: obtenerHistorial(miembroId, filtros, pagina: 1): Promise~Entrenamiento[]~
Svc -> EntreRepo: listar(miembroId, filtros, 1): Promise~Entrenamiento[]~
EntreRepo -> DB: SELECT * FROM entrenamientos WHERE miembro_id = miembroId LIMIT 10 OFFSET 0
DB --> EntreRepo: Entrenamiento[]
EntreRepo --> Svc: Entrenamiento[]
Svc -> LogRepo: registrar(evento: "acceso_historial"): Promise~void~
LogRepo -> DB: INSERT INTO admin_historial (miembro_id, tipo, timestamp)
DB --> LogRepo: OK
LogRepo --> Svc: void

alt hay entrenamientos registrados
    Svc --> Page: Entrenamiento[] (paginado, 10 por página)
    Page --> Miembro: lista con ejercicio, CER, fecha y duración

    Miembro -> Page: aplicar filtro por fecha o ejercicio
    Page -> Svc: obtenerHistorial(miembroId, filtrosActualizados, 1)
    Svc -> EntreRepo: listar(miembroId, filtrosActualizados, 1)
    EntreRepo -> DB: SELECT * FROM entrenamientos WHERE miembro_id = miembroId AND filtros LIMIT 10
    DB --> EntreRepo: Entrenamiento[] filtrado
    EntreRepo --> Svc: Entrenamiento[]
    Svc --> Page: Entrenamiento[] filtrado
    Page --> Miembro: lista actualizada con filtros aplicados
else sin entrenamientos
    Svc --> Page: []
    Page --> Miembro: "Todavía no registraste ningún entrenamiento"
end

@enduml
```

---

## CU-004 — EVOLUCIÓN / BÓVEDA

---

### CU-004-001 — Visualizar Progreso de Evolución

```plantuml
@startuml CU-004-001

actor Miembro

box "Presentación" #1C1C2E
  participant "EvolucionPage" as Page
end box

box "Servicios" #1C2E1C
  participant "EvolucionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as MiembroRepo
  participant "SkillTreeRepository" as STRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: accede a Evolución
Page -> Svc: cargarProgreso(miembroId): Promise~ProgresoEvolucion~

group Carga en paralelo
    Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
    MiembroRepo -> DB: SELECT xp, rango, coins FROM miembros WHERE id = miembroId
    DB --> MiembroRepo: Miembro
    MiembroRepo --> Svc: Miembro
== ==
    Svc -> STRepo: obtenerArbol(miembroId): Promise~Nodo[]~
    STRepo -> DB: SELECT * FROM nodos WHERE miembro_id = miembroId
    DB --> STRepo: Nodo[]
    STRepo --> Svc: Nodo[] con EstadoNodo por cada uno
end

Svc -> Svc: calcularXPParaSiguienteRango(rango, xpActual): number
Svc --> Page: ProgresoEvolucion
Page --> Miembro: avatar evolutivo según Rango (BRONCE/PLATA/ORO/RANGO_S) + árbol de habilidades

@enduml
```

---

### CU-004-002 — Mejorar Nodo del Árbol de Habilidades

```plantuml
@startuml CU-004-002

actor Miembro

box "Presentación" #1C1C2E
  participant "SkillTreePage" as Page
end box

box "Servicios" #1C2E1C
  participant "EvolucionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "SkillTreeRepository" as STRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: selecciona nodo con EstadoNodo.DISPONIBLE
Page --> Miembro: muestra modal con nombre y costoXP del nodo
Miembro -> Page: confirmarInversion()
Page -> Svc: mejorarNodo(nodoId, miembroId): Promise~ResultadoInversion~
Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
MiembroRepo -> DB: SELECT xp FROM miembros WHERE id = miembroId
DB --> MiembroRepo: Miembro
MiembroRepo --> Svc: Miembro
Svc -> STRepo: obtenerArbol(miembroId): Promise~Nodo[]~
STRepo -> DB: SELECT * FROM nodos WHERE id = nodoId
DB --> STRepo: Nodo
STRepo --> Svc: Nodo

alt xp suficiente (miembro.xp >= nodo.costoXP)
    Svc -> STRepo: crearInversion(inversion: InversionNodo): Promise~InversionNodo~
    STRepo -> DB: INSERT INTO inversiones_nodo && UPDATE nodos SET estado = 'DESBLOQUEADO'
    DB --> STRepo: OK
    STRepo --> Svc: InversionNodo
    Svc -> MiembroRepo: actualizarXP(miembroId, -nodo.costoXP): Promise~Miembro~
    MiembroRepo -> DB: UPDATE miembros SET xp = xp - costoXP WHERE id = miembroId
    DB --> MiembroRepo: Miembro actualizado
    MiembroRepo --> Svc: Miembro
    Svc --> Page: ResultadoInversion
    Page --> Miembro: nodo pasa a DESBLOQUEADO, muestra beneficio obtenido
else xp insuficiente
    Svc --> Page: ResultadoInversion
    Page --> Miembro: "Te faltan X XP para desbloquear este nodo"
end

@enduml
```

---

### CU-004-003 — Reclamar Recompensa de la Bóveda

```plantuml
@startuml CU-004-003

actor Miembro

box "Presentación" #1C1C2E
  participant "BovedaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "EvolucionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "CofreRepository" as CofreRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: accede a la Bóveda
Page -> Svc: obtenerCofresDisponibles(miembroId): Promise~Cofre[]~
Svc -> CofreRepo: listarDisponibles(miembroId): Promise~Cofre[]~
CofreRepo -> DB: SELECT * FROM cofres WHERE miembro_id = miembroId AND estado = 'DISPONIBLE'
DB --> CofreRepo: Cofre[]
CofreRepo --> Svc: Cofre[]
Svc --> Page: Cofre[] con RarezaCofre (COMUN/RARO/EPICO/LEGENDARIO)
Page --> Miembro: muestra cofres con rareza visual

Miembro -> Page: selecciona cofre con EstadoCofre.DISPONIBLE
Page -> Svc: reclamarCofre(cofreId, miembroId): Promise~ResultadoCofre~
Svc -> CofreRepo: listarDisponibles(miembroId): Promise~Cofre[]~
CofreRepo -> DB: SELECT * FROM cofres WHERE id = cofreId
DB --> CofreRepo: Cofre
CofreRepo --> Svc: Cofre

alt cofre DISPONIBLE
    Svc -> Svc: determinarLoot(rareza: RarezaCofre): Item
    Svc -> MiembroRepo: actualizar(miembroId, item): Promise~void~
    MiembroRepo -> DB: INSERT INTO inventario_items (miembro_id, item_id)
    DB --> MiembroRepo: OK
    MiembroRepo --> Svc: void
    Svc -> CofreRepo: marcarReclamado(cofreId): Promise~void~
    CofreRepo -> DB: UPDATE cofres SET estado = 'RECLAMADO' WHERE id = cofreId
    DB --> CofreRepo: OK
    CofreRepo --> Svc: void
    Svc --> Page: ResultadoCofre
    Page --> Miembro: animación de apertura + muestra Item obtenido
else cofre ya RECLAMADO
    Svc --> Page: ResultadoCofre
    Page --> Miembro: muestra mensaje de error
end

@enduml
```

---

### CU-004-004 — Adquirir Ítem en el Marketplace

```plantuml
@startuml CU-004-004

actor Miembro

box "Presentación" #1C1C2E
  participant "MarketplacePage" as Page
end box

box "Servicios" #1C2E1C
  participant "EvolucionService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MarketplaceRepository" as MktRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navega el Marketplace
Page -> Svc: obtenerItems(categoria: CategoriaItem): Promise~Item[]~
Svc -> MktRepo: listar(categoria): Promise~Item[]~
MktRepo -> DB: SELECT * FROM items WHERE categoria = categoria
DB --> MktRepo: Item[]
MktRepo --> Svc: Item[]
Svc --> Page: Item[] (SKIN/HABITAT/ACCESORIO/AURA)
Page --> Miembro: muestra catálogo con nombre, descripción y precio en coins

Miembro -> Page: selecciona Item y confirma compra
Page -> Svc: comprarItem(itemId, miembroId): Promise~ResultadoCompra~
Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
MiembroRepo -> DB: SELECT coins FROM miembros WHERE id = miembroId
DB --> MiembroRepo: Miembro
MiembroRepo --> Svc: Miembro
Svc -> MktRepo: buscarItem(itemId): Promise~Item~
MktRepo -> DB: SELECT * FROM items WHERE id = itemId
DB --> MktRepo: Item
MktRepo --> Svc: Item

alt coins suficientes (miembro.coins >= item.precio)
    Svc -> MiembroRepo: actualizarCoins(miembroId, -item.precio): Promise~Miembro~
    MiembroRepo -> DB: UPDATE miembros SET coins = coins - precio WHERE id = miembroId
    DB --> MiembroRepo: Miembro actualizado
    MiembroRepo --> Svc: Miembro
    Svc -> MktRepo: registrarCompra(miembroId, itemId): Promise~void~
    MktRepo -> DB: INSERT INTO transacciones_marketplace (miembro_id, item_id, fecha)
    DB --> MktRepo: OK
    MktRepo --> Svc: void
    Svc -> MiembroRepo: actualizar(miembroId, itemAgregado): Promise~void~
    MiembroRepo -> DB: INSERT INTO inventario_items (miembro_id, item_id)
    DB --> MiembroRepo: OK
    MiembroRepo --> Svc: void
    Svc --> Page: ResultadoCompra
    Page --> Miembro: confirma compra, ítem disponible en inventario
else coins insuficientes
    Svc --> Page: ResultadoCompra
    Page --> Miembro: "Te faltan X coins para adquirir este ítem"
end

@enduml
```
