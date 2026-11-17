# Demo — 3 casos de uso core, alineados de punta a punta

> Verificado el 17/11/2026: para estos 3 CU, el **código**, la **pantalla**, la **secuencia**, el **diagrama de clases** y el **DER** dicen lo mismo, con los mismos nombres de clases y métodos. Los tres pasan en la E2E (33/33).

Los tres comparten una idea fuerte para contar: **los Puntos de Clan son la moneda colectiva**. Un miembro entrena y suma puntos al clan (CU-003-002); cualquier miembro los gasta para salvar su racha (CU-005-003) o para mejorar el árbol del clan (CU-004-002).

| CU | Qué muestra | Pantalla |
|---|---|---|
| **CU-003-002** Registrar un Entrenamiento | Dictado por voz (es-AR), cálculo del CER por arquetipo, suma a la Guerra Global y a los Puntos de Clan | `/arena/registrar` |
| **CU-004-002** Mejorar Nodo del Árbol de Habilidades | Árbol colectivo del clan, FA-1 nodo bloqueado, FA-2 puntos insuficientes, historial de inversiones | `/evolucion/habilidades` |
| **CU-005-003** Salvar Racha con Puntos de Clan | Racha en riesgo, rescate con descuento atómico, FA-2 dejar morir la racha | `/santuario` → `/perfil/racha` |

---

## Antes de la demo (2 minutos)

**Cuenta de la demo:** `demo@silverback.demo` / `Test1234!` (clan "Manada Demo", arquetipo ATLÉTICO).

**Con Docker (recomendado):**
```
docker compose up --build
```
En cada arranque, la API deja la cuenta lista: **racha de 6 días en riesgo**, **60 Puntos de Clan**, **árbol sin invertir** y sin entrenamientos de hoy. Lo hace `DbInicializador.PrepararDemo`, activado con `PREPARAR_DEMO=true`, que ya viene por defecto. Para repetir la demo: `docker compose restart api`.

**Sin Docker (local):** levantá la API y el front, y corré el script (se puede repetir):
```
sqlcmd -S "localhost\SQLEXPRESS" -d silverback -E -i silverback\demo\preparar-demo.sql
```
La primera vez, la cuenta demo la crea la API si arranca con `Database__PrepararDemo=true`. También podés cambiar `@email` en el script y usar tu cuenta.

Abrí la app en **Chrome** (el dictado usa la Web Speech API) y permití el micrófono.

> Verificado el 17/11 contra la API: salvar 60 → 10 · FUERZA "PUNTOS INSUFICIENTES" · entrenamiento 800 CER y +80 XP · saldo 810 · mejorar FUERZA → 710 y aparece en "ÚLTIMAS INVERSIONES".

## Guion (≈ 5 minutos)

**1 · CU-005-003 — Salvar la racha**
- Entrás al **Santuario**: el botón de racha aparece con la alerta de "en riesgo".
- Lo tocás → **Termómetro de Racha**: "RACHA A PUNTO DE PERDERSE", costo 50 pts, "Tienes: 60 pts".
- **SALVAR RACHA** → vuelve al Santuario con "¡Racha salvada!" y la alerta desaparece. El clan queda con 10 puntos.
- *Para contar:* el descuento es un único `UPDATE … WHERE PuntosClan >= 50`, así que dos miembros no pueden gastar el mismo saldo. Solo se usan los puntos del clan propio. La alternativa es **DEJAR MORIR LA RACHA** (FA-2), que la pone en 0 sin cargo.

**2 · CU-004-002 — El árbol, sin puntos (flujos alternativos)**
- **Evolución → Habilidades**: árbol SVG FUERZA → RESISTENCIA / ATAQUE → FUEGO → TITÁN, con el saldo (10 pts) arriba a la derecha.
- Clic en **TITÁN** → no se selecciona y muestra el prerrequisito (**FA-1**).
- Clic en **FUERZA** → panel con nivel 0/3, efecto y costo 100 → botón **PUNTOS INSUFICIENTES** (**FA-2**).

**3 · CU-003-002 — Registrar un entrenamiento por voz**
- **Arena → Registrar** → **DICTAR** → decir *"sentadilla 80 kilos 10 repeticiones"*.
- Muestra lo que entendió → **USAR ESTOS DATOS** → completa los campos (se pueden corregir a mano).
- **REGISTRAR ESFUERZO** → CER = 80 × 10 × modificador del arquetipo (ATLÉTICO 1.0 = **800**) y **+80 XP**.
- *Para contar:* el CER se suma a la Guerra Global de la semana y a los Puntos de Clan, también con incrementos atómicos. Además se actualiza la racha (hora Argentina) y se otorgan las recompensas: Llave de Acero cada 5 sesiones, hitos con trofeo y cofre, y rango.

**4 · CU-004-002 — Ahora sí, mejorar el nodo**
- Volvés a **Habilidades**: el saldo pasó de 10 a **810**.
- **FUERZA → MEJORAR NODO**: sube a nivel 1, el saldo baja a 710, se desbloquean RESISTENCIA y ATAQUE, y aparece en **ÚLTIMAS INVERSIONES** con tu nombre.
- *Para contar:* si dos miembros mejoran el mismo nodo a la vez, solo uno sube de nivel y al otro se le devuelven los puntos.

> **Si el micrófono falla:** cargás los campos a mano. El CU lo contempla ("campos siempre disponibles") y el resto de la demo es igual.

---

## Trazabilidad (dónde está cada cosa)

### CU-003-002 — Registrar un Entrenamiento
| Capa | Dónde |
|---|---|
| Pantalla | `src/app/(app)/arena/registrar/RegistrarClient.tsx` (DICTAR, USAR ESTOS DATOS, REGISTRAR ESFUERZO) |
| Server Action | `src/app/actions/arena.ts` → `registrarEntrenamiento()` |
| Controller | `ArenaController` → `POST /api/arena/entrenar` |
| Servicios | `ArenaService.RegistrarEntrenamiento` (valida peso 0–500 y reps 1–200) · `CerService.Calcular` · `GuerraService.AsegurarGuerraActiva` · `RecompensasService.AlEntrenar` |
| Repositorios | `EntrenamientoRepository.Crear` · `ClanRepository.SumarCER` · `GuerraRepository.SumarCER` · `MiembroRepository.ActualizarXP` · `RachaRepository.CrearOActualizar` · `AdminHistorialRepository.Registrar` |
| DER | `ENTRENAMIENTO`, `CLAN.puntos_clan`, `PARTICIPACION_GUERRA`, `RACHA`, `MIEMBRO.xp` |
| Secuencia | `secuencias-cu003-cu004.md` → CU-003-002 (actualizada 17/11) |
| E2E | `s4-s6.spec.ts` (registro, CER, guerra) y `s7-s8.spec.ts` (S10 integración) |

### CU-004-002 — Mejorar Nodo del Árbol de Habilidades
| Capa | Dónde |
|---|---|
| Pantalla | `src/app/(app)/evolucion/habilidades/page.tsx` (`SkillTreePage`) + `ArbolClient.tsx` |
| Server Action | `src/app/actions/evolucion.ts` → `mejorarNodo()` |
| Controller | `EvolucionController` → `GET arbol` / `POST nodos/mejorar` |
| Servicio | `EvolucionService.ObtenerArbol` / `MejorarNodo` (costo = `CostoPuntos × nivel`) |
| Repositorios | `SkillTreeRepository` (`BuscarPorId`, `Listar`, `NivelesDelClan`, `SubirNivel`, `RegistrarInversion`, `UltimasInversiones`) · `ClanRepository.DescontarPuntos` / `SumarPuntos` |
| DER | `NODO`, `NODO_DEPENDENCIA`, `NODO_CLAN`, `INVERSION_NODO`, `CLAN.puntos_clan` |
| Secuencia | `secuencias-cu003-cu004.md` → CU-004-002 |
| E2E | `s7-s8.spec.ts` → "CU-004-002: árbol colectivo del clan…" |

### CU-005-003 — Salvar Racha con Puntos de Clan
| Capa | Dónde |
|---|---|
| Pantalla | `src/app/(app)/santuario/page.tsx` (botón de racha, "¡Racha salvada!") · `src/app/(app)/perfil/racha/page.tsx` (`RachaPage`) + `AccionesRacha.tsx` |
| Server Action | `src/app/actions/perfil.ts` → `salvarRacha()` / `dejarMorirRacha()` |
| Controller | `PerfilController` → `POST racha/salvar` / `POST racha/dejar-morir` |
| Servicio | `PerfilService.SalvarRacha` (solo EN_RIESGO, clan propio, 50 pts) / `DejarMorirRacha` |
| Repositorios | `MiembroRepository.BuscarPorId` · `ClanRepository.DescontarPuntos` · `RachaRepository.Restaurar` / `CrearOActualizar` |
| DER | `RACHA` (1 a 1 con `MIEMBRO`, índice único), `CLAN.puntos_clan` |
| Secuencia | `secuencias-cu005.md` → CU-005-003 |
| E2E | `s7-s8.spec.ts` → los 3 tests de CU-005-003 (salvar, FA-2, seguridad entre clanes) |

## Qué se corrigió el 17/11 para que queden 100 % alineados

- **Código:** `NodoRepository` pasa a llamarse `SkillTreeRepository` y `HabilidadesPage` pasa a `SkillTreePage`, como en los diagramas.
- **Clases:**
  - `ArenaService.registrarEntrenamiento` tiene la firma real y se quitó `obtenerGuerraActiva`, que está en `GuerraService`.
  - Se agregaron las dependencias `ArenaService → ClanRepository / RecompensasService` y `EvolucionService → ClanRepository / RecompensasService`.
  - En `ClanRepository` se agregaron `sumarCER`, `sumarPuntos` y `descontarPuntos(): Boolean`.
  - En `RachaRepository` se agregaron `crearOActualizar`, `restaurar(miembroId, ahora)` y `actualizarEstado`.
  - En `SkillTreeRepository` se agregó `buscarPorId` y la relación con `NodoClan`.
  - `CERService` pasa a llamarse `CerService`, como la clase real.
- **Secuencias:**
  - CU-003-002 suma la validación de rangos en la API, la búsqueda del miembro, `RecompensasService.alEntrenar` y el registro en el historial.
  - CU-004-002 suma la devolución de puntos si otro miembro mejoró el nodo al mismo tiempo.
- **Word:** "Diagramas para la carpeta - 17-11.docx" incluye ahora la secuencia de CU-003-002 y los diagramas de clases regenerados.
