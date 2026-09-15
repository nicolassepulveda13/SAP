# SILVERBACK — Guía Técnica Completa

> Referencia para debugging, breakpoints y comprensión del stack. Organizada por sprint.

---

## Stack general

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Next.js (App Router) | 16 |
| Lenguaje frontend | TypeScript | 5 |
| Backend | ASP.NET Core | 9 |
| Lenguaje backend | C# | 13 |
| ORM | Entity Framework Core | 9 |
| Base de datos | SQL Server | 2019+ |
| Auth | JWT (HS256, firmado en el backend) | — |
| Sesión | Cookie HTTP-only `sb_token` (7 días) | — |

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
- **`logout()`** — Server Action
  - Llama `deleteToken()` y hace `redirect("/login")`
  - Usado desde `<form action={logout}>` en el Santuario

#### `src/lib/session.ts`
- **`getToken()`** — lee la cookie `sb_token` (server-only)
- **`setToken(token)`** — persiste JWT en cookie HTTP-only, 7 días, `sameSite: "lax"`
- **`deleteToken()`** — borra la cookie (logout)
- Importa `"server-only"` — si se importa desde un Client Component, Next.js lanza error en build

#### `src/lib/api-client.ts`
- **`apiFetch<T>(path, options)`** — wrapper de `fetch` para el backend
  - Lee el token con `getToken()` e inyecta `Authorization: Bearer <token>`
  - Si el servidor responde con error, extrae el campo `error` del JSON y lanza `Error(mensaje)`
  - Todas las llamadas autenticadas usan esto — excepto las del flujo de onboarding con token preliminar

#### `src/middleware.ts`
- **`middleware(request)`** — corre en el Edge antes de cada request
- **Rutas públicas**: `/login`, `/onboarding`, `/api/`
- **Lógica**:
  1. Sin token + ruta protegida → redirect a `/onboarding/biometrics`
  2. Con token + `/login` → redirect a `/santuario`
  3. Con token + `onboarding_completado=false` + ruta protegida → redirect a `/onboarding/biometrics`
  4. Con token + `onboarding_completado=true` + `/onboarding/*` → redirect a `/santuario`
- **`decodeJwtPayload(token)`** — decodifica el payload del JWT (Base64url) sin verificar firma
  - Solo para leer claims en el edge; el backend es quien verifica la firma

### Backend

#### `SilverbackApi.Api/Controllers/AuthController.cs`
- **Clase**: `AuthController : ControllerBase`
- **Ruta base**: `api/auth`
- **`Login(LoginRequest req)`** — `POST /api/auth/login`
  - Llama `IAuthService.Login(email, password)`
  - Devuelve `{ token, miembro: { Id, Nombre, Email, Rol, Rango, Xp, Coins, ClanId } }`
  - Si falla: `401 Unauthorized` con `{ error: "mensaje" }`
- **Record**: `LoginRequest(string Email, string Password)` — deserializado desde el body JSON

#### `SilverbackApi.Services/AuthService.cs`
- Implementa `IAuthService`
- **`Login(email, password)`** — busca miembro por email, verifica hash BCrypt, genera JWT
- **`GenerarToken(miembroId, rol, clanId, onboardingCompletado)`** — firma el JWT con `HS256`
  - Claims incluidos: `sub` (miembroId), `rol`, `clanId` (puede ser null), `onboarding_completado` (string "true"/"false")
  - Expiración: 7 días

#### `SilverbackApi.Api/SilverbackControllerBase.cs`
- **Clase base** de todos los controllers autenticados
- **`ObtenerMiembroId()`** — lee el claim `sub` del JWT y lo parsea como `Guid`
  - Devuelve `Guid?` — si es null, el controller debe retornar `Unauthorized()`

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
- **Componente**: `BiometricCalibrationPage` (Client Component)
- **React**: `useActionState(saveStep1, undefined)`
- **Validaciones client-side**: campos requeridos con `required` en inputs
- **Validaciones server-side** (en `saveStep1`): edad 14-99, peso 30-300 kg, altura 100-250 cm
- **Navegación**: al éxito, `saveStep1` hace `redirect("/onboarding/archetype")`

#### `src/app/onboarding/archetype/page.tsx`
- **Componente**: `ArchetypeSelectorPage` (Client Component)
- **React**: `useState(selected)` para la tarjeta seleccionada + `useTransition()` para llamar el Server Action sin bloquear la UI
- **`handleConfirm()`** — llama `saveStep2(selected)` dentro de `startTransition(async () => {...})`
  - Patrón: cuando el Server Action no necesita un `<form>` sino un click, se usa `useTransition` en vez de `useActionState`
- **Arquétipos disponibles**: `VOLUMEN`, `DEFINIDO`, `ATLETICO`

#### `src/app/actions/onboarding.ts`
- **`saveStep1(prevState, formData)`** — Server Action
  - Valida y guarda draft en cookie
  - Redirige a `/onboarding/archetype`
- **`saveStep2(arquetipo)`** — Server Action (llamado directamente, no via useActionState)
  - Lee draft, agrega arquetipo, guarda, redirige a `/onboarding/matchmaking`
- **`getClanesDisponibles()`** — Server Action / función servidor
  - Llamada desde el Server Component padre de MatchmakingClient
  - Llama `GET /api/incorporacion/clanes`
- **`leerDraft()`** / **`guardarDraft()`** — helpers privados para leer/escribir la cookie `sb_onboarding`

#### `src/app/onboarding/matchmaking/MatchmakingClient.tsx`
- **Componente**: `MatchmakingClient({ clanes })` (Client Component)
- **Props**: `clanes: ClanDisponible[]` — pasadas desde el Server Component padre
- **React**:
  - `useActionState(joinClan, undefined)` → `[joinState, joinAction, joinPending]`
  - `useActionState(crearClan, undefined)` → `[createState, createAction, createPending]`
  - `useState(mostrarCrear)` — toggle del formulario colapsable "Fundar mi propio clan"
- **`joinClan(prevState, formData)`** — paso final para unirse a clan existente
- **`crearClan(prevState, formData)`** — paso final para fundar clan nuevo (S3)

### Concepto: patrón "token preliminar"

En el paso 3 del onboarding, se necesita autenticación para llamar a `/unirse` o `/clan`, pero el usuario aún no tiene token. El flujo es:

```
1. POST /api/incorporacion/registrar → tokenPreliminar (sin clan, onboarding=false)
2. POST /api/incorporacion/unirse | /clan (con Bearer: tokenPreliminar) → tokenDefinitivo
3. setToken(tokenDefinitivo) → sb_token guardado en cookie
4. cookieStore.delete("sb_onboarding")
5. redirect("/santuario")
```

El paso 2 usa `fetch` directo (no `apiFetch`) porque el token preliminar no está en la cookie todavía.

### Backend

#### `SilverbackApi.Api/Controllers/IncorporacionController.cs`
- **Clase**: `IncorporacionController : SilverbackControllerBase`
- **Ruta base**: `api/incorporacion`
- **`ClanesDisponibles()`** — `GET /clanes` — público, devuelve clanes con menos de 20 miembros
- **`Registrar(RegistrarRequest)`** — `POST /registrar` — público, crea miembro, devuelve token preliminar
- **`CrearClan(CrearClanRequest)`** — `POST /clan` — requiere token preliminar; crea clan y asigna SILVERBACK
- **`UnirseAClan(UnirseRequest)`** — `POST /unirse` — requiere token preliminar; une al miembro al clan
- **Records**: `RegistrarRequest`, `CrearClanRequest(string Nombre)`, `UnirseRequest(Guid ClanId)`

#### `SilverbackApi.Services/IncorporacionService.cs`
- **Clase**: `IncorporacionService : IIncorporacionService`
- **`Registrar(...)`**:
  - `BCrypt.Net.BCrypt.HashPassword(password, 10)` — hash con salt work factor 10
  - Crea `Miembro`, `DatosBiometricos`, `Racha` (estado ACTIVA), `Fatiga` (estado OPTIMA)
  - `authService.GenerarToken(miembro.Id, miembro.Rol.ToString(), null, false)` → token preliminar
- **`CrearClan(nombre, liderClanId)`**:
  - Crea `Clan`, actualiza `MiembroId.ClanId`, actualiza rol a `Rol.SILVERBACK`
  - `miembroRepo.CompletarOnboarding(liderClanId)` — marca `OnboardingCompletado = true`
  - Token con `rol=SILVERBACK, clanId=clan.Id, onboardingCompletado=true`
- **`UnirseAClan(miembroId, clanId)`**:
  - Actualiza `ClanId` del miembro, llama `CompletarOnboarding`
  - Token con `rol=RECLUTA, clanId, onboardingCompletado=true`

---

## Semana 3 — Santuario, La Forja y creación de clan

### Pantallas disponibles (funcionales vs mock)

| Pantalla | Ruta | Estado S3 | Descripción |
|---|---|---|---|
| P1 — Calibración Biométrica | `/onboarding/biometrics` | ✅ Funcional | Registro paso 1 |
| P2 — Selector de Arquetipo | `/onboarding/archetype` | ✅ Funcional | Registro paso 2 |
| P3 — Radar de Manadas | `/onboarding/matchmaking` | ✅ Funcional | Registro paso 3 + fundar clan |
| P4 — Clan Hub / Santuario | `/santuario` | ✅ Funcional | Hub principal, panel clan |
| P5 — Arena Desafíos / La Forja | `/santuario/forja` | ✅ Funcional | Ver + aceptar + crear desafíos |
| Login | `/login` | ✅ Funcional | Autenticación |
| Arena | `/arena` | ⚠️ Mock (link existe, ruta no implementada) | — |
| Chat / Tácticas | `/santuario/tacticas` | ⚠️ Mock | — |
| Perfil / Racha | `/perfil/racha` | ⚠️ Mock | — |

### Frontend

#### `src/app/(app)/santuario/page.tsx`
- **Componente**: `ClanHubPage` (Server Component — sin `"use client"`)
- **Datos**: `apiFetch<DashboardData>("/api/perfil/dashboard")` — miembro + estadísticas + clan
- **Panel clan**: si el usuario tiene `clan`, llama `getPanelClan(clan.id)` → muestra puntosClan, posicionRanking, cantidadMiembros
- **Acciones de navegación**: botones ARENA / FORJA / CHAT son `<Link>` de Next.js
- **Logout**: `<form action={logout}>` — Server Action, no necesita JS del cliente para funcionar

#### `src/app/(app)/santuario/forja/page.tsx`
- **Componente**: `ChallengeForgePage` (Server Component)
- **`decodeJwtPayload(token)`** — función local, misma lógica que en el middleware
  - Lee `clanId` y `rol` del JWT sin llamar al backend
  - `const esSilverback = payload?.rol === "SILVERBACK"`
- **Data fetching**: `Promise.all([getDesafios(clanId), getPanelClan(clanId)])` — en paralelo
- Pasa `esSilverback` a `ForjaClient` como prop

#### `src/app/(app)/santuario/forja/ForjaClient.tsx`
- **Componente**: `ForjaClient` (Client Component)
- **Props**: `{ clanId, panel, desafios, esSilverback }`
- **React**:
  - `useActionState(aceptarDesafio, undefined)` → `[aceptarState, aceptarAction, aceptarPending]`
  - `useActionState(crearDesafio, undefined)` → `[crearState, crearAction, crearPending]`
  - `useState(false)` → `mostrarCrear` — toggle para el formulario de crear desafío
- **Formulario crear desafío**: visible solo si `esSilverback === true`
  - Campos: `descripcion` (text, max 200), `tier` (select: TITAN/ALPHA/BETA), `recompensaXp` (number 1-10000), `fechaExpiracion` (date)
  - `<input type="hidden" name="clanId" value={clanId} />` — el Server Action lee esto del FormData
- **Tarjetas de desafío**: si `d.aceptadoPorMi` muestra "PROTOCOLO ASEGURADO" (texto tachado) en vez del botón

#### `src/app/actions/santuario.ts`
- **`getDesafios(clanId)`** — llama `GET /api/santuario/{clanId}/desafios`
- **`getPanelClan(clanId)`** — llama `GET /api/santuario/{clanId}/panel`
- **`aceptarDesafio(prevState, formData)`** — `POST /api/santuario/{clanId}/desafios/{desafioId}/aceptar`
  - Después de éxito: `revalidatePath("/santuario/forja")` para invalidar el cache de Next.js
- **`crearDesafio(prevState, formData)`** — `POST /api/santuario/{clanId}/desafios`
  - Validaciones: todos los campos requeridos, XP entre 1 y 10.000
  - Convierte `fechaExpiracion` a ISO string antes de enviarlo
  - Después de éxito: `revalidatePath("/santuario/forja")`

### Backend

#### `SilverbackApi.Api/Controllers/SantuarioController.cs`
- **Clase**: `SantuarioController : SilverbackControllerBase`
- **Ruta base**: `api/santuario` — todo requiere `[Authorize]`
- **`ListarDesafios(clanId)`** — `GET /{clanId}/desafios`
  - Lee `miembroId` via `ObtenerMiembroId()`
  - Devuelve `List<DesafioClanDto>` con campo `aceptadoPorMi`
- **`AceptarDesafio(clanId, desafioId)`** — `POST /{clanId}/desafios/{desafioId}/aceptar`
  - Devuelve `204 NoContent`; `409 Conflict` si ya aceptó
- **`CrearDesafio(clanId, CrearDesafioRequest)`** — `POST /{clanId}/desafios`
  - Si no es SILVERBACK: `403 Forbidden` (via `UnauthorizedAccessException` del service)
  - Devuelve `201 Created` con el desafío creado
- **`ObtenerPanel(clanId)`** — `GET /{clanId}/panel`

#### `SilverbackApi.Services/SantuarioService.cs`
- **Clase**: `SantuarioService : ISantuarioService`
- **`ListarDesafios(clanId, miembroId)`**:
  - `santuarioRepo.ListarDesafios(clanId)` → todos los desafíos del clan
  - `santuarioRepo.ObtenerAceptacionesMiembro(clanId, miembroId)` → IDs de desafíos aceptados
  - Mezcla ambos para calcular `aceptadoPorMi` como `HashSet.Contains(d.Id)`
- **`AceptarDesafio(clanId, desafioId, miembroId)`**:
  - `santuarioRepo.YaAceptoDesafio(desafioId, miembroId)` → si true, lanza `InvalidOperationException`
- **`CrearDesafio(clanId, silverbackId, ...)`**:
  - Verifica `miembro.Rol != Rol.SILVERBACK` → lanza `UnauthorizedAccessException`
  - Crea `DesafioClan` con `Estado = EstadoDesafio.ACTIVO`
- **`ObtenerPanelClan(clanId)`**:
  - `clanRepo.ObtenerRanking(clanId)` → posición en ranking por `PuntosClan`
  - Devuelve `PanelClan(nombre, puntosClan, cantidadMiembros, ranking)`

---

## Base de datos — Tablas clave

| Tabla | Campos clave | Sprint |
|---|---|---|
| `Miembros` | Id, Nombre, Email, PasswordHash, Arquetipo, Rol, Rango, Xp, Coins, ClanId, OnboardingCompletado | S1+S2 |
| `Clanes` | Id, Nombre, LiderClanId, CantidadMiembros, PuntosClan | S1 |
| `DatosBiometricos` | Id, MiembroId, Edad, PesoKg, AlturaCm, NivelExperiencia | S1 |
| `Rachas` | MiembroId, DiasConsecutivos, Estado, UltimoRegistro | S1 |
| `FatigaAcumulada` | MiembroId, Nivel, Estado | S1 |
| `DesafiosClan` | Id, ClanId, Descripcion, Tier, Estado, RecompensaXp, FechaExpiracion | S3 |
| `AceptacionesDesafio` | DesafioId, MiembroId (PK compuesta) | S3 |
| `MensajesClan` | Id, ClanId, MiembroId, Contenido, FechaEnvio | S3 |

### Enums del dominio
- `Arquetipo`: `VOLUMEN`, `DEFINIDO`, `ATLETICO`
- `Rol`: `RECLUTA`, `ALPHA`, `SILVERBACK`
- `Rango`: varía según XP
- `NivelExperiencia`: `PRINCIPIANTE`, `INTERMEDIO`, `AVANZADO`, `ELITE`
- `TierDesafio`: `TITAN`, `ALPHA`, `BETA`
- `EstadoDesafio`: `ACTIVO`, `EXPIRADO`
- `EstadoRacha`: `ACTIVA`, `ROTA`
- `EstadoFatiga`: `OPTIMA`, `MODERADA`, `ALTA`, `CRITICA`

---

## Migraciones EF Core

### Cómo crear migraciones
```powershell
# Siempre desde la carpeta del proyecto Data
cd silverback-api/SilverbackApi.Data
dotnet ef migrations add NombreMigracion --startup-project ../SilverbackApi.Api
dotnet ef database update --startup-project ../SilverbackApi.Api
```

**NUNCA crear migraciones a mano** — sin el `.Designer.cs`, EF Core ignora la migración en el snapshot y el `Up()` no se ejecuta en `database update`.

### Migraciones existentes
| Archivo | Qué hace |
|---|---|
| `20260xxx_InitialCreate` | Schema base: Miembros, Clanes, DatosBiometricos, Rachas, FatigaAcumulada, MensajesClan |
| `20260915122438_AceptacionDesafio` | Agrega tabla `AceptacionesDesafio` (PK compuesta) + columna `OnboardingCompletado` en `Miembros` |

---

## Conceptos React aplicados

| Concepto | Dónde se usa | Para qué |
|---|---|---|
| `useActionState(action, init)` | LoginPage, BiometricCalibration, MatchmakingClient, ForjaClient | Liga formularios a Server Actions con estado de error y pending |
| `useTransition()` | ArchetypeSelectorPage | Llama Server Actions sin `<form>` manteniendo la UI responsive |
| `useState()` | MatchmakingClient, ForjaClient | Toggle para formularios colapsables |
| Server Component | ClanHubPage, ChallengeForgePage, matchmaking/page.tsx | Data fetching con `apiFetch` en el servidor, sin JS extra al cliente |
| Server Action (`"use server"`) | auth.ts, onboarding.ts, santuario.ts | Mutaciones y redirects que corren en el servidor |
| `revalidatePath()` | aceptarDesafio, crearDesafio | Invalida el cache de Next.js para forzar re-fetch de los desafíos |
| `"server-only"` | api-client.ts, session.ts | Impide que se importen en Client Components (error en build) |
| Cookie HTTP-only | `sb_token`, `sb_onboarding` | Sesión segura sin acceso desde JS del cliente |
| Route Groups | `(auth)`, `(app)` | Agrupación sin afectar la URL; permite layouts distintos por grupo |

---

## JWT — Claims y uso

```json
{
  "sub": "guid-del-miembro",
  "rol": "SILVERBACK",
  "clanId": "guid-del-clan",
  "onboarding_completado": "true",
  "exp": 1234567890
}
```

- **Dónde se verifica**: solo en el backend (ASP.NET Core JWT middleware)
- **Dónde se decodifica sin verificar**: middleware de Next.js + `forja/page.tsx` (para leer claims rápido en el edge)
- **`onboarding_completado`**: string "true"/"false" (no booleano) — quirk del JWT estándar
- **`clanId`**: puede ser `null` si el usuario no completó el onboarding

---

## Debugging rápido

### El usuario queda atrapado en onboarding loop
1. Verificar que `OnboardingCompletado = 1` en SQL: `SELECT OnboardingCompletado, ClanId FROM Miembros WHERE Email = '...'`
2. Verificar que el JWT en `sb_token` tiene `onboarding_completado: "true"` (decodificar en jwt.io)
3. Si el campo en DB está bien pero el token no, el usuario necesita hacer logout y login de nuevo

### La API falla con `Invalid column name`
1. Verificar migraciones aplicadas: `SELECT * FROM __EFMigrationsHistory`
2. Si falta `AceptacionDesafio`: `dotnet ef database update` desde `SilverbackApi.Data`
3. Si hay migraciones manuales sin `.Designer.cs`, eliminarlas y consolidar en la migración anterior

### El Server Action devuelve error de CORS / conexión
- Verificar que `API_URL` en `.env.local` apunta al backend correcto (default: `http://localhost:5057`)
- Verificar que el backend está corriendo: `dotnet run --project silverback-api/SilverbackApi.Api`

### `revalidatePath` no actualiza los datos
- Verificar que la ruta en `revalidatePath("/santuario/forja")` coincide exactamente con la ruta de la página
- Los Server Components hacen fetch con `cache: "no-store"` — si aun así no refresca, es un problema de router cache del navegador (Ctrl+Shift+R)
