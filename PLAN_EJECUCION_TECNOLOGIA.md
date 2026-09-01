# SilverBack — Plan de Ejecución Tecnológica (11 Semanas)

> Fuente: Última Versión STFI (10.4.3 Alcance del Desarrollo + 10.5 Casos de Uso) + relevamiento real del repo `nicolassepulveda13/SAP`.
>
> Alumno: Sepulveda Nicolas — UAI, Ingeniería en Sistemas Informáticos, 5to B — 2026.

## Stack confirmado

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS — puramente presentación; Server Components llaman a la API vía `apiFetch<T>()`.
- **Backend:** ASP.NET Core 9 Web API — Clean Architecture en 4 proyectos: `SilverbackApi.Domain`, `SilverbackApi.Data`, `SilverbackApi.Services`, `SilverbackApi.Api`.
- **Base de datos:** SQL Server (NICO-DESKTOP\SQLEXPRESS) con EF Core 9.
- **Auth:** JWT Bearer emitido por .NET API, almacenado en cookie HTTP-only `sb_token`. Next.js no verifica el token, solo lo reenvía.
- **Capas (backend):** Controllers → Services → Repositories → SQL Server (Clean Architecture, dependencias compiladas por project references).
- **Comunicación frontend↔backend:** HTTP REST con `Authorization: Bearer <token>` desde Server Components y Server Actions.

## Fuera de alcance (10.4.3)

Wearables · pasarela de pago real · OAuth · push notifications · red social abierta · biblioteca audiovisual/planes prediseñados · IA predictiva · integración B2B con gimnasios · app nativa · diagnóstico médico real.

## Estado actual del repo (línea de base)

**Ya existe:** maquetas UI de las 24 pantallas (los 5 paquetes: Incorporación, Santuario, Arena, Evolución/Bóveda, Perfil) + diagramas UML ya versionados (clases, ER, componentes, paquetes).

**No existe todavía:** conexión a DB, Services/Repositories implementados, Auth Middleware, cálculo real de CER (hoy hardcodeado en `24.8`).

## ⚠️ Discrepancias a resolver antes de programar

| # | Discrepancia | Fuente A | Fuente B | Resolver antes de |
|---|---|---|---|---|
| 1 | Roles del clan | STFI: binario (Miembro/Líder) | `diagrama-clases.md`: SILVERBACK/BETA/EXPLORADOR/RECLUTA | Semana 4 |
| 2 | Rangos de evolución | STFI: BRONCE→PLATA→ORO | `diagrama-clases.md`: +RANGO_S | Semana 7 |
| 3 | Tipos de cofre | STFI: ALPHA/TITANIO/OMEGA | `diagrama-clases.md`: COMÚN/RARO/ÉPICO/LEGENDARIO | Semana 7 |
| 4 | Modificador CER 1.15x | Atribuido a "Silverback" (¿rol o arquetipo?) | Arquetipos son VOLUMEN/DEFINIDO/ATLÉTICO | Semana 5 |

## Resumen ejecutivo

| # | Semana | Entregable | CU / Alcance |
|---|---|---|---|
| 1 | S1 | Arquitectura Base: Schema SQL Server, Capas de Aplicación y Autenticación | No aplica a un CU específico — es infraestructura transversal requerida por los 24 CU. |
| 2 | S2 | PKG_INCORPORACIÓN — Onboarding Conectado End-to-End | CU-001-001 · CU-001-002 · CU-001-003 · CU-001-004 |
| 3 | S3 | PKG_SANTUARIO I — Panel del Clan y La Forja | CU-002-001 · CU-002-002 · CU-002-003 |
| 4 | S4 | PKG_SANTUARIO II — Sala de Tácticas y Gestión de Roles | CU-002-004 · CU-002-005 · CU-002-006 |
| 5 | S5 | Motor CER y Registro de Entrenamiento por Voz | CU-003-002 · CU-003-003 |
| 6 | S6 | PKG_ARENA — Guerra Global e Historial de Batallas | CU-003-001 · CU-003-004 |
| 7 | S7 | PKG_EVOLUCIÓN / BÓVEDA — Progresión, Árbol de Habilidades y Marketplace | CU-004-001 · CU-004-002 · CU-004-003 · CU-004-004 |
| 8 | S8 | PKG_PERFIL — Dashboard, Racha, Fatiga, Trofeos y Beneficios | CU-005-001 · CU-005-002 · CU-005-003 · CU-005-004 · CU-005-005 · CU-005-006 |
| 9 | S9 | Análisis de Entorno de Despliegue en Máquinas de Facultad | No aplica a un CU — es una tarea de infraestructura y viabilidad de despliegue. |
| 10 | S10 | Integración Final y Hardening | Los 24 CU en conjunto. |
| 11 | S11 | Despliegue Final y Documentación Técnica | No aplica a un CU — es la instancia de entrega. |

---

## Backlog detallado

## ✅ Semana 1 — Arquitectura Base: Schema SQL Server, Clean Architecture y Autenticación JWT — COMPLETADA

**CU asociados:** No aplica a un CU específico — es infraestructura transversal requerida por los 24 CU.

**Decisión de arquitectura:** Se optó por Clean Architecture con ASP.NET Core 9 Web API separado de Next.js (en lugar de Next.js full-stack). Justificación: independencia de despliegue, debugging real con Swagger, separación de contratos HTTP explícita. Ver `docs/diagrama-componentes.md` para la justificación completa.

### Tareas completadas

- [x] Schema SQL Server migrado vía EF Core 9 migrations: 22 entidades con enums como strings (`HasConversion<string>()`), precisiones decimales explícitas, PKs compuestas, índices únicos y restricciones de cascada.
- [x] SQL Server nativo (NICO-DESKTOP\SQLEXPRESS, Windows Auth) — sin Docker; ver `SETUP.md` para instrucciones de arranque.
- [x] ASP.NET Core 9 Web API en Clean Architecture: 4 proyectos (`Domain`, `Data`, `Services`, `Api`) con dependencias compilador-enforced vía project references.
- [x] EF Core 9 con SQL Server como ORM.
- [x] Auth JWT Bearer: token emitido por .NET API (HS256, 7 días), almacenado por Next.js en cookie HTTP-only `sb_token`.
- [x] Middleware Next.js (solo cookie check, sin verificación JWT en el frontend).
- [x] `apiFetch<T>()` en Next.js: lee `sb_token` del cookie store del servidor e inyecta `Authorization: Bearer`.
- [x] Variables de entorno: `appsettings.json` para .NET, `.env.local` para Next.js.
- [x] Health check en `/health` (también proxy en Next.js `/api/health`).
- [x] Seed manual vía `POST /api/incorporacion/registrar`.
- [x] Integración verificada end-to-end: registro → login → dashboard.

**Entregable real:** Dos servidores corriendo (Next.js :3000, .NET API :5057), schema migrado completo, JWT funcionando, dashboard `/santuario` leyendo datos reales del API.

**Criterio de aceptación cumplido:** Un usuario puede registrarse, loguearse, recibir JWT en cookie HTTP-only, y ver el dashboard con datos reales de SQL Server.

### Riesgos resueltos

| Riesgo original | Resolución |
|---|---|
| SQL Server no disponible. | Resuelto: se usa instalación nativa NICO-DESKTOP\SQLEXPRESS con Windows Auth, documentado en SETUP.md. |
| ENUMs sin soporte nativo en SQL Server. | Resuelto: `HasConversion<string>()` en EF Core, serialización como strings vía `JsonStringEnumConverter`. |
| Gaps entre ER y pantallas. | Mitigado: schema construido desde el Diagrama de Clases del repo, no desde el STFI directamente. |

---

## Semana 2 — PKG_INCORPORACIÓN — Onboarding Conectado End-to-End

**CU asociados:** CU-001-001 · CU-001-002 · CU-001-003 · CU-001-004

**Objetivo:** Conectar el flujo de onboarding ya maquetado (CalibracionBiometricaPage, ArquetipoPage, RadarManadasPage) a persistencia real en SQL Server, reemplazando el estado local por datos que sobreviven a un refresh de página.

### Tareas

- [ ] Implementar el endpoint/Server Action para registrar datos biométricos (edad, peso, altura, nivel de experiencia) con las validaciones de rango descriptas en los flujos alternativos del CU-001-001 (campos vacíos, valores fuera de rango).
- [ ] Implementar el endpoint para persistir la selección de arquetipo (VOLUMEN/DEFINIDO/ATLÉTICO) junto con su modificador numérico asociado (rango documentado: 1.0 a 1.15).
- [ ] Implementar la búsqueda de manadas disponibles y definir el criterio mínimo viable de disponibilidad (manadas con cupo).
- [ ] Implementar la unión efectiva a una manada, actualizando el contador de miembros del clan.
- [ ] Reemplazar el useState de las tres pantallas por llamadas reales a estos endpoints, manteniendo el diseño visual existente.
- [ ] Probar el flujo completo con un usuario nuevo de punta a punta.

**Integraciones:** Next.js Server Actions → .NET API (`/api/incorporacion/*`) → SQL Server.

**Nota S1→S2:** El flujo post-registro actualmente redirige a `/santuario`. Para S2 hay que detectar si el usuario completó el onboarding (campo `onboardingCompletado` en Miembro o claim JWT) y redirigir a `/onboarding` si no lo hizo.

**Entregable:** Flujo de onboarding funcional de punta a punta con datos persistidos.

**Criterio de aceptación:** Un usuario nuevo completa los tres pasos del onboarding y, al recargar la página o volver a loguearse, sus datos siguen presentes porque vienen de la base, no de estado local del navegador.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El criterio de "manada disponible" no está definido con precisión en el STFI (¿por región, por nivel, todas con cupo?). | Alta | Medio | Definir como decisión de diseño mínima viable (todas las manadas con cupo, sin segmentación) y documentarla explícitamente para no bloquear la semana. |
| Los rangos válidos de edad y peso no están numéricamente definidos en la fuente. | Media | Bajo | Definir rangos razonables (ej. edad 14–99, peso 30–300 kg) como parámetros configurables, no hardcodeados en el frontend. |

---

## Semana 3 — PKG_SANTUARIO I — Panel del Clan y La Forja

**CU asociados:** CU-002-001 · CU-002-002 · CU-002-003

**Objetivo:** Conectar el panel central del clan (SantuarioPage) y el sistema de desafíos de La Forja (ForjaPage) a datos reales, incluyendo la creación de desafíos por el Líder y su aceptación por los miembros.

### Tareas

- [ ] Implementar el cálculo y la consulta de los indicadores del panel: poder colectivo, cantidad de miembros, posición en la competencia activa.
- [ ] Implementar la creación de desafíos semanales desde La Forja, restringida al rol de Líder de Clan.
- [ ] Implementar la aceptación de desafíos por parte de los miembros, con control de que un mismo desafío no se acepte dos veces.
- [ ] Conectar SantuarioPage y ForjaPage a estos endpoints reemplazando los datos de maqueta.

**Integraciones:** SQL Server · Validación de permisos por rol (Líder vs. Miembro).

**Entregable:** Panel del clan y La Forja operando con datos reales y persistentes.

**Criterio de aceptación:** Un desafío creado por el Líder es visible para todos los miembros del clan y puede ser aceptado, quedando reflejado el cambio de estado en la base de datos.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El "poder colectivo del clan" no tiene una fórmula explícita en el STFI más allá de mencionarlo como indicador. | Alta | Medio | Definir operativamente como la suma del CER histórico de todos los miembros del clan, y documentar esta decisión de diseño. |
| Condición de carrera si dos miembros aceptan el mismo desafío al mismo tiempo. | Baja | Medio | Usar transacciones atómicas o locks optimistas al escribir el estado del desafío. |

---

## Semana 4 — PKG_SANTUARIO II — Sala de Tácticas y Gestión de Roles

**CU asociados:** CU-002-004 · CU-002-005 · CU-002-006

**Objetivo:** Conectar la comunicación interna del clan (TacticasPage) y la administración jerárquica (RolesPage), resolviendo antes de implementar la discrepancia detectada entre la cantidad de roles documentada en el STFI y la definida en el Diagrama de Clases del repo (ver Sección 3 de este documento).

### Tareas

- [ ] Resolver y documentar el modelo de roles definitivo a implementar (ver riesgo de discrepancia abajo) antes de escribir el endpoint de asignación de roles.
- [ ] Implementar el chat persistido de la Sala de Tácticas: mensajes con autor, timestamp y tipo (texto/sistema/desafío).
- [ ] Implementar la asignación de rol a un miembro, restringida al Líder de Clan.
- [ ] Implementar la expulsión de un miembro del clan, con las validaciones de permiso correspondientes.
- [ ] Conectar TacticasPage y RolesPage a estos endpoints.

**Integraciones:** SQL Server · Validación de permisos jerárquicos.

**Entregable:** Chat interno y gestión de roles operando con datos reales.

**Criterio de aceptación:** Los mensajes persisten entre sesiones, y solo un usuario con rol de Líder puede reasignar roles o expulsar miembros; un Miembro regular recibe error de permisos si lo intenta.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe el sistema de roles como binario (Miembro / Líder de Clan), pero el Diagrama de Clases del repo (diagrama-clases.md) define cuatro roles: SILVERBACK, BETA, EXPLORADOR, RECLUTA. | Confirmada | Alto — define cuántos niveles de permiso hay que programar. | Definir con anticipación (idealmente antes de esta semana, ej. en la Semana 1 o 3) cuál de las dos fuentes es la vigente, y actualizar la que quede desactualizada. Implementar un único modelo, nunca ambos en paralelo. |
| Chat en tiempo real sin websockets puede sentirse lento si se resuelve solo por polling. | Media | Bajo | Usar polling con intervalo corto (3–5 s) como versión mínima viable; dejar websockets como mejora futura fuera del alcance de las 11 semanas. |

---

## Semana 5 — Motor CER y Registro de Entrenamiento por Voz

**CU asociados:** CU-003-002 · CU-003-003

**Objetivo:** Reemplazar el valor de CER actualmente hardcodeado (24.8) en CalculadoraCERPage por un servicio de cálculo real, y conectar el registro de entrenamientos incluyendo la captura por voz mediante Web Speech API.

### Tareas

- [ ] Implementar el CERService: CER = Kilogramos × Repeticiones × Modificador_Arquetipo, con el modificador leído del arquetipo real del usuario (rango 1.0–1.15).
- [ ] Definir y documentar los tres valores numéricos exactos del modificador (uno por arquetipo: Volumen, Definido, Atlético) — la fuente solo confirma 1.15x asociado al término "Silverback", que en el resto del sistema es un Rol y no un Arquetipo; hay que resolver esta ambigüedad antes de fijar los valores.
- [ ] Conectar RegistrarEntrenamientoPage y CalculadoraCERPage al servicio real, eliminando el dato de maqueta.
- [ ] Integrar Web Speech API para la carga de ejercicio, peso y repeticiones por voz.
- [ ] Implementar extracción de valores numéricos desde el texto reconocido, con confirmación visual antes de guardar.
- [ ] Implementar fallback de carga manual siempre visible, no oculto, para navegadores sin soporte de Web Speech API.
- [ ] Acumular el CER calculado al marcador de clan correspondiente.

**Integraciones:** Web Speech API (nativa del navegador) · SQL Server.

**Entregable:** Motor CER funcional con valores reales y registro de entrenamiento por voz operativo.

**Criterio de aceptación:** El puntaje CER mostrado varía según los datos ingresados y el arquetipo del usuario logueado (deja de ser un valor fijo); el registro por voz completa correctamente al menos ejercicio, peso y repeticiones en un navegador compatible, y el formulario manual funciona como alternativa siempre disponible.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Soporte desigual de Web Speech API entre navegadores: funciona bien en Chrome, tiene soporte parcial o nulo en Firefox y limitaciones en Safari. | Alta | Alto — puede fallar en vivo el día de la demo si la máquina de Facultad no usa Chrome. | Confirmar en la Semana 9 (Análisis de Entorno) qué navegador está disponible en las máquinas de Facultad. Mantener el formulario manual como camino principal visible, no como plan B escondido detrás de un botón. |
| Precisión del reconocimiento de voz ante ruido ambiente o acento. | Media | Bajo | Extracción de valores con expresiones regulares tolerantes a variaciones, más confirmación visual del usuario antes de persistir el dato. |
| Los modificadores numéricos de Volumen, Definido y Atlético no están confirmados individualmente en ninguna fuente del proyecto (solo hay un valor de referencia, 1.15, asociado de forma ambigua al término "Silverback"). | Confirmada | Medio | Definir los tres valores como decisión de diseño explícita antes de esta semana (ej. Volumen 1.10 / Definido 1.05 / Atlético 1.00) y dejarlos documentados y parametrizables, no hardcodeados en el servicio. |

---

## Semana 6 — PKG_ARENA — Guerra Global e Historial de Batallas

**CU asociados:** CU-003-001 · CU-003-004

**Objetivo:** Conectar la competencia entre clanes (GuerraGlobalPage) y el historial de enfrentamientos (HistorialBatallasPage) a datos reales, con actualización atómica del marcador ante cada entrenamiento registrado.

### Tareas

- [ ] Definir la regla mínima viable de ciclo de la Guerra Global (duración de un enfrentamiento y criterio de emparejamiento entre clanes), ya que no está especificada en el STFI.
- [ ] Implementar la actualización atómica del puntaje del clan cada vez que se confirma un CER (evitar lecturas y escrituras separadas que generen inconsistencias).
- [ ] Implementar el cierre de una batalla y el registro de resultado (victoria/derrota) en el historial.
- [ ] Conectar GuerraGlobalPage y HistorialBatallasPage a estos datos reales.

**Integraciones:** SQL Server · Motor CER (Semana 5) como dependencia directa.

**Entregable:** Guerra Global e Historial de Batallas operando con datos reales.

**Criterio de aceptación:** El marcador de un clan sube en tiempo real al registrar un entrenamiento, y una batalla finalizada queda reflejada correctamente en el historial de ambos clanes enfrentados.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| La duración y el criterio de emparejamiento de la Guerra Global no están definidos en el STFI (¿ciclo semanal? ¿emparejamiento automático?). | Alta | Alto — puede bloquear la semana si no se resuelve antes de empezar a programar. | Proponer una regla mínima viable (ciclo semanal, emparejamiento automático por rango o puntaje similar) y validarla como decisión de diseño antes de iniciar la implementación, no durante. |
| Condición de carrera al sumar CER simultáneamente desde múltiples miembros del mismo clan en paralelo. | Media | Medio | Usar una operación atómica de incremento en SQL Server (UPDATE ... SET puntaje = puntaje + @cer) en vez de un patrón leer-modificar-guardar desde la aplicación. |

---

## Semana 7 — PKG_EVOLUCIÓN / BÓVEDA — Progresión, Árbol de Habilidades y Marketplace

**CU asociados:** CU-004-001 · CU-004-002 · CU-004-003 · CU-004-004

**Objetivo:** Conectar el sistema completo de progresión individual: niveles, rangos, atributos, árbol de habilidades, recompensas de la Bóveda y Marketplace interno, resolviendo antes las discrepancias de nomenclatura detectadas entre el STFI y el Diagrama de Clases.

### Tareas

- [ ] Resolver y documentar la nomenclatura definitiva de rangos de evolución (ver riesgo de discrepancia) antes de implementar la lógica de progresión.
- [ ] Resolver y documentar la nomenclatura definitiva de rareza de cofres (ver riesgo de discrepancia) antes de implementar la Bóveda.
- [ ] Implementar el cálculo de nivel, rango y atributos (Fuerza, Agilidad, Resistencia) en función del progreso del usuario.
- [ ] Implementar el árbol de habilidades: definir la topología de dependencias entre nodos (qué nodo requiere qué otro desbloqueado) como tarea de diseño dentro de esta misma semana.
- [ ] Implementar la mejora de nodos consumiendo Puntos de Clan.
- [ ] Implementar la Bóveda: cofres desbloqueados por hitos, con estado disponible/reclamado.
- [ ] Implementar el Marketplace interno: compra de ítems cosméticos con la moneda virtual SB, con transacción atómica que valide saldo suficiente antes de descontar.
- [ ] Conectar EvolucionPage, SkillTreePage, BovedaPage y MarketplacePage a estos servicios.

**Integraciones:** SQL Server.

**Entregable:** Progresión, árbol de habilidades, Bóveda y Marketplace operando con datos reales.

**Criterio de aceptación:** El nivel y los atributos del usuario cambian según su actividad real; un nodo del árbol solo puede mejorarse si su prerequisito está desbloqueado; una compra en el Marketplace descuenta saldo real y no permite saldo negativo.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe los rangos como BRONCE → PLATA → ORO, mientras que el Diagrama de Clases del repo agrega un cuarto rango, RANGO_S. | Confirmada | Medio | Definir una única fuente de verdad para los rangos antes de implementar y actualizar la fuente desactualizada. |
| DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe los cofres por tipo ALPHA / TITANIO / OMEGA, mientras que el Diagrama de Clases del repo define la rareza como COMÚN / RARO / ÉPICO / LEGENDARIO — no queda claro si son el mismo concepto con nombres distintos o dos sistemas de clasificación superpuestos. | Confirmada | Medio | Aclarar si es una única taxonomía renombrada o si conviven ambas dimensiones (ej. tipo de cofre + rareza del contenido), y documentarlo antes de modelar la tabla correspondiente. |
| Doble gasto en el Marketplace si dos compras concurrentes no validan el saldo de forma atómica. | Baja | Medio | Transacción de base de datos que verifique y descuente el saldo en una sola operación atómica. |
| La topología de dependencias del árbol de habilidades no está especificada con precisión en el STFI. | Alta | Medio | Definirla como tarea de diseño explícita al inicio de esta semana, no asumirla implícitamente durante el desarrollo. |

---

## Semana 8 — PKG_PERFIL — Dashboard, Racha, Fatiga, Trofeos y Beneficios

**CU asociados:** CU-005-001 · CU-005-002 · CU-005-003 · CU-005-004 · CU-005-005 · CU-005-006

**Objetivo:** Conectar la capa de análisis individual del usuario, que consume datos de todos los módulos construidos en las semanas anteriores: dashboard comparativo, racha de entrenamientos, monitor de fatiga, vitrina de trofeos y acceso a beneficios de aliados comerciales.

### Tareas

- [ ] Fijar la zona horaria de referencia del sistema (America/Argentina/Buenos_Aires) para todo cálculo de fecha, en particular la racha diaria.
- [ ] Implementar el dashboard de rendimiento personal con comparación real contra el promedio del clan.
- [ ] Implementar el conteo de racha (días consecutivos con al menos un entrenamiento registrado) y su corte a medianoche según la zona horaria fijada.
- [ ] Implementar el rescate de racha mediante consumo de Puntos de Clan.
- [ ] Definir y documentar los umbrales numéricos del monitor de fatiga (Óptima/Moderada/Elevada/Crítica), ya que el STFI solo describe el concepto sin cifras.
- [ ] Implementar el monitor de fatiga en base al CER acumulado de los últimos 7 días y los umbrales definidos.
- [ ] Implementar la vitrina de trofeos con las medallas/logros obtenidos.
- [ ] Implementar el acceso a beneficios de aliados comerciales como redirección externa (sin procesar ninguna transacción real, según el alcance definido en 10.4.3).

**Integraciones:** SQL Server · Lectura cruzada de datos de Arena, Santuario y Evolución.

**Entregable:** Módulo de Perfil completo operando con datos reales agregados de todo el sistema.

**Criterio de aceptación:** El dashboard refleja datos reales del usuario y del clan; la racha se corta correctamente a medianoche (zona horaria Buenos Aires); el estado de fatiga cambia según el CER acumulado real de los últimos 7 días.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El umbral de fatiga no tiene fórmula numérica definida en ninguna fuente del proyecto. | Confirmada | Medio | Definir umbrales de referencia (ej. Óptima < 100 CER/7d, Moderada 100–250, Elevada 250–400, Crítica > 400) como decisión de diseño explícita, dejándolos parametrizables para ajustar tras revisión. |
| Ambigüedad de zona horaria para el cálculo de "un día" si el servidor corre en UTC. | Media | Medio | Fijar America/Argentina/Buenos_Aires como zona horaria de referencia única desde la Semana 1, no resolverlo recién acá. |
| El beneficio de Aliado Comercial no tiene ninguna integración real con marcas (está fuera de alcance según 10.4.3). | Confirmada — no es un riesgo a mitigar sino una limitación de alcance conocida. | Bajo | Usar URLs de placeholder documentadas explícitamente como tales, sin simular una integración que no existe. |

---

## Semana 9 — Análisis de Entorno de Despliegue en Máquinas de Facultad

**CU asociados:** No aplica a un CU — es una tarea de infraestructura y viabilidad de despliegue.

**Objetivo:** Determinar de forma anticipada (dos semanas antes del deploy final) cómo va a correr el sistema completo (Next.js + SQL Server) en las máquinas de la Facultad, evaluando y probando alternativas concretas en vez de improvisar el día de la entrega.

### Tareas

- [ ] Relevar las condiciones reales de las máquinas de Facultad: sistema operativo, permisos del usuario (¿administrador o estudiante estándar?), virtualización habilitada en BIOS, acceso a internet, puertos disponibles.
- [ ] Evaluar la opción Máquina Virtual (VirtualBox/VMware) con SQL Server + Next.js instalados nativamente adentro.
- [ ] Evaluar la opción Servidor Virtual / VPS (ej. Azure for Students, Railway, un droplet propio) accesible por URL desde cualquier máquina sin instalar nada local.
- [ ] Evaluar la opción Docker (contenedores para Next.js + SQL Server), sujeta a que la Facultad permita virtualización/Docker Desktop en sus equipos.
- [ ] Elegir la opción más viable según el relevamiento, y probar la instalación/arranque completo en un entorno lo más parecido posible al real.
- [ ] Documentar el procedimiento de instalación paso a paso (runbook) para poder repetirlo el día de la entrega sin depender de memoria.
- [ ] Definir un plan B explícito por si el entorno primario falla el día de la demo.

**Integraciones:** No aplica — es una tarea de infraestructura, no de integración funcional.

**Entregable:** Decisión de infraestructura documentada, entorno probado y runbook de instalación listo.

**Criterio de aceptación:** El sistema completo (front + datos) arranca siguiendo el runbook documentado en un entorno equivalente al de la Facultad, sin pasos manuales no documentados.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| No hay acceso previo confirmado a las máquinas de Facultad para hacer pruebas antes de esta semana. | Alta | Alto — cualquier sorpresa se descubre recién acá, con poco margen antes de la entrega. | Gestionar con la Facultad/IT un acceso de prueba con la mayor anticipación posible (idealmente antes de llegar a la Semana 9), no esperar a esta semana para el primer contacto. |
| Restricciones de IT que bloqueen Docker o virtualización en equipos gestionados por la institución. | Media | Alto | Tener la opción de VPS lista como respaldo desde antes, no como improvisación de último momento. |
| Costo o licenciamiento de SQL Server en el entorno elegido. | Media | Medio | Usar SQL Server Express o Developer Edition (ambas gratuitas) desde el desarrollo, evitando cualquier dependencia de licencia paga. |

---

## Semana 10 — Integración Final y Hardening

**CU asociados:** Los 24 CU en conjunto.

**Objetivo:** Validar el sistema completo como un todo integrado: los cinco flujos (Incorporación → Santuario → Arena → Evolución/Bóveda → Perfil) funcionando en secuencia real, sin datos mockeados remanentes de ninguna semana anterior.

### Tareas

- [ ] Ejecutar pruebas end-to-end de los cinco flujos completos, de punta a punta, con un usuario nuevo.
- [ ] Revisar que ningún módulo dependa todavía de datos de maqueta o de estado local remanente.
- [ ] Completar las validaciones server-side que hayan quedado pendientes en semanas anteriores.
- [ ] Corregir bugs de integración cruzada entre módulos (ej. que un cambio de rango en Evolución se refleje correctamente en Perfil).
- [ ] Revisión general de manejo de errores y mensajes al usuario en los flujos principales.

**Integraciones:** Todas las integraciones de las semanas 1 a 9, verificadas en conjunto.

**Entregable:** Sistema integrado y estabilizado, sin regresiones conocidas en los flujos principales.

**Criterio de aceptación:** Un usuario nuevo puede completar el recorrido completo (onboarding → unirse a clan → entrenar → progresar → ver su perfil) sin errores bloqueantes, con datos reales en cada paso.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Acumulación de deuda técnica de las ocho semanas de desarrollo por módulo puede concentrar demasiados bugs en esta única semana. | Alta | Alto | No dejar todo el testing para esta semana: cada semana de módulo (2 a 8) debería cerrar con una prueba manual básica (smoke test) antes de avanzar a la siguiente. Esta semana es para integración cruzada, no para el primer testing del sistema. |
| Si la Semana 9 (Entorno) se atrasa, puede consumir parte del tiempo reservado a esta semana. | Media | Alto | Ver la política general de gestión de desvíos (Sección 6): los atrasos se absorben priorizando nunca sacrificar la Semana 9 ni la 11. |

---

## Semana 11 — Despliegue Final y Documentación Técnica

**CU asociados:** No aplica a un CU — es la instancia de entrega.

**Objetivo:** Instalar el sistema en el entorno decidido en la Semana 9, validarlo en una máquina real de Facultad y cerrar la documentación técnica del proyecto para la entrega final.

### Tareas

- [ ] Ejecutar el runbook de instalación documentado en la Semana 9 en el entorno definitivo.
- [ ] Realizar una prueba completa en una máquina real de Facultad (no solo en el entorno de pruebas).
- [ ] Actualizar el README del repositorio con instrucciones de instalación y arranque.
- [ ] Actualizar el Diagrama de Componentes y cualquier diagrama UML que haya quedado desactualizado por decisiones tomadas durante las 11 semanas (ver Sección 3).
- [ ] Preparar un checklist de entrega final y un plan de contingencia para el día de la demo.

**Integraciones:** Todas — es la validación final del sistema completo en el entorno real.

**Entregable:** Sistema desplegado y accesible en el entorno de Facultad, documentación técnica actualizada.

**Criterio de aceptación:** El sistema arranca y es accesible desde una máquina de Facultad siguiendo únicamente el runbook documentado, sin intervención manual no registrada.

### Riesgos y desvíos posibles

| Riesgo / Desvío | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El entorno real de Facultad el día de la entrega puede diferir de la máquina usada para probar en la Semana 9 (otro hardware, otra versión de SO). | Media | Alto | Mantener el runbook de la Semana 9 lo más genérico y portable posible, y probarlo en más de una máquina si es posible antes de la entrega. |
| Sin margen de tiempo si algo falla el último día antes de la entrega. | Media | Alto | No dejar el primer intento de deploy real para el mismo día de la entrega; validarlo con anticipación dentro de esta misma semana. |

---

## Gestión de desvíos

- **Qué es un desvío:** cualquier tarea no completada en su semana planificada, o decisión de diseño que hubo que tomar sobre la marcha por no estar definida en las fuentes.
- **Absorción de atrasos:** primero se recorta testing exploratorio de la Semana 10 (la más elástica). Las Semanas 9 y 11 nunca se sacrifican.
- **No acumular deuda invisible:** cada semana de módulo (2–8) cierra con una demo funcional mínima antes de avanzar.
- **Escalamiento:** desvío que persiste más de 1 semana → replantear el alcance a su versión mínima indispensable.
- **Registro:** mantener un log de desvíos (fecha, tarea, causa, decisión) como respaldo ante los profesores.

## Matriz de riesgos consolidada

| Semana | Riesgo / Desvío | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| S1 | SQL Server no disponible o mal configurado en el entorno de desarrollo (conflictos entre instalación nativa y contenedor). | Media | Alto — bloquea todas las semanas siguientes. | Usar SQL Server en Docker desde el primer día y documentar el procedimiento de arranque en el README del repo. |
| S1 | El modelo ER documentado no cubre todos los campos que ya requieren las 24 pantallas construidas (gaps entre diseño y maqueta). | Media | Medio | Revisar cada pantalla existente contra el Diagrama ER antes de migrar; ajustar el diagrama si aparecen campos faltantes y dejarlo documentado como cambio de versión. |
| S1 | Los ENUM del dominio (Arquetipo, Rol, Rango, etc.) no tienen soporte nativo en SQL Server como en otros motores. | Alta | Bajo | Modelarlos como CHECK constraints o tablas de referencia desde el arranque, evitando refactors posteriores. |
| S2 | El criterio de "manada disponible" no está definido con precisión en el STFI (¿por región, por nivel, todas con cupo?). | Alta | Medio | Definir como decisión de diseño mínima viable (todas las manadas con cupo, sin segmentación) y documentarla explícitamente para no bloquear la semana. |
| S2 | Los rangos válidos de edad y peso no están numéricamente definidos en la fuente. | Media | Bajo | Definir rangos razonables (ej. edad 14–99, peso 30–300 kg) como parámetros configurables, no hardcodeados en el frontend. |
| S3 | El "poder colectivo del clan" no tiene una fórmula explícita en el STFI más allá de mencionarlo como indicador. | Alta | Medio | Definir operativamente como la suma del CER histórico de todos los miembros del clan, y documentar esta decisión de diseño. |
| S3 | Condición de carrera si dos miembros aceptan el mismo desafío al mismo tiempo. | Baja | Medio | Usar transacciones atómicas o locks optimistas al escribir el estado del desafío. |
| S4 | DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe el sistema de roles como binario (Miembro / Líder de Clan), pero el Diagrama de Clases del repo (diagrama-clases.md) define cuatro roles: SILVERBACK, BETA, EXPLORADOR, RECLUTA. | Confirmada | Alto — define cuántos niveles de permiso hay que programar. | Definir con anticipación (idealmente antes de esta semana, ej. en la Semana 1 o 3) cuál de las dos fuentes es la vigente, y actualizar la que quede desactualizada. Implementar un único modelo, nunca ambos en paralelo. |
| S4 | Chat en tiempo real sin websockets puede sentirse lento si se resuelve solo por polling. | Media | Bajo | Usar polling con intervalo corto (3–5 s) como versión mínima viable; dejar websockets como mejora futura fuera del alcance de las 11 semanas. |
| S5 | Soporte desigual de Web Speech API entre navegadores: funciona bien en Chrome, tiene soporte parcial o nulo en Firefox y limitaciones en Safari. | Alta | Alto — puede fallar en vivo el día de la demo si la máquina de Facultad no usa Chrome. | Confirmar en la Semana 9 (Análisis de Entorno) qué navegador está disponible en las máquinas de Facultad. Mantener el formulario manual como camino principal visible, no como plan B escondido detrás de un botón. |
| S5 | Precisión del reconocimiento de voz ante ruido ambiente o acento. | Media | Bajo | Extracción de valores con expresiones regulares tolerantes a variaciones, más confirmación visual del usuario antes de persistir el dato. |
| S5 | Los modificadores numéricos de Volumen, Definido y Atlético no están confirmados individualmente en ninguna fuente del proyecto (solo hay un valor de referencia, 1.15, asociado de forma ambigua al término "Silverback"). | Confirmada | Medio | Definir los tres valores como decisión de diseño explícita antes de esta semana (ej. Volumen 1.10 / Definido 1.05 / Atlético 1.00) y dejarlos documentados y parametrizables, no hardcodeados en el servicio. |
| S6 | La duración y el criterio de emparejamiento de la Guerra Global no están definidos en el STFI (¿ciclo semanal? ¿emparejamiento automático?). | Alta | Alto — puede bloquear la semana si no se resuelve antes de empezar a programar. | Proponer una regla mínima viable (ciclo semanal, emparejamiento automático por rango o puntaje similar) y validarla como decisión de diseño antes de iniciar la implementación, no durante. |
| S6 | Condición de carrera al sumar CER simultáneamente desde múltiples miembros del mismo clan en paralelo. | Media | Medio | Usar una operación atómica de incremento en SQL Server (UPDATE ... SET puntaje = puntaje + @cer) en vez de un patrón leer-modificar-guardar desde la aplicación. |
| S7 | DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe los rangos como BRONCE → PLATA → ORO, mientras que el Diagrama de Clases del repo agrega un cuarto rango, RANGO_S. | Confirmada | Medio | Definir una única fuente de verdad para los rangos antes de implementar y actualizar la fuente desactualizada. |
| S7 | DISCREPANCIA DE FUENTE: el STFI (10.4.3) describe los cofres por tipo ALPHA / TITANIO / OMEGA, mientras que el Diagrama de Clases del repo define la rareza como COMÚN / RARO / ÉPICO / LEGENDARIO — no queda claro si son el mismo concepto con nombres distintos o dos sistemas de clasificación superpuestos. | Confirmada | Medio | Aclarar si es una única taxonomía renombrada o si conviven ambas dimensiones (ej. tipo de cofre + rareza del contenido), y documentarlo antes de modelar la tabla correspondiente. |
| S7 | Doble gasto en el Marketplace si dos compras concurrentes no validan el saldo de forma atómica. | Baja | Medio | Transacción de base de datos que verifique y descuente el saldo en una sola operación atómica. |
| S7 | La topología de dependencias del árbol de habilidades no está especificada con precisión en el STFI. | Alta | Medio | Definirla como tarea de diseño explícita al inicio de esta semana, no asumirla implícitamente durante el desarrollo. |
| S8 | El umbral de fatiga no tiene fórmula numérica definida en ninguna fuente del proyecto. | Confirmada | Medio | Definir umbrales de referencia (ej. Óptima < 100 CER/7d, Moderada 100–250, Elevada 250–400, Crítica > 400) como decisión de diseño explícita, dejándolos parametrizables para ajustar tras revisión. |
| S8 | Ambigüedad de zona horaria para el cálculo de "un día" si el servidor corre en UTC. | Media | Medio | Fijar America/Argentina/Buenos_Aires como zona horaria de referencia única desde la Semana 1, no resolverlo recién acá. |
| S8 | El beneficio de Aliado Comercial no tiene ninguna integración real con marcas (está fuera de alcance según 10.4.3). | Confirmada — no es un riesgo a mitigar sino una limitación de alcance conocida. | Bajo | Usar URLs de placeholder documentadas explícitamente como tales, sin simular una integración que no existe. |
| S9 | No hay acceso previo confirmado a las máquinas de Facultad para hacer pruebas antes de esta semana. | Alta | Alto — cualquier sorpresa se descubre recién acá, con poco margen antes de la entrega. | Gestionar con la Facultad/IT un acceso de prueba con la mayor anticipación posible (idealmente antes de llegar a la Semana 9), no esperar a esta semana para el primer contacto. |
| S9 | Restricciones de IT que bloqueen Docker o virtualización en equipos gestionados por la institución. | Media | Alto | Tener la opción de VPS lista como respaldo desde antes, no como improvisación de último momento. |
| S9 | Costo o licenciamiento de SQL Server en el entorno elegido. | Media | Medio | Usar SQL Server Express o Developer Edition (ambas gratuitas) desde el desarrollo, evitando cualquier dependencia de licencia paga. |
| S10 | Acumulación de deuda técnica de las ocho semanas de desarrollo por módulo puede concentrar demasiados bugs en esta única semana. | Alta | Alto | No dejar todo el testing para esta semana: cada semana de módulo (2 a 8) debería cerrar con una prueba manual básica (smoke test) antes de avanzar a la siguiente. Esta semana es para integración cruzada, no para el primer testing del sistema. |
| S10 | Si la Semana 9 (Entorno) se atrasa, puede consumir parte del tiempo reservado a esta semana. | Media | Alto | Ver la política general de gestión de desvíos (Sección 6): los atrasos se absorben priorizando nunca sacrificar la Semana 9 ni la 11. |
| S11 | El entorno real de Facultad el día de la entrega puede diferir de la máquina usada para probar en la Semana 9 (otro hardware, otra versión de SO). | Media | Alto | Mantener el runbook de la Semana 9 lo más genérico y portable posible, y probarlo en más de una máquina si es posible antes de la entrega. |
| S11 | Sin margen de tiempo si algo falla el último día antes de la entrega. | Media | Alto | No dejar el primer intento de deploy real para el mismo día de la entrega; validarlo con anticipación dentro de esta misma semana. |

