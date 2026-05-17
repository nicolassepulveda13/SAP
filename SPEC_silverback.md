# SPEC — SilverBack Web App
> Stack: Next.js + React (App Router) + Supabase + TypeScript
> Web-first. Responsive. Mobile como mejora progresiva.

---

## ROL Y CONTEXTO

Actúa como un Senior Web Developer y Arquitecto de Software experto en Next.js (App Router), React y TypeScript.

Estamos construyendo el MVP de una aplicación web llamada **"SilverBack" (El Camino del Gorila)**. Es una app de fitness gamificada cuyo núcleo (MVP 3) es un ecosistema social asíncrono llamado **"Duelo de Manadas"**. En esta app, los usuarios registran sus entrenamientos, el sistema normaliza su esfuerzo matemáticamente (**Coeficiente de Esfuerzo Relativo - CER**), y compiten en equipos (Manadas) contra otros grupos.

---

## ALCANCE DEL PROYECTO — 20 PÁGINAS Y 20 CASOS DE USO

### Páginas (Rutas) y Descripción de UI

**[ONBOARDING] — Rutas: /onboarding/***

1. **BiometricCalibrationPage** `/onboarding/biometrics`
   Formulario inicial. Inputs numéricos para edad, peso, altura y un `<select>` de nivel de experiencia. Botón grande "Continuar".

2. **ArchetypeSelectorPage** `/onboarding/archetype`
   Grid de 3 tarjetas (Bulking, Definido, Atlético) con título, descripción y botón "Confirmar Arquetipo". Al confirmar redirige al matchmaking.

3. **MatchmakingPage** `/onboarding/matchmaking`
   Input de búsqueda de Manadas y lista de tarjetas de clanes simuladas, cada una con botón "Unirse".

---

**[HUB DE MANADA] — Rutas: /santuario/***

4. **ClanHubPage** `/santuario` *(ruta principal del tab)*
   Dashboard. Header con nombre del clan, círculo grande para el Avatar Grupal, indicador de días de racha (Streak) y botones rápidos a Forja y Sala de Tácticas.

5. **ChallengeForgePage** `/santuario/forja`
   Lista vertical de tarjetas de "Desafíos Semanales": título, barra de progreso estática y botón "Aceptar Desafío".

6. **TacticsRoomPage** `/santuario/tacticas`
   Interfaz tipo Chat/Muro. Lista de mensajes/alertas del sistema e input inferior con botón "Enviar".

7. **RbacManagementPage** `/santuario/roles`
   Lista de miembros del clan. Cada fila: nombre, `<select>` de Rol y botón rojo "Expulsar" (solo UI).

---

**[LA ARENA] — Rutas: /arena/***

8. **BattleArenaPage** `/arena` *(ruta principal del tab)*
   Vista competitiva. Dos barras de progreso enfrentadas ("Nosotros" vs "Ellos") y botón "Registrar Entrenamiento".

9. **EffortEntryPage** `/arena/registrar`
   Formulario transaccional. Input para nombre de ejercicio, inputs numéricos grandes para "Kilos" y "Repeticiones", botón destacado "Registrar Esfuerzo".

10. **CerCalculatorPage** `/arena/calculadora`
    Muestra la fórmula matemática desglosada (ej: "Peso / Reps * Modificador") y el puntaje CER total en grande.

11. **BattleHistoryPage** `/arena/historial`
    Lista de enfrentamientos pasados. Cada ítem: fecha, clan rival, etiqueta "Victoria" (verde) o "Derrota" (roja).

---

**[EVOLUCIÓN Y RECOMPENSAS] — Rutas: /evolucion/***

12. **EvolutionChamberPage** `/evolucion` *(ruta principal del tab)*
    Recuadro grande para el Avatar del usuario, barra de progreso de "Experiencia" hacia el siguiente nivel y estadísticas básicas.

13. **SkillTreePage** `/evolucion/habilidades`
    Cuadrícula o diagrama de árbol. Nodos bloqueados (icono de candado) y saldo de "Puntos de Clan" en la parte superior.

14. **LootVaultPage** `/evolucion/botin`
    Tarjetas simulando cofres o premios listos para reclamar, con botón "Reclamar".

15. **MarketplacePage** `/evolucion/tienda`
    Grid de 2 columnas tipo e-commerce. Items cosméticos con precio en monedas virtuales y botón "Comprar".

---

**[DASHBOARDS ANALÍTICOS] — Rutas: /perfil/***

16. **PerformanceDashboardPage** `/perfil` *(ruta principal del tab)*
    Contenedores simulando gráficos (divs de color gris como placeholder de radar chart) comparando al usuario con el promedio del clan.

17. **StreakSaverPage** `/perfil/racha`
    Panel minimalista. Número enorme en el centro (días de racha) y botón de emergencia "Salvar racha por 100pts".

18. **FatigueRadarPage** `/perfil/fatiga`
    Panel estilo semáforo (div rojo/amarillo/verde) y gráfico de línea de fatiga como placeholder.

19. **TrophyShowcasePage** `/perfil/trofeos`
    Vista tipo perfil. Foto del clan y grid de iconos de medallas obtenidas.

20. **AlliedBenefitsPage** `/perfil/beneficios`
    Lista de tarjetas promocionales con descuentos y botón "Revelar código" o "Ir a tienda".

---

## CASOS DE USO CORE (20)

| ID | Nombre | Página principal |
|----|--------|-----------------|
| CU01 | Calibrar Biometría | BiometricCalibrationPage |
| CU02 | Asignar Arquetipo | ArchetypeSelectorPage |
| CU03 | Postular a Manada | MatchmakingPage |
| CU04 | Fundar Manada | MatchmakingPage |
| CU05 | Gestionar Roles | RbacManagementPage |
| CU06 | Proponer Desafío | ChallengeForgePage |
| CU07 | Registrar Esfuerzo | EffortEntryPage |
| CU08 | Calcular CER | CerCalculatorPage |
| CU09 | Sincronizar Arena | BattleArenaPage |
| CU10 | Notificar Hitos | ClanHubPage |
| CU11 | Desplegar Evolución | EvolutionChamberPage |
| CU12 | Distribuir Recompensas | LootVaultPage |
| CU13 | Asignar Habilidades | SkillTreePage |
| CU14 | Canjear Cosméticos | MarketplacePage |
| CU15 | Analizar Rendimiento | PerformanceDashboardPage |
| CU16 | Salvar Racha | StreakSaverPage |
| CU17 | Monitorear Fatiga | FatigueRadarPage |
| CU18 | Consultar Historial | BattleHistoryPage |
| CU19 | Compartir Vitrina | TrophyShowcasePage |
| CU20 | Reclamar Cupones | AlliedBenefitsPage |

---

## ESTRUCTURA DE NAVEGACIÓN — Next.js App Router

```
app/
├── layout.tsx                    ← Layout raíz
├── page.tsx                      ← Redirect a /onboarding o /santuario
│
├── onboarding/
│   ├── layout.tsx                ← Layout limpio sin navbar (AuthLayout)
│   ├── biometrics/page.tsx       ← Pantalla 1
│   ├── archetype/page.tsx        ← Pantalla 2
│   └── matchmaking/page.tsx      ← Pantalla 3
│
├── (app)/                        ← Grupo con navbar principal (tabs)
│   ├── layout.tsx                ← NavLayout con barra de navegación
│   │
│   ├── santuario/
│   │   ├── page.tsx              ← Pantalla 4 (ClanHub)
│   │   ├── forja/page.tsx        ← Pantalla 5
│   │   ├── tacticas/page.tsx     ← Pantalla 6
│   │   └── roles/page.tsx        ← Pantalla 7
│   │
│   ├── arena/
│   │   ├── page.tsx              ← Pantalla 8 (BattleArena)
│   │   ├── registrar/page.tsx    ← Pantalla 9
│   │   ├── calculadora/page.tsx  ← Pantalla 10
│   │   └── historial/page.tsx    ← Pantalla 11
│   │
│   ├── evolucion/
│   │   ├── page.tsx              ← Pantalla 12 (EvolutionChamber)
│   │   ├── habilidades/page.tsx  ← Pantalla 13
│   │   ├── botin/page.tsx        ← Pantalla 14
│   │   └── tienda/page.tsx       ← Pantalla 15
│   │
│   └── perfil/
│       ├── page.tsx              ← Pantalla 16 (PerformanceDashboard)
│       ├── racha/page.tsx        ← Pantalla 17
│       ├── fatiga/page.tsx       ← Pantalla 18
│       ├── trofeos/page.tsx      ← Pantalla 19
│       └── beneficios/page.tsx   ← Pantalla 20
```

---

## INSTRUCCIONES DE DESARROLLO (FASE 1 — SCAFFOLDING)

Para la primera fase académica (E1): navegación funcional + wireframes de UI.
**NO** se requiere lógica de negocio real ni conexión a Supabase todavía.

### Tareas:
1. Inicializar proyecto Next.js con App Router + TypeScript + Tailwind CSS
2. Crear la estructura de carpetas de rutas según el árbol de arriba
3. Implementar cada página con los elementos de UI descriptos (inputs, botones, listas, placeholders de gráficos) usando HTML semántico + Tailwind
4. Configurar el layout de onboarding (sin navbar) y el layout de app (con navbar de 4 tabs)
5. Asegurar que todos los links de navegación entre las 20 páginas funcionen

### Componentes de UI web equivalentes:
| Concepto original | Implementación web |
|-------------------|--------------------|
| `TextInput` | `<input type="text">` |
| Input numérico | `<input type="number">` |
| `TouchableOpacity` / botón | `<button>` con clases Tailwind |
| `FlatList` | `<ul>` + `.map()` |
| `Select/Picker` | `<select>` o componente Select (shadcn/ui) |
| Barra de progreso | `<progress>` o div con width% |
| `Modal` | Dialog de shadcn/ui o `<dialog>` nativo |
| Tab navigator (barra inferior) | Navbar con links + active state (responsive: abajo en mobile, lateral o arriba en desktop) |
| Avatar / imagen | `<Image>` de Next.js |
| Semáforo de fatiga | `<div>` con color condicional vía Tailwind |
