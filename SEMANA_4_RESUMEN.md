# Semana 4 — Estado real del proyecto + sincronización del repo

**Alumno:** Sepúlveda Nicolás — UAI, Ingeniería en Sistemas, 5to B — SAP 2026
**Fecha:** 22/09/2026
**Estado:** S1 ✅ · S2 ✅ · S3 ✅ · S4 ✅ (con Arena adelantada) · pendiente de commit

---

## ▶️ Cómo levantarlo (manual)

> Requisitos: SQL Server Express corriendo (servicio `SQL Server (SQLEXPRESS)`), .NET 9 SDK, Node 20+.
> Connection string actual: `DESKTOP-JQBGOKE\SQLEXPRESS` (en `silverback-api/SilverbackApi.Api/appsettings.json`).

Se necesitan **dos terminales** (PowerShell).

### Terminal 1 — API (.NET) → http://localhost:5057

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback-api
dotnet run --project SilverbackApi.Api --urls http://localhost:5057
```

Esperá a ver `Now listening on: http://localhost:5057`.

### Terminal 2 — Front (Next.js) → http://localhost:3000

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback
npm run dev
```

### Verificar que está todo bien

| Qué | URL | Respuesta esperada |
|---|---|---|
| API + base | http://localhost:5057/health | `{"status":"ok","db":"connected"}` |
| Front → API → base | http://localhost:3000/api/health | `{"status":"ok","api":{"status":"ok","db":"connected"}}` |
| App | http://localhost:3000 | Redirige al login u onboarding |
| **Docs API (Scalar)** | http://localhost:5057/scalar/v1 | Documentación interactiva de los 30 endpoints |
| OpenAPI JSON | http://localhost:5057/openapi/v1.json | Para importar en Postman/Insomnia |

**Probar endpoints con sesión en Scalar:**
1. Ejecutá `POST /api/auth/login` con `{ "email": "...", "password": "..." }` y copiá el `token`.
2. En Scalar, en *Authentication → Bearer*, pegá el token.
3. Ya podés llamar a cualquier endpoint con `[Authorize]`.

> Scalar y el JSON solo se publican en entorno **Development** (el default de `dotnet run`).

### Bajar todo

`Ctrl + C` en cada terminal.

Si quedó algo colgado y los puertos están ocupados:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,5057 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

> ⚠️ No uses `Stop-Process -Name node`: mata **todos** los procesos Node, incluido Claude Code.

### Arranque limpio (si algo se ve raro)

Con todo bajado:

```powershell
# Front: borrar la caché de Next
Remove-Item -Recurse -Force C:\Users\nico_\Documents\repos\SAP\silverback\.next

# API: limpiar el build
cd C:\Users\nico_\Documents\repos\SAP\silverback-api
dotnet clean
```

Y después levantar de nuevo las dos terminales.

### Tests E2E (Playwright)

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback
npm run test:e2e
npx playwright show-report   # reporte HTML con capturas y trazas de los fallos
```

- Si la API y el front no están corriendo, **los levanta Playwright** y los baja al terminar. Si ya están arriba, los reutiliza.
- Cada corrida crea sus propios usuarios y clanes (`e2e-…@silverback.local`, clanes `E2E Alfa/Beta …`), así que no depende de los datos que haya.
- Son 13 tests: incorporación (3 clanes), pantallas ocultas, Tácticas con refresco automático, Forja (publicar y aceptar), permisos de Roles (403 y 400), registro manual y por voz (micrófono simulado), sin soporte de voz, Guerra Global con rival y SIN RIVAL, cierre de semana con VICTORIA/DERROTA, expulsión y vuelta a otro clan, bloqueo de cambio de clan, y un test de seguridad que verifica que ningún endpoint exponga `passwordHash`.
- ⚠️ El test de cierre de semana **modifica la guerra activa** en la base (la da por vencida). Antes hace un backup en `…\MSSQL\Backup\silverback_pre_e2e_<id>.bak`.
- Si la base está en otra PC: `$env:E2E_SQL_SERVER = "OTRA-PC\SQLEXPRESS"; npm run test:e2e`.

### Si cambian las migraciones (después de un pull)

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback-api
dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api
```

---

## 🎯 Qué se muestra en la entrega

Solo se ven las pantallas **integradas con la API**. Las maquetadas sin integración están **ocultas, no borradas**: no aparecen en el menú, y si se entra por URL redirigen a `/santuario`.

| Paquete | Pantallas visibles | Estado |
|---|---|---|
| Incorporación | Login · Biometría · Arquetipo · Radar de Manadas (unirse / fundar) | ✅ Integrado |
| Santuario | Panel del Clan · La Forja · Sala de Tácticas · Roles | ✅ Integrado |
| Arena | Guerra Global · Registrar (manual + voz) · Calculadora CER · Historial de Batallas | ✅ Integrado en S5–S6 (05/10), verificado con E2E |
| Evolución / Bóveda | Evolución · Habilidades · Botín · Tienda | 🙈 Oculto (S7) |
| Perfil | Dashboard · Racha · Fatiga · Trofeos · Beneficios | 🙈 Oculto (S8) |

**Cómo volver a mostrar algo:** sacarlo de `silverback/src/lib/features.ts`. Ahí hay dos listas: `RUTAS_OCULTAS` (un paquete entero con sus subrutas) y `PANTALLAS_OCULTAS` (una ruta exacta). Las usan tanto el menú (Topbar y Sidebar) como el middleware.

**Bug corregido en La Forja:** el formulario "Publicar nueva directiva" (CU-002-007) **no se le mostraba a nadie**. La página leía `payload.rol` del JWT, pero .NET guarda el rol con la clave `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`, así que siempre daba `undefined`. Ahora el rol sale de la base con `requireClan()`, igual que en Tácticas y Roles. Verificado: un SILVERBACK ve el formulario y un BETA no.

Otros cambios de limpieza:
- **Sidebar:** muestra nombre, rol y clan reales (antes decía fijo "CLAN OVERLORD / Silverback Nivel 42"). Se agregaron los links a **Roles** y **Calculadora CER**, que no estaban en ningún lado.
- **Topbar:** se sacaron la campana, el engranaje y el avatar, que no hacían nada.
- **Santuario:** el badge del rango ya no linkea a `/perfil/racha`.

---

## 1. Resumen en 30 segundos

- La carpeta local estaba **11 commits atrás** de `origin/main`. Además había trabajo sin commitear hecho en paralelo sobre la base de S1.
- Se guardó todo en un **stash**, se bajó el remoto y se rescató **solo lo que no existía**: la parte de S4 Santuario II (Tácticas + Roles).
- El enum `TierDesafio` había quedado como `TITAN/ALPHA/BETA`. **Se volvió a `BRONCE/PLATA/ORO`**, que es lo que dice la carpeta aprobada.
- Se pusieron al día `PLAN_EJECUCION_TECNOLOGIA.md`, `Modificacion-Carpeta.md` (v1.1), `casos-de-uso.md`, `Guia-Tecnica.md` y `SETUP.md`.
- ✅ La base de datos local estaba desincronizada con las migraciones del repo: **se arregló** (con backup previo). Ver sección 7.1.

---

## 2. Qué se hizo en cada semana (según los commits)

| Semana | Commits | Qué se hizo | Estado |
|---|---|---|---|
| **S1** | `8de3d09` | Clean Architecture .NET 9 + Next.js 16, JWT en cookie `sb_token`, schema SQL Server | ✅ |
| **S2** | `e747068` | Onboarding de punta a punta: cookie borrador `sb_onboarding`, token preliminar, middleware que lee `onboarding_completado` | ✅ |
| **S3** | `e9e78e1` `29acc12` `bd68753` `1b227b3` `c543a5b` `434cbd4` `c581006` | Panel del clan (poder colectivo, ranking), La Forja (ver, aceptar y publicar desafíos), tabla `AceptacionDesafio`, **Fundar Manada**, `Guia-Tecnica.md`, `Modificacion-Carpeta.md` | ✅ |
| **S4 — Arena** | `5375df1` | Registrar entrenamiento + motor CER real, calculadora, historial, lectura de guerra activa. *(Estaba planificado para S5/S6: se adelantó)* | ✅ |
| **S4 — Santuario II** | *sin commitear (integrado hoy)* | Sala de Tácticas (chat), asignar rol, expulsar miembro | ✅ |

### Cómo queda el plan de 11 semanas

| # | Semana | Estado |
|---|---|---|
| S1–S4 | Base, Incorporación, Santuario I y II | ✅ |
| S5 | CER + voz | 🟡 CER y registro manual hechos. **Falta la voz (Web Speech API)** |
| S6 | Guerra Global + Historial | 🟡 Lectura hecha. **Falta el ciclo y cierre de batalla** |
| S7 | Evolución / Bóveda | ⏳ |
| S8 | Perfil (incluye CU-005-007 `/perfil/cuenta`, que todavía no existe) | ⏳ |
| S9–S11 | Entorno facultad, hardening, despliegue | ⏳ |

---

## 3. Qué pasó hoy con git (paso a paso)

1. **Diagnóstico:** `main` local en `8de3d09` (S1) contra `origin/main` en `5375df1`: 11 commits atrás.
2. **Stash:** `git stash push -u` → `stash@{0}` *"local pre-pull 2026-09-22"*. **Sigue guardado, no se borró.**
3. **Pull bloqueado:** la API corriendo tenía las DLLs de `bin/` tomadas, y el remoto dejó de trackear `bin/` y `obj/`. Se cortaron `SilverbackApi.Api` y los procesos `dotnet`, y se hizo `git pull --ff-only`.
4. **Análisis del stash:** era una **implementación paralela armada sobre S1**. Rehacía S2 y S3 por su cuenta, en una versión más floja (por ejemplo, clanes sin límite de capacidad), y además tenía **S4 Santuario II**, que en el remoto no existía.
5. **Merge selectivo:**

| Del stash | Decisión | Motivo |
|---|---|---|
| `AsignarRol` / `ExpulsarMiembro` (service + controller + interfaz) | ✅ Integrado | No existía en el remoto |
| Endpoints `GET /miembros` y `GET /mensajes` proyectados a DTO | ✅ Integrado | Evita ciclos de EF y no expone `PasswordHash` |
| `tacticas/page.tsx`, `roles/page.tsx` | ✅ Integrado | Reemplazan las maquetas |
| `src/lib/clan-context.ts` (`requireClan()`) | ✅ Integrado | Lee el **rol desde la base**, no del JWT (el rol puede cambiar después de emitido el token) |
| Actions `enviarMensaje`, `asignarRol`, `expulsarMiembro` | ✅ Agregadas a `actions/santuario.ts` | — |
| Onboarding, Forja, `IncorporacionService` | ❌ Descartado | Duplicaba S2/S3 del remoto |
| Migración `20260901205517_AddOnboardingCompletado` | ❌ Descartada | En el remoto esa columna la agrega `AceptacionDesafio` |

Resultado: el backend compila (0 errores) y el chequeo de tipos no da errores nuevos en el frontend.

---

## 4. El tema del enum del tier (BRONCE / PLATA / ORO)

**Qué pasó:** el commit de Arena (`5375df1`) cambió `TierDesafio` de `BRONCE/PLATA/ORO` a `TITAN/ALPHA/BETA`.

**De dónde salió "TITAN":** de la **maqueta original de La Forja** (pantalla P5, commit `99a25a4`). Cada tarjeta tenía una etiqueta de color decorativa: `TITAN TIER`, `ENDURANCE` y `COMPLETADO`. Los CU-002-002 y CU-002-003 de E1 describen esa maqueta ("el primer desafío muestra la etiqueta TITAN TIER en naranja…"). **No era un tipo de dato**, era texto del prototipo. El dominio formal siempre fue el del ER: `ENUM(BRONCE,PLATA,ORO)`.

**Qué se hizo:** se volvió todo a `BRONCE/PLATA/ORO`:

| Archivo | Cambio |
|---|---|
| `SilverbackApi.Domain/Enums.cs` | `TierDesafio { BRONCE, PLATA, ORO }` |
| `santuario/forja/ForjaClient.tsx` | Opciones del select y colores → ORO (naranja), PLATA (violeta), BRONCE (azul) |
| `docs/casos-de-uso.md` | CU-002-007: "BRONCE, PLATA u ORO" |
| `docs/Modificacion-Carpeta.md` | Idem en la ficha C-28 + nota de que el ER no cambia |
| `docs/Guia-Tecnica.md` | Enum de tier corregido (y de paso `Rol`, que decía `RECLUTA, ALPHA, SILVERBACK`) |

**¿Hace falta una migración?** No. Se consultó la base: hay **1 desafío y es `ORO`**, nunca se guardó ningún `TITAN`. El enum se guarda como texto, así que el schema tampoco cambia.

**Los CU aprobados que dicen "TITAN TIER" no se tocan:** describen la etiqueta visual del prototipo, y la regla es no modificar CU aprobados en E1.

---

## 5. Casos de uso — 28 en total

E1 aprobó 24 (C-01 a C-24). Después se agregaron 4, siguiendo la numeración:

| N.º | Código | Nombre | Sprint | Implementado |
|---|---|---|---|---|
| C-25 | CU-001-000 | Crear Cuenta / Iniciar Sesión | S2 | ✅ |
| C-26 | CU-005-007 | Gestionar Datos de Cuenta | S2 (documentado) | ❌ falta `/perfil/cuenta` → S8 |
| C-27 | CU-001-005 | Fundar una Manada | S3 | ✅ |
| C-28 | CU-002-007 | Publicar Desafío en La Forja | S3 | ✅ |

### CU implementados (con datos reales)

| Paquete | CU |
|---|---|
| Incorporación | 001-000 · 001-001 · 001-002 · 001-003 · 001-004 · 001-005 |
| Santuario | 002-001 · 002-002 · 002-003 · 002-004 · 002-005 · 002-006 · 002-007 |
| Arena | 003-002 · 003-003 (manual, sin voz) · 003-001 y 003-004 parciales |

---

## 6. Documentación — qué se agregó y qué se modificó

### Diagramas (según `Modificacion-Carpeta.md` v1.1)

| Artefacto | Cambio | Sprint |
|---|---|---|
| Diagrama ER | Nueva entidad `ACEPTACION_DESAFIO` (PK compuesta desafio_id + miembro_id) | S3 |
| Diagrama de Paquetes | Nuevo paquete `PKG_ACTIONS` (Server Actions de Next.js) | S2 |
| Secuencia CU-001-000 | Nueva | S2 |
| Secuencia CU-001-005 | Nueva | S3 |
| Secuencia CU-005-007 | Nueva | S2 |
| Secuencia CU-002-007 | **Nueva (hecha hoy, no existía en ningún lado)** | S3 |
| ER `DESAFIO.tier` | Se mantiene `ENUM(BRONCE,PLATA,ORO)`, sin cambio | — |

> Las 4 secuencias nuevas están **dentro de `Modificacion-Carpeta.md`**. Todavía no se pasaron a `secuencias-cu001-cu002.md` ni a `secuencias-cu005.md` (el mapa de inserción dice dónde va cada una).

### Archivos de docs tocados hoy

| Archivo | Qué cambió |
|---|---|
| `PLAN_EJECUCION_TECNOLOGIA.md` | S4 marcada completa con detalle de tareas; S5 y S6 🟡; discrepancias #1 (roles) y #4 (CER) resueltas; "24 CU" → "28 CU" |
| `docs/Modificacion-Carpeta.md` | v1.0 → **v1.1**: ficha completa de C-28, secuencia C-28, filas del mapa de inserción, decisiones de diseño S4 |
| `docs/casos-de-uso.md` | CU-002-007 con tier BRONCE/PLATA/ORO |
| `docs/Guia-Tecnica.md` | Enums `TierDesafio` y `Rol` corregidos |
| `SETUP.md` | Se sacó `npm run db:seed` (no existe). Ahora explica cómo crear datos de prueba desde la app |

### Decisiones de diseño tomadas en S4

| Tema | Decisión |
|---|---|
| Roles del clan | 4 roles: SILVERBACK / BETA / EXPLORADOR / RECLUTA. Solo SILVERBACK administra. El "Líder de Clan" del STFI = SILVERBACK |
| Modificadores CER | VOLUMEN 1.10 · DEFINIDO 1.05 · ATLÉTICO 1.00. El 1.15 del STFI no se usa |
| Expulsión | Desvincula (`ClanId = null`), baja a RECLUTA, descuenta del contador. No se permite la auto-expulsión |

---

## 7. ⚠️ Pendientes (en orden)

### 7.1 Base de datos desincronizada — ✅ RESUELTO (22/09)

La base de esta PC se armó con la migración de la copia paralela, no con la del repo:

| | En la base (`__EFMigrationsHistory`) | En el repo |
|---|---|---|
| Migraciones | `InitialCreate` + `20260901205517_AddOnboardingCompletado` | `InitialCreate` + `20260915122438_AceptacionDesafio` |
| Columna `Miembros.OnboardingCompletado` | ✅ existe | la agrega `AceptacionDesafio` |
| Tabla `AceptacionesDesafio` | ❌ **no existe** | la crea `AceptacionDesafio` |

Un `dotnet ef database update` **fallaba** porque intentaba agregar una columna que ya existía, y "Aceptar desafío" rompía porque faltaba la tabla.

**Cómo se arregló:**
1. Backup completo: `C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\silverback_pre_fix_2026-09-22.bak`
2. Se corrió este SQL dentro de una transacción (sin pérdida de datos):

```sql
USE silverback;
CREATE TABLE AceptacionesDesafio (
    DesafioId  uniqueidentifier NOT NULL,
    MiembroId  uniqueidentifier NOT NULL,
    AceptadoEn datetime2        NOT NULL,
    CONSTRAINT PK_AceptacionesDesafio PRIMARY KEY (DesafioId, MiembroId)
);
DELETE FROM __EFMigrationsHistory WHERE MigrationId = '20260901205517_AddOnboardingCompletado';
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT '20260915122438_AceptacionDesafio', ProductVersion
    FROM __EFMigrationsHistory WHERE MigrationId = '20260829175829_InitialCreate';
```

3. Verificación:
   - `dotnet ef migrations list` muestra `InitialCreate` y `AceptacionDesafio`, ninguna pendiente.
   - `has-pending-model-changes` responde "No changes".
   - `GET /health` devuelve `{"status":"ok","db":"connected"}`.

Si algo sale mal, se restaura con: `RESTORE DATABASE silverback FROM DISK = N'...\silverback_pre_fix_2026-09-22.bak' WITH REPLACE`

### 7.2 Connection string — ✅ RESUELTO

Esta PC es `DESKTOP-JQBGOKE`, pero `appsettings.json` apuntaba a `NICO-DESKTOP\SQLEXPRESS` (la otra PC). Ahora apunta a **`DESKTOP-JQBGOKE\SQLEXPRESS`**.

> Cuando trabajes desde la otra PC hay que volver a cambiarlo. Para no andar tocándolo, usá `localhost\SQLEXPRESS`, que funciona en las dos máquinas, o poné el valor de cada PC en `appsettings.Development.json`.

### 7.3 Borrar Prisma (quedó de cuando el stack era otro)

El borrado lo bloqueó el sistema de permisos, hay que hacerlo a mano:

```
git rm -r silverback/prisma silverback/prisma.config.ts
```

Y después sacar la línea `/src/generated/prisma` de `silverback/.gitignore`.

### 7.4 Commit

Nada de lo de hoy está commiteado. Propuesta de 3 commits:

1. `S4: CU-002-004/005/006 — Sala de Tácticas y Gestión de Roles`
2. `fix: TierDesafio vuelve a BRONCE/PLATA/ORO (dominio aprobado en carpeta)`
3. `docs: estado real S4 — PLAN, Modificacion-Carpeta v1.1, SETUP, limpieza Prisma`

Después de commitear, se puede descartar el stash: `git stash drop stash@{0}`.

### 7.5 Otros pendientes

- [ ] Probar S4 con 2 usuarios (SILVERBACK + RECLUTA): el RECLUTA tiene que recibir 403 al asignar rol o expulsar.
- [ ] Chat de Tácticas: agregar refresco automático (polling cada 3–5 s).
- [ ] Al miembro expulsado le sigue quedando el `clanId` en el JWT hasta que vuelva a loguearse.
- [ ] Pasar las 4 secuencias nuevas a `secuencias-cu001-cu002.md` / `secuencias-cu005.md`.
- [ ] Sumar S4 a `Guia-Tecnica.md` (hoy termina en S3 y dice que Arena es mock).
- [ ] `CLAUDE.md` (raíz) y `SPEC_silverback.md` siguen diciendo React Native / Supabase y 20 CU: están desactualizados.
- [ ] S5: voz. S6: ciclo de batalla. S8: `/perfil/cuenta` (CU-005-007).

---

## 8. Endpoints nuevos de S4

| Método | Ruta | Quién | Respuesta |
|---|---|---|---|
| GET | `/api/santuario/{clanId}/mensajes` | Miembro | `[{ id, contenido, tipo, enviadoEn, miembroId, autorNombre }]` |
| POST | `/api/santuario/{clanId}/mensajes` | Miembro | 201 |
| GET | `/api/santuario/{clanId}/miembros` | Miembro | `[{ id, nombre, rol, rango, xp }]` |
| PUT | `/api/santuario/{clanId}/miembros/{miembroId}/rol` | Solo SILVERBACK | 200 · 403 si no es líder del clan |
| DELETE | `/api/santuario/{clanId}/miembros/{miembroId}` | Solo SILVERBACK | 200 · 403 si no es líder · 400 si se intenta expulsar a sí mismo |
