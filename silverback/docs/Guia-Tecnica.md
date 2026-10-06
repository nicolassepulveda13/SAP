# SILVERBACK — Guía Técnica Completa

> Referencia para debugging, breakpoints y comprensión del stack. Organizada por sprint. Actualizada al 06/10/2026 (S1–S6).
> Cómo levantar el proyecto y correr los tests: `RESUMEN_GENERAL.md` en la raíz del repo.

---

## Stack general

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Next.js (App Router, Turbopack) | 16 |
| UI | React | 19 |
| Lenguaje frontend | TypeScript | 5 |
| Backend | ASP.NET Core Web API (Clean Architecture, 4 proyectos) | 9 |
| Lenguaje backend | C# | 13 |
| ORM | Entity Framework Core | 9 |
| Base de datos | SQL Server Express | 2022 |
| Auth | JWT (HS256, firmado en el backend, 7 días) | — |
| Sesión | Cookie HTTP-only `sb_token` | — |
| Docs de la API | OpenAPI + Scalar (`/scalar/v1`, solo Development) | — |
| Tests E2E | Playwright (`silverback/e2e/`) | 1.63 |

### Proyectos del backend (dependencias forzadas por el compilador)

```
SilverbackApi.Api       → Controllers, Program.cs (DI, JWT, OpenAPI, CORS)
  └─ SilverbackApi.Services   → lógica de negocio (interfaces + implementaciones)
       └─ SilverbackApi.Data       → AppDbContext, Repositories, Migrations
            └─ SilverbackApi.Domain     → Entidades y enums
```

Un controller no puede usar un repositorio directamente: siempre pasa por un service.

### Convenciones que conviene saber antes de tocar código

| Convención | Detalle | Por qué importa |
|---|---|---|
| Enums como texto | `HasConversion<string>()` en EF y `JsonStringEnumConverter` en la API | En la base y en el JSON se ven `"SILVERBACK"`, no `0` |
| **La API omite los `null`** | `JsonIgnoreCondition.WhenWritingNull` en `Program.cs` | Un campo `null` **no viene** en el JSON: en el front llega como `undefined`. Compará con `!= null` (doble igual), nunca con `!== null` |
| **Controllers devuelven DTOs** | Objetos anónimos o records con los campos necesarios | Devolver una entidad de EF serializa sus navegaciones: ciclos (500) y **fuga del `PasswordHash`**. Hay un test E2E que lo verifica |
| Rol y clan desde la base | `requireClan()` en el front, `ObtenerClanId()` en la API | El JWT puede estar desactualizado (cambio de rol, expulsión) |
| Comentarios `S<n>-Tema:` | Cada archivo dice en qué sprint se tocó y para qué | Sirve para rastrear un cambio hasta su sprint |

---

## Semana 1 — Autenticación y estructura base

### Frontend

#### `src/app/(auth)/login/page.tsx`
- **Componente**: `LoginPage` (Client Component — `"use client"`)
- **React**: `useActionState(login, undefined)` — hook de React 19 que liga el formulario a un Server Action
  - Devuelve `[state, action, pending]`
  - `state`: `{ error?: string } | undefined`
  - `action`: función que se pasa como `<form action={action}>`
  - `pending`: `boolean` — `true` mientras el Server Action está ejecutándose
- **Flujo**: usuario envía email+password → `login()` corre en el servidor → si ok, guarda JWT en cookie y redirige a `/santuario`
- **Breakpoint útil**: línea donde se renderiza `state?.error` para ver errores de auth

#### `src/app/actions/auth.ts`
- **`login(prevState, formData)`** — Server Action (`"use server"`)
  - Lee `email` y `password` del `FormData`
  - Llama `fetch` directo (sin `apiFetch`) a `POST /api/auth/login` porque aún no hay token en cookie
  - Si ok: llama `setToken(token)` y hace `redirect("/santuario")`
  - Si error: devuelve `{ error: "mensaje" }`
- **`logout()`** — Server Action: `deleteToken()` y `redirect("/login")`. Usado desde `<form action={logout}>` en el Santuario

#### `src/lib/session.ts`
- **`getToken()`** — lee la cookie `sb_token` (server-only)
- **`setToken(token)`** — persiste JWT en cookie HTTP-only, 7 días, `sameSite: "lax"`
- **`deleteToken()`** — borra la cookie (logout)
- Importa `"server-only"` — si se importa desde un Client Component, Next.js lanza error en build

#### `src/lib/api-client.ts`
- **`apiFetch<T>(path, options)`** — wrapper de `fetch` para el backend
  - Lee `sb_token` del cookie store e inyecta `Authorization: Bearer <token>`
  - Si el servidor responde con error, extrae el campo `error` del JSON y lanza `Error(mensaje)`
  - **S6-Fix:** si la respuesta no tiene cuerpo (204 NoContent) devuelve `undefined`. Antes hacía `res.json()` siempre y tiraba *"Unexpected end of JSON input"*: aceptar un desafío nunca funcionó desde la web
  - Todas las llamadas autenticadas usan esto — excepto las del flujo de onboarding con token preliminar

#### `src/middleware.ts`
- **`middleware(request)`** — corre antes de cada request (Next 16 avisa que la convención pasa a llamarse `proxy`; sigue funcionando)
- **Rutas públicas**: `/login`, `/onboarding`, `/api/`
- **Lógica** (estado al 06/10):
  1. Sin token + ruta protegida → `/onboarding/biometrics`
  2. Con token + `/login` → `/santuario`
  3. Con token + `/onboarding/biometrics` o `/archetype` → ya tiene cuenta, no se vuelve a registrar: `/santuario` si completó el onboarding, si no `/onboarding/matchmaking`
  4. Con token + `/onboarding/matchmaking` → **pasa** (lo usan expulsados y cuentas sin clan; la página redirige al Santuario si ya tiene clan)
  5. Con token + `onboarding_completado=false` + ruta protegida → `/onboarding/matchmaking`
  6. Ruta oculta (`lib/features.ts`) → `/santuario`
- **`decodeJwtPayload(token)`** — decodifica el payload del JWT (Base64url) **sin verificar firma**. Solo para leer `onboarding_completado`; el backend es quien verifica

### Backend

#### `SilverbackApi.Api/Controllers/AuthController.cs`
- **Ruta base**: `api/auth`
- **`Login(LoginRequest req)`** — `POST /api/auth/login`
  - Devuelve `{ token, miembro: { Id, Nombre, Email, Rol, Rango, Xp, Coins, ClanId } }`
  - Si falla: `401 Unauthorized` con `{ error: "mensaje" }`

#### `SilverbackApi.Services/AuthService.cs`
- **`Login(email, password)`** — busca miembro por email, verifica hash BCrypt, genera JWT
- **`GenerarToken(miembroId, rol, clanId, onboardingCompletado)`** — firma el JWT con `HS256`, expira en 7 días. Claims: ver la sección [JWT](#jwt--claims-y-uso)

#### `SilverbackApi.Api/Controllers/SilverbackControllerBase.cs`
- **Clase base** de todos los controllers autenticados
- **`ObtenerMiembroId()`** — lee `ClaimTypes.NameIdentifier` del JWT y lo parsea como `Guid`. Si es `null`, el controller devuelve `Unauthorized()`

---

## Semana 2 — Onboarding (3 pasos)

### Concepto: patrón "draft en cookie"

Los datos del registro se acumulan en la cookie `sb_onboarding` (JSON, TTL 30 min) a lo largo de los 3 pasos. La cuenta real se crea recién en el paso final cuando el usuario elige clan.

```
P1 (biometrics) → sb_onboarding = { nombre, email, password, edad, pesoKg, alturaCm, nivelExperiencia }
P2 (archetype)  → sb_onboarding += { arquetipo }
P3 (matchmaking)→ POST /registrar + POST /unirse|/clan → borra sb_onboarding, guarda sb_token
```

### Frontend

#### `src/app/onboarding/biometrics/page.tsx`
- **Componente**: `BiometricCalibrationPage` (Client Component), `useActionState(saveStep1, undefined)`
- **Validaciones server-side** (en `saveStep1`): edad 14-99, peso 30-300 kg, altura 100-250 cm
- Al éxito, `saveStep1` hace `redirect("/onboarding/archetype")`

#### `src/app/onboarding/archetype/page.tsx`
- **Componente**: `ArchetypeSelectorPage` (Client Component)
- `useState(selected)` + `useTransition()` para llamar `saveStep2(selected)` con un click (sin `<form>`)
- **Arquetipos**: id `VOLUMEN` / `DEFINIDO` / `ATLETICO`; la etiqueta visible de este último es **"ATLÉTICO"** (con tilde)

#### `src/app/actions/onboarding.ts`
- **`saveStep1` / `saveStep2`** — validan y guardan el draft; redirigen al paso siguiente
- **`getClanesDisponibles()`** — `GET /api/incorporacion/clanes` (clanes con menos de 20 miembros)
- **`joinClan` / `crearClan`** — paso final. Dos caminos:
  - **Con draft** (usuario nuevo): patrón "token preliminar" (abajo)
  - **Sin draft pero con sesión** (S6 — expulsado o cuenta sin clan): `conSesionActual()` llama `/unirse` o `/clan` con el token de la cookie y reemplaza `sb_token` por el token nuevo
- **`leerDraft()`** / **`guardarDraft()`** — helpers privados para la cookie `sb_onboarding`

#### `src/app/onboarding/matchmaking/page.tsx` + `MatchmakingClient.tsx`
- `page.tsx` (Server Component): si hay sesión y el dashboard dice que **ya tiene clan**, redirige a `/santuario`. Ojo: compara `d.clan != null` porque la API omite el `null`
- `MatchmakingClient` (Client Component): `useActionState(joinClan)` y `useActionState(crearClan)`; `useState(mostrarCrear)` para el formulario colapsable "Fundar mi propio clan"

### Concepto: patrón "token preliminar"

```
1. POST /api/incorporacion/registrar → tokenPreliminar (sin clan, onboarding=false)
2. POST /api/incorporacion/unirse | /clan (Bearer: tokenPreliminar) → tokenDefinitivo
3. setToken(tokenDefinitivo) → sb_token
4. cookieStore.delete("sb_onboarding")
5. redirect("/santuario")
```

El paso 2 usa `fetch` directo (no `apiFetch`) porque el token preliminar no está en la cookie todavía.

### Backend

#### `SilverbackApi.Api/Controllers/IncorporacionController.cs`
- **Ruta base**: `api/incorporacion`
- **`GET /clanes`** — público, clanes con menos de 20 miembros
- **`POST /registrar`** — público, crea miembro, devuelve token preliminar
- **`POST /clan`** — requiere token; crea clan y asigna SILVERBACK
- **`POST /unirse`** — requiere token; une al miembro al clan

#### `SilverbackApi.Services/IncorporacionService.cs`
- **`Registrar(...)`**: `BCrypt.HashPassword(password, 10)`; crea `Miembro`, `DatosBiometricos`, `Racha` (ACTIVA) y `DatosFatiga` (OPTIMA); token preliminar
- **`CrearClan(nombre, liderClanId)`**: crea `Clan`, asigna el clan y el rol `SILVERBACK`, completa el onboarding. Token con `SILVERBACK`, `clanId`, `onboarding=true`
- **`UnirseAClan(miembroId, clanId)`**: valida cupo (`CapacidadMaximaClan = 20` → "El clan está lleno."), asigna clan, fija rol `RECLUTA`, completa onboarding, incrementa el contador
- **`ValidarSinClan(miembroId)`** (S6): `CrearClan` y `UnirseAClan` rechazan a quien ya tiene clan → "Ya pertenecés a un clan." (400). Antes un miembro podía pasarse de clan por API y los contadores quedaban mal

---

## Semana 3 — Santuario, La Forja y creación de clan

### Frontend

#### `src/app/(app)/santuario/page.tsx`
- **Componente**: `ClanHubPage` (Server Component)
- **Datos**: `apiFetch<DashboardData>("/api/perfil/dashboard")` — miembro + estadísticas + clan
- **Panel del clan**: si tiene clan, `getPanelClan(clan.id)` → puntosClan, posicionRanking, cantidadMiembros
- Botones ARENA / FORJA / CHAT (`<Link>`); el badge del rango ya no linkea (Racha está oculta)
- **Logout**: `<form action={logout}>`

#### `src/app/(app)/santuario/forja/page.tsx`
- **Componente**: `ChallengeForgePage` (Server Component)
- **`requireClan()`** da `clanId` y el **rol desde la base**: `esSilverback = data.miembro.rol === "SILVERBACK"`
- **S4-Fix:** antes decodificaba el JWT y leía `payload.rol`, que **no existe** (el rol viaja como `…/claims/role`): el formulario de publicar no se le mostraba a nadie
- `Promise.all([getDesafios(clanId), getPanelClan(clanId)])` en paralelo; pasa `esSilverback` a `ForjaClient`

#### `src/app/(app)/santuario/forja/ForjaClient.tsx`
- **Props**: `{ clanId, panel, desafios, esSilverback }`
- `useActionState(aceptarDesafio)`, `useActionState(crearDesafio)`, `useState(mostrarCrear)`
- **Formulario crear desafío** (solo SILVERBACK): `descripcion` (max 200), `tier` (BRONCE/PLATA/ORO), `recompensaXp` (1–10.000), `fechaExpiracion` (date)
- **Tarjetas**: etiqueta `"<TIER> TIER"` con color por tier; si `aceptadoPorMi`, muestra "PROTOCOLO ASEGURADO"

#### `src/app/actions/santuario.ts`
- **`getDesafios`**, **`getPanelClan`**
- **`aceptarDesafio`** → `POST /{clanId}/desafios/{desafioId}/aceptar` (responde 204) → `revalidatePath("/santuario/forja")`
- **`crearDesafio`** → `POST /{clanId}/desafios`; valida campos y XP; convierte la fecha a ISO
- **`enviarMensaje`**, **`asignarRol`**, **`expulsarMiembro`** — ver S4

### Backend

#### `SilverbackApi.Api/Controllers/SantuarioController.cs`
- **Ruta base**: `api/santuario` — todo con `[Authorize]`
- **`GET /{clanId}`** — DTO `{ Id, Nombre, PuntosClan, CantidadMiembros }`
- **`GET /{clanId}/panel`** — `PanelClan`
- **`GET /{clanId}/desafios`** — `List<DesafioClanDto>` con `aceptadoPorMi`
- **`POST /{clanId}/desafios/{desafioId}/aceptar`** — `204 NoContent`; `409 Conflict` si ya aceptó
- **`POST /{clanId}/desafios`** — solo SILVERBACK (`403`); devuelve `201` con **DTO** (antes la entidad: ciclo de serialización + fuga del `PasswordHash`)

#### `SilverbackApi.Services/SantuarioService.cs`
- **`ListarDesafios(clanId, miembroId)`** — mezcla desafíos con las aceptaciones del miembro (`HashSet.Contains`)
- **`AceptarDesafio`** — `YaAceptoDesafio` → `InvalidOperationException` si repite; la PK compuesta lo garantiza igual a nivel base
- **`CrearDesafio`** — verifica `Rol.SILVERBACK`, crea con `EstadoDesafio.ACTIVO`
- **`ObtenerPanelClan`** — ranking = cantidad de clanes con más puntos + 1

---

## Semana 4 — Sala de Tácticas, Roles y Arena (registro + CER)

### Frontend

#### `src/lib/clan-context.ts`
- **`requireClan()`** (server-only): llama `/api/perfil/dashboard` y devuelve `{ data, clanId }`
  - Sin sesión válida → `redirect("/login")`; sin clan → `redirect("/onboarding/matchmaking")`
  - El rol sale de la base, no del JWT. Lo usan Tácticas, Roles y la Forja

#### `src/app/(app)/santuario/tacticas/page.tsx`
- Server Component: `requireClan()` + `GET /{clanId}/mensajes`; muestra los mensajes viejos arriba
- Mensajes `SISTEMA` como alerta; los propios alineados a la derecha
- Formulario → `enviarMensaje.bind(null, clanId)`
- **S6:** `<AutoRefresh cadaMs={5000} />` — ver S6

#### `src/app/(app)/santuario/roles/page.tsx`
- Server Component: `requireClan()` + `GET /{clanId}/miembros`
- Si es SILVERBACK: por cada **otro** miembro, un `<select name="rol">` + GUARDAR (`asignarRol.bind(null, clanId, m.id)`) y el botón de expulsar (`title="Expulsar del clan"`)
- Si no: solo lectura con el mensaje "Solo el líder del clan (SILVERBACK)…"

#### `src/app/(app)/arena/registrar/RegistrarClient.tsx` (CU-003-002)
- Spinners con `useState(peso)` (pasos de 5 kg) y `useState(reps)`; inputs `hidden` los sincronizan con el `FormData`
- Vista previa del CER calculada en el cliente con los mismos modificadores que el backend
- `useActionState(registrarEntrenamiento)` → pantalla de éxito con el CER del servidor y "+N XP"
- **S5:** carga por voz — ver S5

#### `src/app/(app)/arena/calculadora/page.tsx` (CU-003-003)
- Vista previa del CER con el arquetipo real del usuario (no registra nada)

### Backend

#### `SantuarioController` (agregados S4)
- **`GET /{clanId}/miembros`** — DTO `{ Id, Nombre, Rol, Rango, Xp }`
- **`GET/POST /{clanId}/mensajes`** — DTO `{ Id, Contenido, Tipo, EnviadoEn, MiembroId, AutorNombre }`
- **`PUT /{clanId}/miembros/{miembroId}/rol`** — body `{ rol }`; solo SILVERBACK del mismo clan (`403`)
- **`DELETE /{clanId}/miembros/{miembroId}`** — solo SILVERBACK del mismo clan (`403`)

#### `SantuarioService` (agregados S4)
- **`AsignarRol(clanId, liderId, miembroId, rol)`**
  - `liderId == miembroId` → "No podés cambiar tu propio rol." (400). Sin esto, por API el líder se bajaba el rol y el clan quedaba sin líder
  - Verifica líder SILVERBACK **del mismo clan** y que el destino pertenezca al clan
  - ⚠️ Brecha: todavía permite asignar `SILVERBACK` a otro miembro (CU-002-005 pide uno solo)
- **`ExpulsarMiembro(clanId, liderId, miembroId)`**
  - No permite auto-expulsión; deja al miembro con `ClanId = null` y rol `RECLUTA`; descuenta el contador
  - ⚠️ Brechas: sin confirmación, sin registro en `AdminHistorial`, sin protección para otro SILVERBACK

#### `SilverbackApi.Services/CerService.cs` (CU-003-003)
- `puntaje = round(pesoKg × repeticiones × modificador, 2)`
- Modificadores: `VOLUMEN 1.10`, `DEFINIDO 1.05`, `ATLETICO 1.00`

#### `SilverbackApi.Services/ArenaService.cs`
- **`RegistrarEntrenamiento(miembroId, ejercicio, pesoKg, repeticiones)`**
  1. `CerService.Calcular` con el arquetipo del miembro
  2. Inserta el `Entrenamiento`
  3. Si tiene clan: `GuerraService.AsegurarGuerraActiva()` → `ClanRepository.SumarCER` y `GuerraRepository.SumarCER` (ambos atómicos)
  4. **XP:** `floor(puntaje / 10)` → `MiembroRepository.ActualizarXP`
  5. `ActualizarRacha` (+1 si el último fue ayer; si no, vuelve a 1) y registro en `AdminHistorial`
  6. Devuelve `ResultadoCER { Puntaje, Modificador, Descripcion, XpGanado }`
- **`ObtenerHistorial(miembroId, pagina, ejercicio?)`** — 20 por página, filtro opcional por ejercicio
- **`ObtenerClanId(miembroId)`** — desde la base (lo usa el controller en vez del claim del JWT)

---

## Semana 5 — Registro por voz (CU-003-002)

### `src/lib/voz.ts` — `interpretarDictado(texto): { ejercicio?, peso?, reps? }`
Función pura (sin dependencias del navegador), fácil de probar.
- Normaliza: minúsculas, sin tildes, números en palabras → dígitos (`"cuarenta y cinco"` → `45`)
- Peso: número seguido de `kilos | kilogramos | kg`; reps: número seguido de `repeticiones | reps | veces`
- Sin unidades (`"sentadilla 80 10"`): primer número = peso, segundo = reps
- Decimales con coma (`"62,5 kg"`)
- Ejercicio: las palabras antes del primer número, sin muletillas (`hice`, `con`, `de`…), en mayúsculas

| Frase | Resultado |
|---|---|
| `sentadilla 80 kilos 10 repeticiones` | SENTADILLA · 80 · 10 |
| `press banca 62,5 kg 8 reps` | PRESS BANCA · 62.5 · 8 |
| `hice peso muerto con cien kilos cinco repeticiones` | PESO MUERTO · 100 · 5 |

### `RegistrarClient.tsx` (agregados S5)
- **Detección de soporte:** `useSyncExternalStore(sinSuscripcion, () => obtenerReconocimiento() !== null, () => null)`
  - `null` en el servidor (no hay `window`), `true/false` en el cliente. Se usa `useSyncExternalStore` y no `useEffect + setState` porque el lint de React 19 marca ese patrón (renders en cascada)
- **`obtenerReconocimiento()`** — `window.SpeechRecognition ?? window.webkitSpeechRecognition`. La Web Speech API **no está en `lib.dom`** de TypeScript: se tipó a mano lo mínimo (`Reconocimiento`)
- **`dictar()`** — `lang = "es-AR"`, una sola alternativa; `onresult` → `interpretarDictado` → muestra "Escuché: …" con **USAR ESTOS DATOS** / **DESCARTAR** (confirmación antes de completar)
- Errores mapeados: `not-allowed` (permiso), `no-speech`, `audio-capture`, `network`
- Sin soporte (Firefox): aviso y el botón no aparece. **El formulario manual está siempre visible**
- `useEffect(() => () => reconocimientoRef.current?.stop(), [])` — corta el micrófono al salir de la pantalla

---

## Semana 6 — Guerra Global e Historial de Batallas

### Reglas (decisiones de diseño, en `Modificacion-Carpeta.md` §4.5)
- **Ciclo semanal:** lunes 00:00 → lunes 00:00, **hora Argentina**. Clave ISO de semana: `"2026-S41"`; se muestra como `"SEMANA 41 · 2026"`
- **Sin jobs:** se abre y se cierra sola cuando alguien entra a la Arena, al Historial o registra un entrenamiento
- **Participan** los clanes con al menos un entrenamiento en la semana
- **Rival** = pareja consecutiva del ranking (1º vs 2º, 3º vs 4º…). Impar → el último va **SIN RIVAL**
- **Resultado:** en cada pareja gana el mejor posicionado (desempate por nombre de clan)

### Backend

#### `SilverbackApi.Services/GuerraService.cs` (`IGuerraService`)
- **`AsegurarGuerraActiva()`**
  1. `ListarActivasVencidas(ahora)` → `Finalizar(id)` a cada una (fija `Posicion` 1..N y estado `FINALIZADA`)
  2. `SemanaDe(ahora)` → clave y fecha de fin en UTC
  3. `BuscarPorSemana(clave)`; si no existe, `Crear(...)`. Si otra request la creó en paralelo, el índice único en `Semana` hace fallar la segunda → se vuelve a buscar
- **`ObtenerEstado(clanId?)`** → `EstadoGuerraDto { Semana, FechaInicio, FechaFin, DiasRestantes, Nuestro?, Rival?, Ranking (top 10), TotalClanes }`; `Progreso` = % del CER respecto del líder
- **`ObtenerHistorialBatallas(clanId)`** → `HistorialBatallasDto { TotalEnfrentamientos, Victorias, TasaVictoria, RachaActual, Batallas[] }`. `SIN_RIVAL` no cuenta para el total ni para la tasa
- **`ResolverZonaArgentina()`** — prueba `"America/Argentina/Buenos_Aires"` y `"Argentina Standard Time"`; si no está, UTC−3 fijo (Argentina no tiene horario de verano)

#### `SilverbackApi.Data/Repositories/GuerraRepository.cs`
- **`SumarCER(guerraId, clanId, cer)`** — atómico: `ExecuteUpdate` con `CerAcumulado = CerAcumulado + @cer`. Si el clan aún no participa inserta; si dos requests insertan a la vez, la PK compuesta rechaza la segunda y se reintenta como UPDATE
- **`Finalizar(guerraId)`** — ordena por CER desc y nombre de clan, asigna `Posicion`, marca `FINALIZADA`
- **`Ranking(guerraId)`** → `List<PosicionGuerra>`; **`ListarFinalizadasDeClan(clanId)`** para el historial

#### `ArenaController`
- **`GET /api/arena/guerra`** — `ObtenerClanId` (base) + `ObtenerEstado`. Siempre hay guerra (se abre sola)
- **`GET /api/arena/batallas`** — historial de batallas del clan (vacío si no tiene clan)
- **`GET /api/arena/historial?pagina=&ejercicio=`** — sesiones del miembro (DTO)
- **`POST /api/arena/entrenar`** — registra y devuelve `ResultadoCER` con `XpGanado`

### Frontend

#### `src/app/(app)/arena/page.tsx` — Guerra Global (CU-003-001)
- `TarjetaClan` para NUESTRA MANADA y CLAN RIVAL: nombre, CER, rango, barra de progreso. Sin datos: "Registrá un entrenamiento…" / "SIN RIVAL ASIGNADO"
- Se pasa `clan={guerra.nuestro ?? null}`: el campo puede no venir (la API omite los `null`)
- Top 10 con el clan propio resaltado y la cuenta regresiva

#### `src/app/(app)/arena/historial/page.tsx` — Historial (CU-003-004)
- `searchParams: Promise<{ ejercicio?: string }>` — en Next 16 los `searchParams` llegan como **Promise** (hay que hacer `await`)
- `Promise.all([getBatallas(), getHistorial(1, ejercicio)])`
- Arriba: estadísticas y batallas (VICTORIA verde, DERROTA rojo, SIN RIVAL gris). `b.rivalCer != null` — con `!== null` la página **rompía** en las batallas SIN RIVAL
- Abajo: "MIS SESIONES" con filtro por ejercicio (formulario GET a la misma ruta)

#### `src/components/ui/AutoRefresh.tsx`
- `router.refresh()` cada `cadaMs`, solo si la pestaña está visible. Usado en Tácticas (cada 5 s) en lugar de websockets

---

## Navegación y pantallas ocultas

### `src/lib/features.ts`
- **`RUTAS_OCULTAS`** = `["/evolucion", "/perfil"]` — paquete entero con subrutas (S7 y S8, todavía maqueta)
- **`PANTALLAS_OCULTAS`** = `[]` — rutas exactas
- **`estaOculta(pathname)`** — la usan el middleware (redirige a `/santuario`), `Topbar` y `Sidebar` (no muestran el link)
- Para mostrar un paquete cuando se implemente: sacarlo de la lista

### `src/app/(app)/layout.tsx` + `components/layout/Sidebar.tsx` / `Topbar.tsx`
- El layout (Server Component) trae nombre, rol y clan del dashboard y se los pasa al `Sidebar`
- `Sidebar` agrupa por paquete (Santuario, Arena…) y filtra las rutas ocultas
- `Topbar`: Santuario · Arena · Desafíos (sin botones decorativos)

---

## Base de datos — Tablas clave

| Tabla | Campos clave | Sprint |
|---|---|---|
| `Miembros` | Id, Nombre, Email (único), PasswordHash, Arquetipo, Rol, Rango, Xp, Coins, ClanId, OnboardingCompletado | S1–S2 |
| `Clanes` | Id, Nombre (único), LiderClanId, CantidadMiembros, PuntosClan | S1 |
| `DatosBiometricos` | Id, MiembroId, Edad, PesoKg, AlturaCm, NivelExperiencia | S1 |
| `Rachas` | Id, MiembroId, DiasConsecutivos, Estado, UltimoEntrenamiento | S1 |
| `DatosFatiga` | Id, MiembroId, CargaSemanal, NivelFatiga, ActualizadoEn | S1 |
| `DesafiosClan` | Id, ClanId, Descripcion, Tier, Estado, RecompensaXp, FechaExpiracion | S3 |
| `AceptacionesDesafio` | DesafioId, MiembroId (PK compuesta), AceptadoEn | S3 |
| `MensajesClan` | Id, ClanId, MiembroId, Contenido, Tipo, EnviadoEn | S4 |
| `Entrenamientos` | Id, MiembroId, Ejercicio, PesoKg, Repeticiones, PuntajeCer, FechaHora | S4 |
| `GuerrasGlobales` | Id, Semana (único), Estado, FechaFin | S6 |
| `ParticipacionesGuerra` | GuerraId, ClanId (PK compuesta), CerAcumulado, Posicion | S6 |
| `AdminHistorial` | Registro de eventos (por ahora, entrenamientos) | S4 |
| Items, Nodos, Cofres, Trofeos, AliadosComerciales… | Catálogos de Evolución y Perfil — **vacíos** | S7–S8 |

### Enums del dominio (`SilverbackApi.Domain/Enums.cs`)
- `Arquetipo`: `VOLUMEN`, `DEFINIDO`, `ATLETICO`
- `Rol`: `SILVERBACK`, `BETA`, `EXPLORADOR`, `RECLUTA`
- `Rango`: `BRONCE`, `PLATA`, `ORO`, `RANGO_S`
- `NivelExperiencia`: `PRINCIPIANTE`, `INTERMEDIO`, `AVANZADO`, `ELITE`
- `TierDesafio`: `BRONCE`, `PLATA`, `ORO` (como en el ER aprobado; "TITAN TIER" era solo texto de la maqueta)
- `EstadoDesafio`: `PENDIENTE`, `ACTIVO`, `COMPLETADO`, `EXPIRADO`
- `TipoMensaje`: `TEXTO`, `SISTEMA`, `DESAFIO`
- `EstadoGuerra`: `ACTIVA`, `FINALIZADA`
- `EstadoRacha`: `ACTIVA`, `EN_RIESGO`, `ROTA`
- `EstadoFatiga`: `OPTIMA`, `MODERADA`, `ELEVADA`, `CRITICA`

---

## Migraciones EF Core

### Cómo crear y aplicar
```powershell
cd silverback-api
dotnet ef migrations add NombreMigracion --project SilverbackApi.Data --startup-project SilverbackApi.Api
dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api
```

**NUNCA crear migraciones a mano** — sin el `.Designer.cs`, EF Core ignora la migración en el snapshot y el `Up()` no se ejecuta en `database update`.

Para chequear que el modelo y la base coinciden: `dotnet ef migrations has-pending-model-changes --project SilverbackApi.Data --startup-project SilverbackApi.Api`.

### Migraciones existentes
| Archivo | Qué hace |
|---|---|
| `20260829175829_InitialCreate` | Schema completo (22 entidades), enums como texto, PKs compuestas e índices únicos |
| `20260915122438_AceptacionDesafio` | Tabla `AceptacionesDesafio` (PK compuesta) + columna `OnboardingCompletado` en `Miembros` |

S4–S6 no necesitaron migraciones: las tablas de guerra ya existían desde `InitialCreate`.

---

## Conceptos React / Next aplicados

| Concepto | Dónde se usa | Para qué |
|---|---|---|
| `useActionState(action, init)` | Login, Biometría, Radar, Forja, Registrar | Liga formularios a Server Actions con estado de error y pending |
| `useTransition()` | Arquetipo | Llama Server Actions sin `<form>` manteniendo la UI responsive |
| `useSyncExternalStore()` | Registrar (soporte de voz) | Leer algo del navegador sin `setState` en un efecto y sin desajustes con el render del servidor |
| `useRef()` | Registrar | Guardar la instancia del reconocimiento de voz para poder cortarla |
| Server Component | Santuario, Forja, Tácticas, Roles, Arena, Historial, Radar, layout `(app)` | Data fetching con `apiFetch` en el servidor |
| Server Action (`"use server"`) | `auth.ts`, `onboarding.ts`, `santuario.ts`, `arena.ts` | Mutaciones y redirects en el servidor |
| `.bind(null, …)` en Server Actions | Tácticas, Roles | Pasar `clanId` / `miembroId` a la acción desde un `<form action>` |
| `revalidatePath()` | aceptar/crear desafío, enviar mensaje, roles, registrar | Invalida el cache para forzar re-fetch |
| `router.refresh()` | `AutoRefresh` | Re-renderiza los Server Components sin recargar la página |
| `searchParams` como Promise | Historial | Convención de Next 16 |
| `"server-only"` | `api-client.ts`, `session.ts`, `clan-context.ts` | Impide importarlos desde Client Components |
| Cookie HTTP-only | `sb_token`, `sb_onboarding` | Sesión segura sin acceso desde JS del cliente |
| Route Groups | `(auth)`, `(app)` | Layouts distintos sin afectar la URL |

---

## JWT — Claims y uso

.NET serializa los claims estándar con **URIs largas**, no con nombres cortos. Así se ve el payload real:

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "guid-del-miembro",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "SILVERBACK",
  "onboarding_completado": "true",
  "clanId": "guid-del-clan",
  "exp": 1790724816,
  "iss": "silverback-api",
  "aud": "silverback-app"
}
```

- **No existen** `sub` ni `rol` en el payload. Leer `payload.rol` da `undefined`: es lo que rompía el formulario de la Forja
- **Dónde se verifica**: solo en el backend (middleware JWT de ASP.NET Core)
- **Dónde se decodifica sin verificar**: solo el middleware de Next.js, y únicamente para `onboarding_completado`
- **Rol y `clanId`** pueden quedar viejos (cambio de rol, expulsión): leerlos siempre **de la base** (`requireClan()`, `ObtenerClanId()`)
- **`onboarding_completado`**: string `"true"`/`"false"`, no booleano
- **`clanId`**: no viene si el usuario no tiene clan

---

## Tests E2E

- `silverback/e2e/s4-s6.spec.ts` (13 tests) + `e2e/helpers.ts`; config en `playwright.config.ts`
- **Helpers:** `fundarClan`, `unirseAClan` (onboarding por la UI), `api(usuario, método, ruta, body)` (llamadas con el JWT del usuario), `sql(...)` (consultas con `sqlcmd`), `backupBase(...)`, `simularMicrofono(context, frase)` y `sinMicrofono(context)` (reemplazan `SpeechRecognition` con `addInitScript`)
- Cada corrida usa un sufijo único (`corrida`) para usuarios y clanes
- El test de cierre de semana renombra la guerra activa y le pone `FechaFin` en el pasado (con backup previo)
- El `webServer` de Playwright lanza `next` con `node` directo: con `npm run dev`, en Windows quedaba un `next dev` huérfano

---

## Debugging rápido

### El usuario queda en un loop entre onboarding y Santuario
1. `SELECT OnboardingCompletado, ClanId, Rol FROM Miembros WHERE Email = '...'`
2. Con sesión, `/onboarding/biometrics` y `/archetype` redirigen siempre (ya tiene cuenta); el que decide es el **Radar** según el dashboard
3. Si el Radar manda al Santuario a alguien sin clan, revisar que se compare `clan != null` (la API omite el `null`)

### Un campo "debería ser null" y el front lo trata como si tuviera valor
- La API usa `WhenWritingNull`: el campo **no viene**. `x !== null` da `true` con `undefined`. Usar `x != null`, `x ?? null` o tipos opcionales (`campo?: T | null`)

### Un endpoint responde 500 o el JSON trae `passwordHash`
- Se está devolviendo una entidad de EF. Proyectar a un DTO en el controller. Correr el test "Seguridad" de la suite E2E

### Un Server Action falla con *"Unexpected end of JSON input"*
- El endpoint responde sin cuerpo (204). `apiFetch` ya lo soporta; si se usa `fetch` directo, no hacer `res.json()` sobre un 204

### La API falla con `Invalid column name` / falta una tabla
1. `SELECT * FROM __EFMigrationsHistory` y comparar con `SilverbackApi.Data/Migrations/`
2. `dotnet ef migrations list` (las pendientes aparecen como `(Pending)`)
3. Si la base se armó con migraciones de otra copia del repo, hacer backup y alinear el historial (ver `RESUMEN_GENERAL.md`)

### El build de la API falla con "archivo en uso" / el pull no puede borrar DLLs
- La API sigue corriendo y bloquea `bin/`. Bajarla: `Get-NetTCPConnection -State Listen -LocalPort 5057 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

### El Server Action devuelve error de conexión
- `API_URL` en `silverback/.env.local` debe apuntar a `http://localhost:5057` y la API tiene que estar corriendo
- La API no conecta a la base: el connection string tiene que tener el nombre de **esta** PC

### `revalidatePath` no actualiza los datos
- La ruta de `revalidatePath` tiene que coincidir exactamente con la de la página
- Los fetch usan `cache: "no-store"`; si aun así no refresca, es el router cache del navegador (Ctrl+Shift+R)
