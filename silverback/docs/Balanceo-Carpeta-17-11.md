# Balanceo de la carpeta — cambios del 17/11/2026

**Proyecto:** SilverBack · **Alumno:** Sepúlveda Nicolás · **Base de comparación:** carpeta `tfi final.pdf` (versión del 13/11/2026)
**Alcance:** PKG_EVOLUCIÓN / BÓVEDA (CU-004-001 a 004) y PKG_PERFIL (CU-005-001 a 007), más correcciones generales.

> **Cómo usar este documento.** La carpeta del 13/11 es la fuente de verdad. El 17/11 se llevó **el código a lo que dice la carpeta** (CU, RF-006 a RF-016 y alcance 10.4.3). Los **textos de los CU no cambian**. Lo que sí cambia en la carpeta son los **diagramas**, porque el modelo de datos se adaptó a los CU (por ejemplo, el árbol de habilidades pasa a ser colectivo y se paga con Puntos de Clan, como dice el CU-004-002). Recorré la sección 1 en orden y marcá cada casilla cuando la pases al Word.
>
> Este documento complementa `Modificacion-Carpeta.md` (checklist v1.4, ítems 1–33). Acá están los ítems **34 a 47**.

---

## 1. Checklist de balanceo (qué tocar en la carpeta)

### 10.3 — Historial de revisión

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 34 | Tabla de historial de revisión | Agregar la fila **v1.5 · 17/11/2026 · Evolución y Perfil alineados con la carpeta** | Resumen de la sección 2 de este documento |

### 10.4.4 — Definiciones, Acrónimos y Abreviaciones

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 35 | Términos del dominio | Agregar las definiciones de **Llaves de Acero**, **Botín diario**, **Multiplicador XP**, **Carga relativa** y **Nivel** | Sección 3.1 de este documento |

### 10.5.1.1 — Mapa de Navegación

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 36 | Santuario (P4) | Agregar la flecha **P4 → P17 (Racha)**: el botón de racha activa del Santuario abre el Termómetro de Racha (CU-005-002 paso 1) y salvar la racha vuelve a P4 (CU-005-003 paso 15) | — |
| [ ] | 37 | Evolución (P12) | Agregar la flecha **P12 → P16 (Dashboard)** por el botón RENDIMIENTO (CU-004-001 pasos 15–16) | — |
| [ ] | 38 | Barra lateral | **Verificar** que el ítem de Marketplace diga **"Mercado"** (ya figura así en `mapa-de-navegacion.md`) | — |

### 10.5.3 — Casos de Uso (solo notas; el texto aprobado no cambia)

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 39 | Al pie de CU-004-001, 004-002, 004-003, 004-004, 005-001, 005-002, 005-003, 005-004, 005-006 | Agregar una **"Nota de implementación"** con los valores numéricos que la carpeta no define | Sección 3.2 de este documento (una fila por CU, lista para copiar) |
| [ ] | 40 | CU-005-007 · Extensiones | Si todavía dice "Pantalla pendiente de implementación", reemplazar por: *Implementado en S8 (`/perfil/cuenta`): datos personales y "CAMBIAR CONTRASEÑA" con confirmación.* | `casos-de-uso.md` |
| [ ] | 41 | "Pantalla:" de los 11 CU de Evolución y Perfil | **Opcional:** reemplazar la maqueta por una captura de la pantalla real (ahora siguen los pasos del CU) | Capturas de `http://localhost:3000` |

### 10.5.4 — Diagramas de Secuencia

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 42 | Secuencias CU-004-001 a CU-004-004 | **Reemplazar** las 4. Cambio principal: el árbol se paga con **Puntos de Clan** (antes decía XP), Bóveda con botín diario / Llaves de Acero, compra con confirmación + `TRANSACCION_MARKETPLACE` | `secuencias-cu003-cu004.md` → sección CU-004 |
| [ ] | 43 | Secuencias CU-005-001 a CU-005-007 | **Reemplazar** las 7. Cambios: dashboard comparativo, racha EN_RIESGO/ROTA en hora Argentina, salvar **sin `clanId`** (usa el clan del miembro) + DEJAR MORIR, fatiga relativa al peso, beneficios por estado + suscripción, cuenta con dos acciones | `secuencias-cu005.md` |

### 10.5.7 — Diagrama de Clases

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 44 | Diagrama general (10.5.7) | **Reemplazar**: se agregan `RecompensasService`, `NodoClan`, `InventarioItem`, `TransaccionMarketplace`, `ReclamoBeneficio`, `SuscripcionActiva` | `diagrama-clases.md` |
| [ ] | 45 | Diagramas por capa | **Reemplazar** dominio, servicios, repositorios y controladores (atributos y métodos nuevos; ver sección 2.3) | `clases-dominio.md`, `clases-servicios.md`, `clases-repositorios.md`, `clases-controladores.md` |

### 10.5.8 — Diagrama Entidad-Relación

| ✓ | # | Dónde | Qué hacer | Contenido |
|---|---|---|---|---|
| [ ] | 46 | DER general — filas 6 y 7 (Evolución y Perfil) + `MIEMBRO` | **Reemplazar** entidades y relaciones (detalle en sección 2.2) | `diagrama-er.md` |
| [ ] | 47 | DER 10.5.8c (Evolución y Perfil) y `MIEMBRO.rango` en el DER núcleo | **Reemplazar** el diagrama; `rango` queda `ENUM(BRONCE,PLATA,ORO)` | `er-evolucion-perfil.md`, `er-nucleo.md` |

---

## 2. Qué cambió (detalle)

### 2.1 Código alineado con la carpeta, CU por CU

| CU / RF | La carpeta dice | Antes del 17/11 | Ahora |
|---|---|---|---|
| CU-004-001 / RF-006 | Título "PERFIL", nivel, barra hacia el próximo rango, BRONCE — PLATA — ORO, atributos FUERZA / AGILIDAD / RESISTENCIA, botón RENDIMIENTO, FA-1 "MAX LEVEL", FA-2 "999+ PTS" | Solo rango y XP; sin atributos; **el rango nunca subía** | Todo implementado; el rango sube solo al ganar XP |
| 10.4.3 | Rangos BRONCE → PLATA → ORO | Había un 4° rango (RANGO S) | 3 rangos; `RANGO_S` queda sin uso |
| CU-004-002 / RF-015 | Árbol **del clan**, se invierten **Puntos de Clan**, niveles por nodo, panel de detalle, "ÚLTIMAS INVERSIONES", FA-1 tooltip, FA-2 "PUNTOS INSUFICIENTES" | Árbol individual pagado con XP, sin niveles ni historial; mostraba "MEJORAR" en nodos bloqueados | Árbol colectivo con niveles (FUERZA → RESISTENCIA / ATAQUE → FUEGO → TITÁN), SVG, panel e historial |
| CU-004-003 / 10.4.3 | 4 tarjetas (cajas, listos, MULTIPLICADOR XP, PRÓXIMO), cofre "LISTO", cofre "BLOQUEADO" con **Llaves de Acero**, "EVENTO LIMITADO", cofres ALPHA / TITANIO / OMEGA, FA-2 contador | Lista de cofres sin estadísticas; **el cofre no daba nada**; un usuario nuevo nunca recibía cofres | Botín diario, hitos, Llaves de Acero, cofre de evento por ganar la Guerra; el cofre acredita SB + XP |
| CU-004-004 / RF-011 | Filtros **SKINS / AURAS / ICONOS**, confirmación antes de comprar, FA-1 precio en rojo, FA-2 mensaje, paso 18 "disponible para activar desde el perfil", historial de compras | Categorías SKIN / HABITAT / ACCESORIO / AURA, compra directa, sin activación ni historial | Implementado, con modal de confirmación, `TRANSACCION_MARKETPLACE` e inventario con ACTIVAR en el Perfil |
| CU-005-001 / RF-007 | Grilla 2×2: ÍNDICE DE DOMINANCIA, PERFIL TÁCTICO (radar), VOLUMEN TOTAL (KG), PUNTAJE C.E.R. (Capacidad / Eficiencia / Recuperación), FA-1 "--" | 4 números sueltos | Implementado contra el promedio y el máximo del clan |
| CU-005-002 / 003 / RF-008 | "RACHA ACTUAL", banner "RACHA A PUNTO DE PERDERSE", "costo pts (Tienes: saldo pts)", "DEJAR MORIR LA RACHA", vuelve al Santuario, botón de racha en el Santuario | Solo "SALVAR RACHA"; racha en UTC; **se podían gastar los puntos de otro clan** | Implementado; racha en hora Argentina; se reinicia a 0 si se pierde |
| CU-005-004 / RF-009 | Indicador circular, CARGA %, DIAGNÓSTICO ESTRUCTURAL, PROTOCOLO "MANDATO" (intensidad 50 %, movilidad, hidratación), TENDENCIA SEMANAL, FA-1 "ESTADO ÓPTIMO" | Nivel y carga | Implementado; la carga se mide contra el peso corporal (dato biométrico) |
| CU-005-005 / RF-010 | VICTORIAS, rango, trofeo destacado, FA-1 mensaje exacto, FA-2 modal de detalle; medallas automáticas por hitos | Lista simple; **nunca se otorgaban trofeos** | Implementado; hitos automáticos (100 CER, 10 entrenamientos, 7 días de racha, ganar la Guerra) |
| CU-005-006 / RF-016 | DESTACADO, FILTROS, beneficios **bloqueados visibles** con el nivel, vencimiento → "EXPIRADO", acciones DESBLOQUEAR CÓDIGO / CANJEAR / COPIAR CUPÓN / ACTIVAR OFERTA | Los bloqueados no aparecían; un PLATA podía reclamar los de ORO; sin vencimientos | Implementado, con `SUSCRIPCION_ACTIVA` al activar la oferta |
| CU-005-007 | NOMBRE / EMAIL + "GUARDAR CAMBIOS"; "CAMBIAR CONTRASEÑA" con actual, nueva y **confirmación**; FA-1, FA-2, FA-3 | Un solo formulario, sin confirmación | Dos acciones; mensajes de los FA textuales |

### 2.2 Modelo de datos (DER)

| Entidad | Cambio | Motivo |
|---|---|---|
| `MIEMBRO` | + `llaves_acero` · `rango` sin `RANGO_S` | CU-004-003 · 10.4.3 |
| `NODO` | `costo_xp` → `costo_puntos`; + `nivel_maximo`, `efecto`, `bonus_por_nivel`, `descripcion` | CU-004-002 / RF-015 (Puntos de Clan, niveles, efecto actual y siguiente) |
| `NODO_CLAN` (nueva) | `clan_id + nodo_id` (PK), `nivel` | El árbol es del clan |
| `INVERSION_NODO` | Pasa a historial: `id`, `clan_id`, `nodo_id`, `miembro_id`, `nivel_alcanzado`, `costo`, `fecha` | Panel "ÚLTIMAS INVERSIONES" |
| `NODO_DEPENDENCIA` | Se dibuja como tabla (antes era una relación N:M sin nombre) | Ya existía en la base |
| `COFRE` | + `origen` (BOTIN_DIARIO / HITO / GUERRA), `llaves_requeridas`, `fecha_obtencion` | CU-004-003 |
| `ITEM` | `categoria` → `ENUM(SKIN,AURA,ICONO)`; `rareza` (ya estaba en la carpeta, ahora existe en la base) | CU-004-004 |
| `INVENTARIO_ITEMS` | + `activo` | CU-004-004 paso 18 |
| `TRANSACCION_MARKETPLACE` | Ya estaba en la carpeta; **ahora existe en la base** | RF-011 (historial de compras) |
| `BENEFICIO_ALIADO` | + `titulo`, `descripcion`, `categoria`, `destacado`, `fecha_vencimiento`; − `miembro_id`, `fecha_reclamo` | RF-016; un beneficio lo reclaman muchos miembros |
| `RECLAMO_BENEFICIO` (nueva en el DER) | `beneficio_id + miembro_id` (PK), `fecha_reclamo` | Reemplaza `miembro_id` en `BENEFICIO_ALIADO` (ya existía en la base) |
| `SUSCRIPCION_ACTIVA` | Ya estaba en la carpeta; **ahora existe en la base** | CU-005-006 paso 18 |

Migraciones: `20261117181523_CarpetaEvolucionPerfil` y `20261117182731_CarpetaDerEvolucion`. La primera borra el catálogo viejo (nodos, ítems, beneficios), que la API vuelve a cargar al iniciar con el catálogo nuevo.

### 2.3 Clases y endpoints

| Capa | Cambio |
|---|---|
| Servicios | + `RecompensasService` (hitos, cofres, llaves, rango) · + utilitarios `Progresion` y `HoraArgentina` · `EvolucionService`: `obtenerArbol`, `obtenerBoveda`, `calcularAtributos` · `PerfilService`: `salvarRacha(miembroId)` **sin clanId**, `dejarMorirRacha`, `inventario`, `activarItem`, `cambiarPassword(…, confirmacion)` |
| Repositorios | `SkillTreeRepository` (en el código, `NodoRepository`): `nivelesDelClan`, `subirNivel`, `registrarInversion`, `ultimasInversiones` · `CofreRepository`: `existeDesde`, `crear` · `MarketplaceRepository`: `posee`, `inventario`, `activar` · `BeneficioRepository`: `listar`, `expirarVencidos`, `crearSuscripcion` |
| Controladores | `GET /api/evolucion/arbol` y `GET /api/evolucion/boveda` (reemplazan `/nodos` y `/cofres`) · `POST /api/perfil/racha/dejar-morir` · `GET /api/perfil/inventario` · `POST /api/perfil/inventario/{id}/activar` · `PUT /api/perfil/cuenta/password` |

---

## 3. Textos para copiar

### 3.1 Definiciones (10.4.4)

- **Llaves de Acero:** recurso que se gana entrenando (una cada 5 entrenamientos) y se usa para abrir los cofres bloqueados de la Bóveda.
- **Botín diario:** cofre ALPHA que se habilita una vez por día (hora Argentina) para el miembro que entrenó ese día o el anterior.
- **Multiplicador XP:** factor que se aplica a la XP de los cofres: x1.0 más 0.1 por cada día de racha, hasta x2.0.
- **Carga relativa:** CER de los últimos 7 días dividido por el peso corporal del miembro. Es la base del monitor de fatiga.
- **Nivel:** indicador numérico de progreso individual: 1 + XP / 100.

### 3.2 Notas de implementación por CU (10.5.3)

| CU | Nota de implementación (copiar al pie del CU) |
|---|---|
| CU-004-001 | Rangos: PLATA desde 500 XP y ORO desde 1500 XP (máximo, "MAX LEVEL"). Nivel = 1 + XP / 100. Atributos: FUERZA = Σ(kg × repeticiones) / 100; RESISTENCIA = Σ repeticiones; AGILIDAD = días distintos con entrenamiento × 10. |
| CU-004-002 | El árbol es único por clan: FUERZA (raíz) → RESISTENCIA y ATAQUE → FUEGO → TITÁN. Mejorar un nivel cuesta *costo base × nivel* Puntos de Clan y lo puede hacer cualquier miembro. Los efectos se muestran como mejora del clan y no alteran la fórmula del CER (RNF-003). |
| CU-004-003 | Cofres: ALPHA (botín diario y primer entrenamiento), TITANIO (7 días de racha), OMEGA (10 entrenamientos, se abre con 2 Llaves de Acero) y EVENTO LIMITADO (ganar la Guerra Global semanal). Contenido: ALPHA 100 SB + 10 XP, TITANIO 250 SB + 25 XP, OMEGA 500 SB + 50 XP, EVENTO 1000 SB + 100 XP; la XP se multiplica por el multiplicador del día. "PRÓXIMO" cuenta hasta la medianoche (hora Argentina). |
| CU-004-004 | Una compra descuenta el saldo en una sola operación atómica: dos compras simultáneas no pueden dejar saldo negativo. No se puede comprar dos veces el mismo ítem. Desde el Perfil se activa un ítem por categoría. |
| CU-005-001 | Índice de Dominancia = porcentaje de miembros del clan con CER de 7 días menor o igual al del usuario. Radar normalizado al máximo del clan en cada eje (TÉCNICA = CER promedio por sesión). Capacidad = CER promedio / CER máximo del clan; Eficiencia = CER promedio / promedio del clan × 50; Recuperación = 100 − carga de fatiga. Rango C.E.R.: S ≥ 85, A ≥ 70, B ≥ 50, C. |
| CU-005-002 | La racha se mide en días calendario de Argentina. Si el último entrenamiento fue ayer, la racha está en riesgo; si fue antes, se pierde y vuelve a 0. |
| CU-005-003 | El rescate cuesta 50 Puntos de Clan del clan del miembro (RF-008 habla de "monedas virtuales"; se sigue el CU y el alcance 10.4.3, que dicen Puntos de Clan). |
| CU-005-004 | Umbrales de carga relativa (CER 7 días / kg): ÓPTIMA ≤ 40, MODERADA ≤ 70, ELEVADA ≤ 100, CRÍTICA > 100 (protocolo mandatorio). FA-2: como los wearables están fuera de alcance (10.4.3), la advertencia aparece si los datos biométricos tienen más de 90 días. |
| CU-005-006 | Los códigos son de ejemplo y los aliados usan URLs de ejemplo: no hay integración real (10.4.3, Limitaciones). "ACTIVAR OFERTA" crea una suscripción activa por 30 días. |

---

## 4. Bugs encontrados y corregidos (17/11)

| # | Bug | Impacto |
|---|---|---|
| 1 | Las server actions de Evolución y Perfil exportaban funciones sin `async` | Ninguna pantalla de Evolución ni Perfil compilaba en Next 16 |
| 2 | `POST /racha/salvar` aceptaba cualquier `clanId` | Se podían gastar los Puntos de Clan de otro clan |
| 3 | Rango guardado como texto y comparado en SQL | Un PLATA veía y reclamaba beneficios de ORO (orden alfabético) |
| 4 | Compra, cofre y nodo leían el saldo y después descontaban | Doble gasto con requests simultáneas; un cofre se podía reclamar dos veces |
| 5 | Comprar un ítem que ya tenías | Se cobraba y después fallaba el registro: perdías el saldo |
| 6 | El rango nunca se actualizaba | Todos en BRONCE para siempre |
| 7 | No se generaban cofres ni trofeos para usuarios nuevos; el cofre no daba nada | Bóveda y Vitrina vacías; Marketplace inutilizable |
| 8 | Racha calculada en UTC y nunca "en riesgo" | Salvar la racha no tenía efecto; entrenar de noche contaba para otro día |
| 9 | `POST /arena/entrenar` sin validar | Un peso negativo restaba CER al clan y a la Guerra Global |
| 10 | Datos de cuenta guardaba el nombre antes de validar la contraseña | Cambios a medias |
| 11 | Árbol sin prerequisitos en la respuesta | Mostraba "MEJORAR" en nodos bloqueados |
| 12 | Al reclamar un beneficio la tarjeta desaparecía | El cupón no llegaba a verse |
| 13 | Catálogo cargado solo en la demo de Docker | En local, árbol, Mercado y Beneficios vacíos |
| 14 | Umbrales de fatiga en CER absoluto (≤ 100 / 250 / 400) | Una sola sesión típica (528 CER) ya daba CRÍTICA |

---

## 5. Lo que sigue sin coincidir con la carpeta (y por qué)

| Tema | Carpeta | App | Qué hacer |
|---|---|---|---|
| Roles | 10.4.3 "Limitaciones": roles binarios (Miembro / Líder) | 4 roles (SILVERBACK / BETA / EXPLORADOR / RECLUTA), decisión de S4 ya registrada en `Modificacion-Carpeta.md` §1 | Confirmar que la carpeta tenga la nota de S4 |
| Costo del rescate de racha | RF-008: "monedas virtuales"; CU-005-003 y 10.4.3: "Puntos de Clan" | Puntos de Clan | Nota del CU-005-003 (sección 3.2) |
| Efecto de los nodos | "Mejoras colectivas que benefician a todos" | El efecto se muestra pero no modifica el CER (RNF-003, fórmula determinística) | Nota del CU-004-002 |
| Ítem activo | Paso 18: "disponible para activar desde el perfil" | Se activa y queda marcado ACTIVO; el avatar todavía no cambia de aspecto | Opcional: se puede mostrar en una próxima versión |
| FA-2 de CU-005-004 | "Wearable desconectado" | Wearables fuera de alcance: se usa la antigüedad de los datos biométricos | Nota del CU-005-004 |

---

## 6. Verificación

- Suite E2E: **33 tests, 33 OK**, en dos corridas seguidas (`cd silverback && npm run test:e2e`). `s7-s8.spec.ts` recorre cada CU de Evolución y Perfil contra los pasos y FA de la carpeta. `s4-s6.spec.ts` verifica además el premio de la Guerra Global.
- `next build` de producción OK.
- Backup previo a las migraciones: `C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\Backup\silverback_pre_carpeta_20261117.bak`.
