# 10.5.4 — Diagramas de Secuencia: CU-005 PERFIL

**Tipo:** Diagramas de secuencia de diseño (no de sistema)
**Convención:** Page → Service → Repository → SQL Server (DB)
**Actor:** Miembro (usuario estándar)

---

## CU-005 — PERFIL

> **Actualizado 17/11 (alineado con la carpeta):** dashboard comparativo 2×2 (RF-007), racha en hora Argentina con rescate y "DEJAR MORIR LA RACHA", fatiga relativa al peso corporal con protocolo y tendencia (RF-009), vitrina con victorias, beneficios por rango con vencimiento y suscripción (RF-016), cuenta con confirmación de contraseña.

---

### CU-005-001 — Consultar Dashboard de Rendimiento Personal

```plantuml
@startuml CU-005-001

actor Miembro

box "Presentación" #F5F0FF
  participant "DashboardPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
  participant "EvolucionService" as Evo
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MiembroRepo
  participant "ClanRepository" as ClanRepo
  participant "EntrenamientoRepository" as EntRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: accede a Perfil (o RENDIMIENTO desde Evolución)
Page -> Svc: cargarDashboard(miembroId): DashboardData
Svc -> MiembroRepo: buscarPorId(miembroId)
Svc -> ClanRepo: buscarPorId(clanId) (con miembros)
Svc -> EntRepo: listarDeMiembros(idsDelClan): Entrenamiento[]
EntRepo -> DB: SELECT * FROM entrenamientos WHERE miembro_id IN (miembros del clan)
DB --> EntRepo: Entrenamiento[]
Svc -> Svc: Índice de Dominancia = percentil del CER de 7 días dentro del clan
Svc -> Evo: calcularAtributos(historial) por miembro
Svc -> Svc: radar FUERZA BRUTA / RESISTENCIA / AGILIDAD / TÉCNICA (usuario vs. promedio, 0–100)
Svc -> Svc: volumen total (kg × reps) vs. promedio del clan
Svc -> Svc: CER: Capacidad (vs. CER máximo del clan) · Eficiencia (vs. promedio) · Recuperación (100 − carga %)
Svc --> Page: DashboardData + timestamp del cálculo
Page --> Miembro: grilla 2×2: DOMINANCIA · PERFIL TÁCTICO · VOLUMEN TOTAL (KG) · PUNTAJE C.E.R.
alt menos de 3 sesiones (FA-1)
    Page --> Miembro: "--" e invitación a registrar 3 sesiones
end

@enduml
```

---

### CU-005-002 — Consultar Racha de Entrenamiento

```plantuml
@startuml CU-005-002

actor Miembro

box "Presentación" #F5F0FF
  participant "RachaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
  participant "HoraArgentina" as Hora
end box

box "Repositorios" #FFF3EB
  participant "RachaRepository" as RachaRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: botón de racha en el Santuario o "Racha" en la barra lateral
Page -> Svc: consultarRacha(miembroId): Racha
Svc -> RachaRepo: obtenerPorMiembro(miembroId)
RachaRepo -> DB: SELECT * FROM rachas WHERE miembro_id = miembroId
DB --> RachaRepo: Racha
Svc -> Hora: hoy() · fechaDe(ultimoEntrenamiento)
alt último entrenamiento hoy
    Svc -> Svc: ACTIVA
else último ayer
    Svc -> Svc: EN_RIESGO
else antes de ayer
    Svc -> RachaRepo: crearOActualizar(dias = 0, ROTA)
    RachaRepo -> DB: UPDATE rachas SET dias_consecutivos = 0, estado = 'ROTA'
end
Svc --> Page: Racha
alt EN_RIESGO
    Page --> Miembro: "RACHA ACTUAL", días, banner "RACHA A PUNTO DE PERDERSE", SALVAR RACHA "50 pts (Tienes: X pts)", "DEJAR MORIR LA RACHA"
else ya entrenó hoy (FA-1) o 0 días (FA-2)
    Page --> Miembro: contador sin banner ni opciones
end

@enduml
```

---

### CU-005-003 — Salvar Racha con Puntos de Clan

```plantuml
@startuml CU-005-003

actor Miembro

box "Presentación" #F5F0FF
  participant "RachaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MiembroRepo
  participant "ClanRepository" as ClanRepo
  participant "RachaRepository" as RachaRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

alt SALVAR RACHA
    Miembro -> Page: SALVAR RACHA
    Page -> Svc: salvarRacha(miembroId)
    Svc -> MiembroRepo: buscarPorId(miembroId): Miembro (clan propio)
    Svc -> Svc: consultarRacha(miembroId) — debe estar EN_RIESGO
    Svc -> ClanRepo: descontarPuntos(clanDelMiembro, 50)
    ClanRepo -> DB: UPDATE clanes SET puntos_clan = puntos_clan - 50 WHERE id = clanId AND puntos_clan >= 50
    alt 0 filas: saldo insuficiente (FA-1)
        Svc --> Page: "Puntos de clan insuficientes"
        Page --> Miembro: botón deshabilitado + cómo ganar puntos
    else
        Svc -> RachaRepo: restaurar(miembroId, ahora)
        RachaRepo -> DB: UPDATE rachas SET estado = 'ACTIVA', ultimo_entrenamiento = ahora
        Svc --> Page: OK
        Page --> Miembro: redirige al Santuario: "¡Racha salvada!" y botón de racha sin alerta
    end
else DEJAR MORIR LA RACHA (FA-2)
    Miembro -> Page: DEJAR MORIR LA RACHA
    Page -> Svc: dejarMorirRacha(miembroId)
    Svc -> RachaRepo: crearOActualizar(dias = 0, ROTA)
    RachaRepo -> DB: UPDATE rachas SET dias_consecutivos = 0
    Page --> Miembro: contador en 0, sin cargo
end

@enduml
```

---

### CU-005-004 — Monitorear Estado de Fatiga Biométrica

```plantuml
@startuml CU-005-004

actor Miembro

box "Presentación" #F5F0FF
  participant "FatigaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "EntrenamientoRepository" as EntRepo
  participant "BiometricosRepository" as BioRepo
  participant "FatigaRepository" as FatigaRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: "Fatiga" en la barra lateral
Page -> Svc: cargarFatiga(miembroId): FatigaVista
Svc -> EntRepo: obtenerEstadisticas(miembroId) — CER de los últimos 7 días
Svc -> BioRepo: obtenerPorMiembro(miembroId) — peso corporal y fecha de actualización
Svc -> Svc: carga relativa = CER 7 días / peso (kg) → ÓPTIMA ≤ 40 · MODERADA ≤ 70 · ELEVADA ≤ 100 · CRÍTICA
Svc -> FatigaRepo: actualizarOCrear(miembroId, carga, nivel)
FatigaRepo -> DB: UPDATE / INSERT datos_fatiga
Svc -> EntRepo: listarDesde(lunes 00:00 ART) → CER por día (tendencia semanal)
Svc --> Page: FatigaVista
alt CRÍTICA
    Page --> Miembro: "ALTO RIESGO DE FATIGA", CARGA %, "! SOBRECARGA DETECTADA", PROTOCOLO "MANDATO" (intensidad 50 %, movilidad, hidratación)
else ÓPTIMA (FA-1)
    Page --> Miembro: "ESTADO ÓPTIMO" en verde y mensaje positivo
end
Page --> Miembro: TENDENCIA SEMANAL (hoy en naranja, días futuros punteados)
alt biometría con más de 90 días (FA-2)
    Page --> Miembro: advertencia de sincronización pendiente
end

@enduml
```

---

### CU-005-005 — Consultar Vitrina de Trofeos

```plantuml
@startuml CU-005-005

actor Miembro

box "Presentación" #F5F0FF
  participant "TrofeosPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
  participant "GuerraService" as Guerra
end box

box "Repositorios" #FFF3EB
  participant "TrofeoRepository" as TrofeoRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: "Trofeos" en la barra lateral
Page -> Svc: cargarTrofeos(miembroId): Trofeo[]
Svc -> TrofeoRepo: listarPorMiembro(miembroId)
TrofeoRepo -> DB: SELECT * FROM trofeos WHERE miembro_id = miembroId
DB --> TrofeoRepo: Trofeo[]
Page -> Guerra: obtenerHistorialBatallas(clanId) → victorias
Page --> Miembro: "VITRINA DE TROFEOS", "LOGROS DE COMBATE", VICTORIAS, rango, trofeo destacado y grilla
alt sin trofeos (FA-1)
    Page --> Miembro: "Aún no tienes trofeos. Participa en la Arena para comenzar tu historia."
end
alt clic en un trofeo (FA-2)
    Page --> Miembro: modal con fecha de obtención y condiciones cumplidas
end

@enduml
```

---

### CU-005-006 — Reclamar Beneficio de un Aliado Comercial

```plantuml
@startuml CU-005-006

actor Miembro

box "Presentación" #F5F0FF
  participant "BeneficiosPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "BeneficioRepository" as BenRepo
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: "Beneficios" en la barra lateral
Page -> Svc: cargarBeneficios(miembroId): BeneficioVista[]
Svc -> BenRepo: expirarVencidos(ahora)
BenRepo -> DB: UPDATE beneficios_aliado SET estado = 'EXPIRADO' WHERE fecha_vencimiento < ahora
Svc -> BenRepo: listar(miembroId) · suscripcionesVigentes(miembroId)
BenRepo -> DB: SELECT beneficios + aliado + reclamo del miembro · SELECT suscripciones activas
Svc -> Svc: estado por beneficio: DISPONIBLE · RECLAMADO · BLOQUEADO (rango) · EXPIRADO
Page --> Miembro: DESTACADO, FILTROS por categoría, vencimientos, bloqueados con el nivel requerido
alt BLOQUEADO (FA-1) o EXPIRADO (FA-2)
    Page --> Miembro: botón sin acción
else DESBLOQUEAR CÓDIGO / CANJEAR → / COPIAR CUPÓN / ACTIVAR OFERTA
    Miembro -> Page: acción del beneficio
    Page -> Svc: reclamarBeneficio(beneficioId, miembroId)
    Svc -> BenRepo: registrarReclamo(beneficioId, miembroId)
    BenRepo -> DB: INSERT INTO reclamo_beneficio (PK beneficio + miembro)
    opt tipo SUSCRIPCION
        Svc -> BenRepo: crearSuscripcion(miembroId, aliadoId, 30 días)
        BenRepo -> DB: INSERT INTO suscripcion_activa
    end
    Svc --> Page: código + URL del aliado
    Page --> Miembro: muestra el código / lo copia / abre la plataforma del aliado / "SUSCRIPCIÓN ACTIVA HASTA"
end

@enduml
```

---

### CU-005-007 — Gestionar Datos de Cuenta

```plantuml
@startuml CU-005-007

actor Miembro

box "Presentación" #F5F0FF
  participant "CuentaPage" as Page
end box

box "Servicios" #EBFBF0
  participant "PerfilService" as Svc
end box

box "Repositorios" #FFF3EB
  participant "MiembroRepository" as MiembroRepo
end box

box "Base de Datos" #F3F4F6
  database "SQL Server" as DB
end box

Miembro -> Page: /perfil/cuenta
alt GUARDAR CAMBIOS (nombre / email)
    Page -> Svc: actualizarCuenta(miembroId, nombre, email)
    Svc -> MiembroRepo: buscarPorEmail(email)
    alt email de otra cuenta (FA-1)
        Svc --> Page: "Este email ya está en uso."
    else
        Svc -> MiembroRepo: actualizarDatosCuenta(miembroId, nombre, email)
        MiembroRepo -> DB: UPDATE miembros SET nombre, email
        Page --> Miembro: "Datos actualizados."
    end
else CAMBIAR CONTRASEÑA → ACTUALIZAR CONTRASEÑA
    Page -> Svc: cambiarPassword(miembroId, actual, nueva, confirmación)
    alt actual incorrecta (FA-2)
        Svc --> Page: "Contraseña actual incorrecta."
    else nueva ≠ confirmación (FA-3)
        Svc --> Page: "Las contraseñas nuevas no coinciden." (se resaltan ambos campos)
    else
        Svc -> MiembroRepo: actualizarPassword(miembroId, BCrypt(nueva))
        MiembroRepo -> DB: UPDATE miembros SET password_hash
        Page --> Miembro: "Contraseña actualizada."
    end
end

@enduml
```
