# 10.5.4 — Diagramas de Secuencia: CU-005 PERFIL

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → PostgreSQL (DB)
**Actor:** Miembro (usuario estándar)

---

## CU-005 — PERFIL

---

### CU-005-001 — Consultar Dashboard de Rendimiento Personal

```plantuml
@startuml CU-005-001

actor Miembro

box "Presentación" #1C1C2E
  participant "PerfilPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "MiembroRepository" as MiembroRepo
  participant "EntrenamientoRepository" as EntreRepo
  participant "RachaRepository" as RachaRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navegar a Perfil
Page -> Svc: cargarDashboard(miembroId): Promise~DashboardData~

group Carga en paralelo
    Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
    MiembroRepo -> DB: SELECT xp, rango, arquetipo, coins WHERE id = miembroId
    DB --> MiembroRepo: Miembro
    MiembroRepo --> Svc: Miembro
== ==
    Svc -> EntreRepo: listar(miembroId, filtros, 1): Promise~Entrenamiento[]~
    EntreRepo -> DB: SELECT * FROM entrenamientos WHERE miembro_id = miembroId ORDER BY fecha DESC LIMIT 10
    DB --> EntreRepo: Entrenamiento[]
    EntreRepo --> Svc: Entrenamiento[]
== ==
    Svc -> RachaRepo: obtenerPorMiembro(miembroId): Promise~Racha~
    RachaRepo -> DB: SELECT dias_consecutivos, estado, ultimo_entrenamiento WHERE miembro_id = miembroId
    DB --> RachaRepo: Racha
    RachaRepo --> Svc: Racha
end

Svc -> Svc: construirDashboard(miembro, entrenamientos, racha): DashboardData
Svc --> Page: DashboardData
Page --> Miembro: renderiza gráfico CER + tabla de sesiones + estado de racha

@enduml
```


https://www.sportograf.com/img/thumbnail/25111/search/SGF6272d9e5
---

### CU-005-002 — Consultar Racha de Entrenamiento

```plantuml
@startuml CU-005-002

actor Miembro

box "Presentación" #1C1C2E
  participant "RachaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "RachaRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navegar a sección Racha
Page -> Svc: consultarRacha(miembroId): Promise~Racha~
Svc -> Repo: obtenerPorMiembro(miembroId): Promise~Racha~
Repo -> DB: SELECT dias_consecutivos, estado, ultimo_entrenamiento, historial_dias WHERE miembro_id = miembroId
DB --> Repo: Racha
Repo --> Svc: Racha
Svc --> Page: Racha

alt estado === EstadoRacha.ACTIVA
    Page --> Miembro: racha activa con días consecutivos y calendario marcado
else estado === EstadoRacha.EN_RIESGO
    Page --> Miembro: alerta "Último día para mantener tu racha" + días consecutivos
else estado === EstadoRacha.ROTA
    Page --> Miembro: racha rota + botón "SALVAR RACHA" con costo en Clan Points
end

@enduml
```

---

### CU-005-003 — Salvar Racha con Puntos de Clan

```plantuml
@startuml CU-005-003

actor Miembro

box "Presentación" #1C1C2E
  participant "RachaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "ClanRepository" as ClanRepo
  participant "RachaRepository" as RachaRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: presiona "SALVAR RACHA"
Page --> Miembro: muestra modal con costo en Clan Points
Miembro -> Page: confirma acción
Page -> Svc: salvarRacha(miembroId, clanId): Promise~void~

Svc -> ClanRepo: buscarPorId(clanId): Promise~Clan~
ClanRepo -> DB: SELECT clan_points WHERE id = clanId
DB --> ClanRepo: Clan
ClanRepo --> Svc: Clan

alt clan.puntosClan >= COSTO_SALVAR_RACHA
    Svc -> ClanRepo: descontarPuntos(clanId, costo): Promise~void~
    ClanRepo -> DB: UPDATE clanes SET clan_points = clan_points - costo WHERE id = clanId
    DB --> ClanRepo: OK
    ClanRepo --> Svc: void

    Svc -> RachaRepo: restaurar(miembroId): Promise~Racha~
    RachaRepo -> DB: UPDATE rachas SET estado = 'ACTIVA', dias_consecutivos = 1 WHERE miembro_id = miembroId
    DB --> RachaRepo: Racha
    RachaRepo --> Svc: Racha

    Svc -> MiembroRepo: actualizar(miembroId, evento): Promise~void~
    MiembroRepo -> DB: INSERT INTO eventos_miembro (miembro_id, tipo, descripcion)
    DB --> MiembroRepo: OK
    MiembroRepo --> Svc: void

    Svc --> Page: racha restaurada
    Page --> Miembro: "¡Racha salvada!" — estado vuelve a ACTIVA
else puntos insuficientes
    Svc --> Page: throw ClanPointsInsuficientesError
    Page --> Miembro: "Tu clan no tiene puntos suficientes para salvar la racha"
end

@enduml
```

---

### CU-005-004 — Monitorear Estado de Fatiga Biométrica

```plantuml
@startuml CU-005-004

actor Miembro

box "Presentación" #1C1C2E
  participant "FatigaPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "FatigaRepository" as FatigaRepo
  participant "EntrenamientoRepository" as EntreRepo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navegar a sección Fatiga
Page -> Svc: cargarFatiga(miembroId): Promise~DatosFatiga~

group Carga en paralelo
    Svc -> FatigaRepo: obtenerPorMiembro(miembroId): Promise~DatosFatiga~
    FatigaRepo -> DB: SELECT nivel_fatiga, fc_reposo, calidad_sueno WHERE miembro_id = miembroId
    DB --> FatigaRepo: DatosFatiga
    FatigaRepo --> Svc: DatosFatiga
== ==
    Svc -> EntreRepo: obtenerEstadisticas(miembroId): Promise~Object~
    EntreRepo -> DB: SELECT SUM(carga_total) FROM entrenamientos WHERE fecha >= NOW() - INTERVAL 7 DAYS
    DB --> EntreRepo: cargaSemanal: number
    EntreRepo --> Svc: cargaSemanal
end

Svc -> Svc: evaluarFatiga(datos: DatosFatiga, cargaSemanal): EstadoFatiga

alt estadoFatiga === EstadoFatiga.OPTIMA
    Svc --> Page: DatosFatiga
    Page --> Miembro: indicador verde + recomendación de entrenar normalmente
else estadoFatiga === EstadoFatiga.MODERADA
    Svc --> Page: DatosFatiga
    Page --> Miembro: indicador amarillo + alerta de carga moderada
else estadoFatiga === EstadoFatiga.ELEVADA
    Svc --> Page: DatosFatiga
    Page --> Miembro: indicador naranja + recomendación de recuperación
else estadoFatiga === EstadoFatiga.CRITICA
    Svc --> Page: DatosFatiga
    Page --> Miembro: indicador rojo + alerta crítica de descanso
end

@enduml
```

---

### CU-005-005 — Consultar Vitrina de Trofeos

```plantuml
@startuml CU-005-005

actor Miembro

box "Presentación" #1C1C2E
  participant "TrofeosPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "TrofeoRepository" as Repo
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navegar a sección Trofeos
Page -> Svc: cargarTrofeos(miembroId): Promise~Trofeo[]~
Svc -> Repo: listarPorMiembro(miembroId): Promise~Trofeo[]~
Repo -> DB: SELECT nombre, descripcion, tipo, fecha_obtencion FROM trofeos WHERE miembro_id = miembroId ORDER BY fecha_obtencion DESC
DB --> Repo: Trofeo[]
Repo --> Svc: Trofeo[]

alt trofeos.length === 0
    Svc --> Page: []
    Page --> Miembro: "Completá desafíos para ganar tu primer trofeo"
else trofeos.length > 0
    Svc -> Repo: obtenerProgreso(miembroId): Promise~Object~
    Repo -> DB: SELECT * FROM trofeos_disponibles WHERE id NOT IN (trofeos del miembro) LIMIT 1
    DB --> Repo: Trofeo próximo | null
    Repo --> Svc: Trofeo próximo

    Svc -> Svc: calcularProgresoHaciaProximo(miembroId, proximo): number
    Svc --> Page:
    Page --> Miembro: grilla de trofeos + barra de progreso hacia el próximo
end

@enduml
```

---

### CU-005-006 — Reclamar Beneficio de un Aliado Comercial

```plantuml
@startuml CU-005-006

actor Miembro

box "Presentación" #1C1C2E
  participant "BeneficiosPage" as Page
end box

box "Servicios" #1C2E1C
  participant "PerfilService" as Svc
end box

box "Repositorios" #2E1C10
  participant "BeneficioRepository" as BeneficioRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Externo" #2E2E10
  participant "AliadoComercial (externo)" as Aliado
end box

box "Base de Datos" #2E2E2E
  database "PostgreSQL" as DB
end box

Miembro -> Page: navegar a sección Beneficios
Page -> Svc: cargarBeneficios(miembroId): Promise~BeneficioAliado[]~
Svc -> MiembroRepo: buscarPorId(miembroId): Promise~Miembro~
MiembroRepo -> DB: SELECT rango FROM miembros WHERE id = miembroId
DB --> MiembroRepo: Miembro
MiembroRepo --> Svc: Miembro
Svc -> BeneficioRepo: listarElegibles(miembroId, rango): Promise~BeneficioAliado[]~
BeneficioRepo -> DB: SELECT * FROM beneficios WHERE rango_minimo <= rango AND estado = 'DISPONIBLE'
DB --> BeneficioRepo: BeneficioAliado[]
BeneficioRepo --> Svc: BeneficioAliado[]
Svc --> Page: BeneficioAliado[]
Page --> Miembro: lista de beneficios filtrados por rango

Miembro -> Page: selecciona beneficio con EstadoBeneficio.DISPONIBLE
Page -> Svc: reclamarBeneficio(beneficioId, miembroId): Promise~ResultadoReclamo~
Svc -> BeneficioRepo: listarElegibles(miembroId, rango): Promise~BeneficioAliado[]~
BeneficioRepo -> DB: SELECT rango_minimo FROM beneficios WHERE id = beneficioId
DB --> BeneficioRepo: elegible: boolean
BeneficioRepo --> Svc: esElegible

alt esElegible === false
    Svc --> Page: throw RangoInsuficienteError
    Page --> Miembro: "Necesitás un rango mayor para reclamar este beneficio"
else esElegible === true
    Svc -> BeneficioRepo: registrarReclamo(beneficioId, miembroId): Promise~void~
    BeneficioRepo -> DB: UPDATE beneficios SET estado = 'RECLAMADO', fecha_reclamo = NOW() WHERE id = beneficioId
    DB --> BeneficioRepo: OK
    BeneficioRepo --> Svc: void

    alt tipoBeneficio === TipoBeneficio.CODIGO
        Svc --> Page: ResultadoReclamo
        Page --> Miembro: muestra código de descuento en pantalla
    else tipoBeneficio === TipoBeneficio.REDIRECCION
        Svc -> Aliado: generarUrlRedireccion(beneficioId, miembroId): Promise~string~
        Aliado --> Svc: urlRedireccion: string
        Svc --> Page: ResultadoReclamo
        Page --> Miembro: abre navegador externo con URL del aliado
    else tipoBeneficio === TipoBeneficio.CUPON
        Svc -> Svc: generarCupon(beneficioId, miembroId): string
        Svc --> Page: ResultadoReclamo
        Page --> Miembro: renderiza imagen del cupón descargable
    else tipoBeneficio === TipoBeneficio.SUSCRIPCION
        Svc -> BeneficioRepo: actualizarEstado(beneficioId, datos): Promise~void~
        BeneficioRepo -> DB: INSERT INTO suscripciones_activas (miembro_id, aliado_id, fecha_fin)
        DB --> BeneficioRepo: OK
        BeneficioRepo --> Svc: void
        Svc --> Page: ResultadoReclamo
        Page --> Miembro: confirmación de suscripción activa con fecha de vencimiento
    end
end

@enduml
```
