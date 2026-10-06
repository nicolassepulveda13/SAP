# SilverBack — Resumen general del desarrollo

**Alumno:** Sepúlveda Nicolás — UAI, Ingeniería en Sistemas, 5to B — SAP 2026
**Actualizado:** 06/10/2026
**Estado:** S1 ✅ · S2 ✅ · S3 ✅ · S4 ✅ · S5 ✅ · S6 ✅ — verificado con 13 tests E2E · todo commiteado y subido a `origin/main`

> Este documento es el punto de entrada. El detalle de cada sprint está en `PLAN_EJECUCION_TECNOLOGIA.md`. Los cambios para la carpeta del TP están en `silverback/docs/Modificacion-Carpeta.md` (v1.3).

---

## 1. Resumen en 30 segundos

- **Stack:** Next.js 16 + React 19 (`silverback/`) · ASP.NET Core 9, Clean Architecture (`silverback-api/`) · SQL Server + EF Core 9 · JWT en cookie HTTP-only.
- **Funciona de punta a punta:** Incorporación (alta, arquetipo, unirse/fundar clan), Santuario (panel, Forja, Tácticas, Roles) y Arena (registro manual y por voz, CER, Guerra Global semanal, Historial de Batallas).
- **Oculto hasta implementarse:** Evolución/Bóveda (S7) y Perfil (S8). Las pantallas están, pero no se muestran.
- **28 casos de uso:** 24 aprobados en E1 + 4 agregados (C-25 a C-28).
- **Calidad:** suite E2E de 13 tests con Playwright. Encontró 7 bugs reales (incluida una fuga de contraseñas) y quedaron todos corregidos.
- **Carpeta del TP:** `Modificacion-Carpeta.md` v1.3 tiene todo lo que hay que insertar o anotar, más la lista de brechas que faltan implementar.

---

## 2. ▶️ Cómo levantarlo (manual)

> Requisitos: SQL Server Express corriendo (servicio `SQL Server (SQLEXPRESS)`), .NET 9 SDK, Node 20+.
> Connection string actual: `DESKTOP-JQBGOKE\SQLEXPRESS` (en `silverback-api/SilverbackApi.Api/appsettings.json`). En la otra PC hay que cambiarlo, o usar `localhost\SQLEXPRESS`, que funciona en las dos.

### Primera vez en una PC nueva

1. **Connection string:** en `silverback-api/SilverbackApi.Api/appsettings.json` poné el nombre de la máquina (`Server=NOMBRE-PC\\SQLEXPRESS;…`) o `localhost\\SQLEXPRESS`. Con usuario y contraseña de SQL, el formato es `Server=localhost;Database=silverback;User Id=sa;Password=…;TrustServerCertificate=True`.
2. **JWT secret:** reemplazá `Jwt:Secret` en el mismo archivo por una cadena aleatoria de 32 caracteres o más.
3. **Herramienta de migraciones** (una sola vez): `dotnet tool install --global dotnet-ef`.
4. **Base de datos:**
   ```powershell
   cd silverback-api
   dotnet restore
   dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api
   ```
5. **Front:**
   ```powershell
   cd silverback
   npm install
   "API_URL=http://localhost:5057" | Out-File -Encoding utf8 .env.local
   ```

Después, para el día a día, se necesitan **dos terminales** (PowerShell).

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
| **Docs API (Scalar)** | http://localhost:5057/scalar/v1 | Documentación interactiva de los endpoints |
| OpenAPI JSON | http://localhost:5057/openapi/v1.json | Para importar en Postman/Insomnia |

**Probar endpoints con sesión en Scalar:**
1. Ejecutá `POST /api/auth/login` con `{ "email": "...", "password": "..." }` y copiá el `token`.
2. En Scalar, en *Authentication → Bearer*, pegá **solo el token** (sin la palabra "Bearer" ni comillas).
3. Ya podés llamar a cualquier endpoint con `[Authorize]`.

> Scalar y el JSON solo se publican en entorno **Development** (el default de `dotnet run`).

### Bajar todo

`Ctrl + C` en cada terminal. Si quedó algo colgado y los puertos están ocupados:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,5057 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

> ⚠️ No uses `Stop-Process -Name node`: mata **todos** los procesos Node, incluido Claude Code.

### Arranque limpio (si algo se ve raro)

Con todo bajado:

```powershell
Remove-Item -Recurse -Force C:\Users\nico_\Documents\repos\SAP\silverback\.next   # caché de Next
cd C:\Users\nico_\Documents\repos\SAP\silverback-api
dotnet clean                                                                     # build de la API
```

### Migraciones

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback-api

# Aplicar las pendientes (después de un pull)
dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api

# Crear una nueva (después de cambiar el modelo)
dotnet ef migrations add NombreMigracion --project SilverbackApi.Data --startup-project SilverbackApi.Api
```

### Puertos

| Servicio | Puerto |
|---|---|
| Front (Next.js) | 3000 |
| API (.NET) | 5057 |
| SQL Server | 1433 (default) |

### Troubleshooting

| Síntoma | Qué revisar |
|---|---|
| La API no conecta a SQL Server | Que el servicio `SQL Server (SQLEXPRESS)` esté corriendo, y que el connection string tenga el nombre de **esta** PC |
| `401 Unauthorized` | El token venció o es inválido: cerrá sesión y volvé a entrar. En Scalar, pegá solo el token, sin "Bearer" |
| El front no llega a la API | Que `API_URL` en `silverback/.env.local` apunte a `http://localhost:5057` y que la API esté corriendo |
| `dotnet ef` no se encuentra | `dotnet tool install --global dotnet-ef` |
| El build falla con "archivo en uso" | La API sigue corriendo y bloquea las DLLs: bajala antes de compilar |

### Datos de prueba

No hay seed: se crean desde la app. Fundá un clan con un usuario (queda SILVERBACK) y uní a un segundo usuario desde una ventana de incógnito (queda RECLUTA). Para entrar con cuentas existentes, todas las de prueba usan la contraseña `Test1234!`.

---

## 3. 🧪 Tests E2E (Playwright)

```powershell
cd C:\Users\nico_\Documents\repos\SAP\silverback
npm run test:e2e
npx playwright show-report   # reporte HTML con capturas y trazas de los fallos
```

- Si la API y el front no están corriendo, **los levanta Playwright** y los baja al terminar. Si ya están arriba, los reutiliza.
- Cada corrida crea sus propios usuarios y clanes (`e2e-…@silverback.local`, clanes `E2E Alfa/Beta/Gamma …`), así que no depende de los datos que haya.
- ⚠️ El test de cierre de semana **modifica la guerra activa** en la base (la da por vencida). Antes hace un backup en `…\MSSQL\Backup\silverback_pre_e2e_<id>.bak`.
- Si la base está en otra PC: `$env:E2E_SQL_SERVER = "OTRA-PC\SQLEXPRESS"; npm run test:e2e`.
- ⚠️ `silverback/package.json` está en el `.gitignore` (decisión tomada): en otra PC hay que correr `npm install -D @playwright/test`, `npx playwright install chromium` y agregar el script `"test:e2e": "playwright test"`.

| # | Test | Qué verifica |
|---|---|---|
| 1 | Incorporación | Tres usuarios fundan o se unen a clanes por la UI; el Sidebar muestra datos reales |
| 2 | Pantallas ocultas | `/perfil` y `/evolucion` redirigen; el menú no las muestra |
| 3 | CU-002-004 Tácticas | El chat persiste, lo ve otro miembro, y un mensaje nuevo aparece **sin recargar** |
| 4 | CU-002-007 + 003 Forja | El SILVERBACK publica un desafío ORO y el RECLUTA lo acepta |
| 5 | CU-002-005/006 Roles | El RECLUTA recibe 403, el Líder no puede cambiar su propio rol (400), el ascenso a BETA funciona |
| 6 | CU-003-002 manual | Registrar suma CER (528) y XP (+52) |
| 7 | CU-003-002 voz | El dictado (micrófono simulado) se confirma y completa los campos; suma 1100 CER |
| 8 | Voz sin soporte | Se avisa y el formulario manual sigue disponible |
| 9 | CU-003-001 Guerra | Ranking con 3 clanes: nuestro clan vs rival y un tercero "SIN RIVAL ASIGNADO" |
| 10 | CU-003-004 Historial | Al cerrar la semana: VICTORIA, DERROTA y SIN RIVAL; filtro por ejercicio |
| 11 | CU-002-006 Expulsar | El expulsado va al Radar y se une a otro clan con su cuenta |
| 12 | Cambio de clan | Quien ya tiene clan no puede unirse a otro (400) |
| 13 | Seguridad | Ningún endpoint responde 500 ni expone `passwordHash` |

---

## 4. 🎯 Qué se muestra en la entrega

Solo se ven las pantallas **integradas con la API**. Las maquetadas sin integración están **ocultas, no borradas**: no aparecen en el menú, y si se entra por URL redirigen a `/santuario`.

| Paquete | Pantallas visibles | Estado |
|---|---|---|
| Incorporación | Login · Biometría · Arquetipo · Radar de Manadas (unirse / fundar) | ✅ |
| Santuario | Panel del Clan · La Forja · Sala de Tácticas · Roles | ✅ |
| Arena | Guerra Global · Registrar (manual + voz) · Calculadora CER · Historial de Batallas | ✅ |
| Evolución / Bóveda | Evolución · Habilidades · Botín · Tienda | 🙈 Oculto (S7) |
| Perfil | Dashboard · Racha · Fatiga · Trofeos · Beneficios | 🙈 Oculto (S8) |

**Cómo volver a mostrar algo:** sacarlo de `silverback/src/lib/features.ts` (`RUTAS_OCULTAS` para un paquete entero, `PANTALLAS_OCULTAS` para una ruta exacta). Lo usan el menú y el middleware.

---

## 5. Qué se hizo, sprint por sprint

| Sprint | Fecha | Commits | Qué se hizo |
|---|---|---|---|
| **S1** | 01/09 | `8de3d09` | Clean Architecture .NET 9 en 4 proyectos, Next.js 16, JWT en cookie `sb_token`, schema SQL Server con EF Core |
| **S2** | 06/09 | `e747068` | Onboarding de punta a punta: cookie borrador `sb_onboarding`, token preliminar, middleware por `onboarding_completado`. **CU-001-000** (C-25) |
| **S3** | 15/09 | `e9e78e1` `29acc12` `bd68753` y otros | Panel del Clan (poder, ranking), La Forja (ver, aceptar, publicar), tabla `AceptacionDesafio`. **CU-001-005 Fundar** (C-27) y **CU-002-007 Publicar** (C-28) |
| **S4** | 22/09 – 05/10 | `5375df1` `4083049` | Arena: registro de entrenamiento + motor CER. Santuario II: chat de Tácticas, asignar rol, expulsar |
| **S5** | 05/10 | `51024f9` | Registro por voz (Web Speech API, es-AR) con confirmación; XP por entrenamiento |
| **S6** | 05/10 | `51024f9` | Guerra Global semanal automática (abre y cierra sola), rival por parejas del ranking, Historial de Batallas |
| Correcciones | 05/10 – 06/10 | `c2f1e34` `b193269` `f7bf0f5` `baed15b` | Bugs encontrados con los tests (ver sección 7) |
| Infra y docs | 05/10 – 06/10 | `4b7b73e` `603189f` `fd61d86` `7ade5d1` y otros | Pantallas ocultas, Scalar, suite E2E, balanceo de la carpeta |

---

## 6. Decisiones de diseño tomadas

| Tema | Decisión |
|---|---|
| Arquitectura | API .NET separada del front (no Next.js full-stack): contratos HTTP explícitos, Swagger/Scalar, despliegue independiente |
| Roles | 4 roles: SILVERBACK / BETA / EXPLORADOR / RECLUTA. Solo SILVERBACK administra. El "Líder de Clan" del STFI = SILVERBACK |
| Tier de desafío | `BRONCE / PLATA / ORO`, como el ER aprobado. "TITAN TIER" en los CU era solo la etiqueta de la maqueta |
| Modificadores CER | VOLUMEN 1.10 · DEFINIDO 1.05 · ATLÉTICO 1.00 (el 1.15 "Silverback" no se usa: es un rol, no un arquetipo) |
| XP | 1 XP cada 10 de CER |
| Guerra Global | Semanal, lunes 00:00 → lunes 00:00 hora Argentina; se abre y se cierra sola al usar la Arena (sin procesos programados) |
| Rival | Pareja consecutiva del ranking (1º vs 2º, 3º vs 4º…). Impar → SIN RIVAL. Al cierre gana el mejor posicionado |
| Voz | Web Speech API en es-AR; se confirma lo entendido antes de completar; formulario manual siempre visible |
| Tácticas | Refresco automático cada 5 s (sin websockets) |
| Rol y clan | Se leen siempre **desde la base**, no del JWT (pueden cambiar después de emitido el token) |
| Expulsión | El expulsado queda sin clan, como RECLUTA, y vuelve al Radar de Manadas con su misma cuenta |
| Cupo de clan | 20 miembros |

Todas están registradas para el profe en `Modificacion-Carpeta.md` (secciones 1, 4.5 y 4.6).

---

## 7. Bugs encontrados y corregidos

| # | Bug | Impacto | Corrección |
|---|---|---|---|
| 1 | La Forja leía el rol del JWT con la clave `rol`, pero .NET lo guarda como `…/claims/role` | El formulario de publicar desafíos **no se le mostraba a nadie** | El rol se lee desde la base (`requireClan()`) |
| 2 | Aceptar un desafío responde 204 y `apiFetch` parseaba JSON vacío | Aceptar desafíos **nunca funcionó desde la web** (desde S3) | `apiFetch` acepta respuestas sin cuerpo |
| 3 | Endpoints que devolvían entidades de EF | **Fuga del `passwordHash`** (publicar desafío, progreso de evolución) y errores 500 | Todos los controllers devuelven DTOs; test de regresión |
| 4 | El Radar solo existía para cuentas nuevas | **El expulsado quedaba trabado** | El Radar sirve para cuentas sin clan |
| 5 | `/unirse` y `/clan` no verificaban si ya tenías clan | Se podía cambiar de clan por API y los contadores quedaban mal | 400 "Ya pertenecés a un clan"; validación de cupo |
| 6 | La API omite los campos `null` y el front comparaba con `!== null` | El Radar creía que el expulsado tenía clan; el **Historial rompía** con batallas SIN RIVAL | `!= null` y tipos opcionales |
| 7 | El SILVERBACK podía cambiarse su propio rol por API | El clan quedaba sin líder | El servidor responde 400 |
| — | `TierDesafio` cambiado a `TITAN/ALPHA/BETA` en un commit | Desalineado con la carpeta | Vuelto a `BRONCE/PLATA/ORO` |
| — | La base local tenía migraciones de una copia paralela | Faltaba la tabla `AceptacionesDesafio` | Arreglado con backup previo |

---

## 8. Documentación del TP

| Documento | Para qué | Estado |
|---|---|---|
| `silverback/docs/Modificacion-Carpeta.md` | **Lo que hay que cambiar en la carpeta** para el profe: CU nuevos, diagramas, decisiones, diferencias, mapa de inserción y brechas | ✅ v1.3 (06/10) |
| `silverback/docs/casos-de-uso.md` | Los 28 CU | ✅ |
| `silverback/docs/secuencias-*.md` | Diagramas de secuencia (CU-003 reescritos en S6, 4 nuevos insertados, SQL Server) | ✅ |
| `silverback/docs/diagrama-er.md` · `er-*.md` | ER (`ACEPTACION_DESAFIO`, `posicion` en `PARTICIPACION_GUERRA`) | ✅ |
| `PLAN_EJECUCION_TECNOLOGIA.md` | Plan de 11 semanas con el estado real de cada tarea | ✅ |
| `silverback/docs/Guia-Tecnica.md` | Guía interna del código, archivo por archivo, con debugging | ✅ S1–S6 (06/10) |
| `Context.md` | Contexto de Negocios | ⚠️ Dice Next.js 14 y 20 CU (no se tocó: es de Negocios) |

---

## 9. Pendientes

### Brechas con CU aprobados (detalle en `Modificacion-Carpeta.md` §4.6)

- [ ] **CU-002-005:** impedir que haya dos SILVERBACK en un clan (hoy el selector lo permite).
- [ ] **CU-002-006:** confirmación antes de expulsar, registro en el historial de administración y no permitir expulsar a un SILVERBACK.
- [ ] **CU-001-003:** buscador de clanes por nombre y "INICIAR VIAJE" con asignación automática.

### Próximos sprints

- [ ] **S7** — Evolución / Bóveda (CU-004-001 a 004). Resolver antes las discrepancias de rangos y de tipos de cofre. Las tablas de catálogo (Items, Nodos, Cofres) están vacías.
- [ ] **S8** — Perfil (CU-005-001 a 007), incluida `/perfil/cuenta` (CU-005-007).
- [ ] **S9** — Análisis del entorno de las máquinas de la facultad.
- [ ] **S10–S11** — Integración final, hardening y despliegue.

### Otros

- [ ] Probar la voz con un micrófono real en Chrome (en los tests es simulado).
- [ ] Datos de la base: "Lider Gorila" es fundador de la Manada de Prueba pero tiene rol BETA (el código ya no deja que vuelva a pasar).
- [ ] Prisma (`silverback/prisma/`) queda como referencia histórica (`DEPRECADO.md`), excluido de `tsconfig`.
