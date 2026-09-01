# Semana 1 — Arquitectura Base: Clean Architecture + Auth JWT + Schema SQL Server

**Alumno:** Sepúlveda Nicolás — UAI, Ingeniería en Sistemas, 5to B — SAP 2026  
**Fecha de cierre:** 01/09/2026  
**Estado:** ✅ COMPLETA

---

## Qué se construyó

### Decisión de arquitectura (cambio consciente respecto al plan original)

El plan original indicaba Next.js 14 full-stack (BFF). Se migró a **Clean Architecture con dos servidores separados**:

| Componente | Tecnología | Puerto |
|---|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind | 3000 |
| Backend API | ASP.NET Core 9 Web API | 5057 |
| Base de datos | SQL Server (NICO-DESKTOP\SQLEXPRESS) | — |

**Justificación (para presentar al profesor):** separación de contratos HTTP explícita, debugging con Swagger, deployabilidad independiente, y el compilador de C# enforcea las dependencias entre capas (Controllers no pueden importar Repositories directamente).

---

### 1. Backend — `silverback-api/` (ASP.NET Core 9, Clean Architecture)

**4 proyectos con dependencias compilador-enforced:**

```
SilverbackApi.Domain     ← Entidades (16 modelos) + 17 enums
SilverbackApi.Data       ← EF Core 9, AppDbContext, 14 Repositories
SilverbackApi.Services   ← 6 Services + interfaces + CerService
SilverbackApi.Api        ← 6 Controllers + Program.cs + JWT config
```

**Schema SQL Server migrado:** 22 entidades, enums como strings (`HasConversion<string>()`), precisiones decimales, PKs compuestas, índices únicos, restricciones de cascada.

**Autenticación:** JWT Bearer (HS256, 7 días), cookie HTTP-only `sb_token`. Claims: `NameIdentifier`, `Role`, `clanId`, `onboarding_completado`.

**Endpoints disponibles:**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check con ping a SQL Server |
| POST | `/api/auth/login` | Login → devuelve JWT |
| POST | `/api/incorporacion/registrar` | Registro completo → devuelve JWT (`onboarding = false`) |
| POST | `/api/incorporacion/unirse` | Unirse a clan → devuelve JWT (`onboarding = true`) |
| POST | `/api/incorporacion/clan` | Crear clan |
| GET | `/api/perfil/dashboard` | Dashboard del usuario autenticado |
| GET | `/api/perfil/racha` | Racha actual |
| GET | `/api/perfil/fatiga` | Estado de fatiga |
| GET | `/api/arena/guerra` | Guerra global activa |
| POST | `/api/arena/entrenar` | Registrar entrenamiento + calcula CER |
| GET | `/api/arena/historial` | Historial de entrenamientos |

**Motor CER:** `CER = Peso × Repeticiones × Modificador_Arquetipo`

| Arquetipo | Modificador |
|---|---|
| VOLUMEN (El Gorila) | × 1.10 |
| DEFINIDO (La Pantera) | × 1.05 |
| ATLÉTICO (El Chimpancé) | × 1.00 |

---

### 2. Frontend — `silverback/` (Next.js 16)

**Patrón:** Server Components leen datos del API vía `apiFetch<T>()`. Server Actions manejan mutaciones (login, logout).

**Archivos clave:**
- `src/lib/api-client.ts` — lee `sb_token` del cookie store del servidor, inyecta `Authorization: Bearer`
- `src/lib/session.ts` — manejo de cookie HTTP-only (`sb_token`)
- `src/middleware.ts` — protege rutas: sin token → `/login`, con token en ruta de auth → `/santuario`
- `src/app/actions/auth.ts` — Server Actions de login y logout
- `src/app/(app)/santuario/page.tsx` — dashboard real con datos del API

**Pantalla funcional:** `/santuario` muestra nombre, rango, XP, sesiones de la semana y clan del usuario autenticado.

---

### 3. Mejoras de diseño (codebase-design skill)

| Problema | Solución |
|---|---|
| `CerService` era estático, no inyectable | Convertido a `ICerService` registrado en DI |
| `ObtenerMiembroId()` duplicado en 5 controllers | Extraído a `SilverbackControllerBase` |
| `dal.ts` era módulo superficial sin uso | Eliminado |

---

### 4. Documentación TFI actualizada (cambios conscientes)

| Doc | Cambio |
|---|---|
| `diagrama-paquetes.md` | Reescrito: dos nodos (.NET + Next.js), SQL Server |
| `diagrama-componentes.md` | Actualizado con justificación de arquitectura separada |
| `diagrama-clases.md` | Labels de capa actualizados (Next.js / ASP.NET Core) |
| `PLAN_EJECUCION_TECNOLOGIA.md` | Stack corregido, S1 marcado ✅ completa |
| `clases-dominio/presentacion/servicios/repositorios.md` | Nombres de proyecto .NET agregados |
| `casos-de-uso.md` | **CU-001-000** (Crear Cuenta/Login) y **CU-005-007** (Gestionar Cuenta) agregados |
| `mapa-de-navegacion.md` | P0 (Login) agregado al flujo, ROOT → P0 → P1 o P4 |

---

## Cómo levantarlo para mostrarlo

### Requisitos previos
- .NET 9 SDK
- SQL Server Express en `NICO-DESKTOP\SQLEXPRESS` (Windows Auth)
- Node.js 20+

### Arrancar el backend

```bash
cd silverback-api/SilverbackApi.Api

# Primera vez — aplicar migraciones
dotnet ef database update --project ../SilverbackApi.Data

# Correr la API
dotnet run
# → http://localhost:5057
# → http://localhost:5057/openapi/v1.json  (Swagger)
```

### Arrancar el frontend

```bash
cd silverback
npm install
npm run dev
# → http://localhost:3000
```

### Flujo de demo (golden path)

```bash
# 1. Health check (verificar que API + DB levantan)
curl http://localhost:5057/health

# 2. Registrar usuario (devuelve JWT con onboarding_completado=false)
curl -X POST http://localhost:5057/api/incorporacion/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Gorila Alpha",
    "email": "demo@silverback.com",
    "password": "Test1234!",
    "arquetipo": "ATLETICO",
    "edad": 25,
    "pesoKg": 85.5,
    "alturaCm": 178,
    "nivelExperiencia": "INTERMEDIO"
  }'
# → { id, nombre, email, token }

# 3. Login (devuelve JWT con onboarding_completado=true si ya se unió a clan)
curl -X POST http://localhost:5057/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@silverback.com","password":"Test1234!"}'
# → { token }

# 4. Dashboard (reemplazar <TOKEN> con el JWT recibido)
curl http://localhost:5057/api/perfil/dashboard \
  -H "Authorization: Bearer <TOKEN>"
# → { miembro: {nombre, rango, xp, coins}, estadisticas, clan }

# 5. Registrar entrenamiento
curl -X POST http://localhost:5057/api/arena/entrenar \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"ejercicio":"Sentadilla","pesoKg":100,"repeticiones":5}'
# → { puntaje: 500.00, multiplicador: 1.00, ... }
```

### Mostrar en el navegador

1. Ir a `http://localhost:3000`
2. Si no hay sesión → redirige a `/login`
3. Iniciar sesión con las credenciales del seed
4. → Redirige a `/santuario` con datos reales de SQL Server

---

## Estado del modelo de dominio clave

### `Miembro` — campos principales

| Campo | Tipo | Default | Notas |
|---|---|---|---|
| `Id` | Guid | `NewGuid()` | PK |
| `Nombre` | string | — | — |
| `Email` | string | — | Unique index |
| `PasswordHash` | string | — | BCrypt cost 10 |
| `Rol` | enum | `RECLUTA` | SILVERBACK / BETA / EXPLORADOR / RECLUTA |
| `Rango` | enum | `BRONCE` | BRONCE / PLATA / ORO / RANGO_S |
| `Arquetipo` | enum? | `null` | VOLUMEN / DEFINIDO / ATLETICO |
| `Xp` | int | 0 | — |
| `Coins` | int | 0 | — |
| `ClanId` | Guid? | `null` | FK nullable |
| `OnboardingCompletado` | bool | `false` | `true` después de unirse al clan |

---

## Pendiente para Semana 2 — PKG_INCORPORACIÓN

- [ ] Página `/login` con tab "CREAR CUENTA" (nombre + email + contraseña)
- [ ] Página `/onboarding/biometrics` conectada a `POST /api/incorporacion/registrar`
- [ ] Página `/onboarding/archetype` (estado en localStorage entre pasos)
- [ ] Página `/onboarding/matchmaking` conectada a `GET /api/incorporacion/clanes` + `POST /api/incorporacion/unirse`
- [ ] Middleware Next.js: decodificar JWT para leer `onboarding_completado` y redirigir a `/onboarding/biometrics` si es false
- [ ] Página `/perfil/cuenta` para CU-005-007 (gestionar email/contraseña)
- [ ] Aplicar migration `AddOnboardingCompletado` a SQL Server: `dotnet ef database update`
