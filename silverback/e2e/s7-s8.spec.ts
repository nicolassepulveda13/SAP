// E2E S7–S8: Evolución / Bóveda (CU-004-001 a 004) y Perfil (CU-005-001 a 007), contra el texto de la carpeta
// (CU, RF-006 a RF-016 y alcance 10.4.3). Hace también de recorrido integrado de S10: usuario nuevo → onboarding →
// clan → entrenar → progresar → perfil, con datos reales en cada paso.
// Cada corrida crea sus propios usuarios y clanes (sufijo único). Los tests van en orden y comparten estado.
import { test, expect } from "@playwright/test";
import { API, PASSWORD, api, corrida, fundarClan, nuevoUsuario, sql, unirseAClan, type Usuario } from "./helpers";

const CLAN = `E2E Delta ${corrida}`;
const CLAN_AJENO = `E2E Epsilon ${corrida}`;

let atleta: Usuario;    // funda CLAN → SILVERBACK, VOLUMEN (×1.1), 82 kg
let companero: Usuario; // se une a CLAN → RECLUTA, ATLETICO (×1.0), 82 kg
let ajeno: Usuario;     // funda CLAN_AJENO, nunca entrena (0 puntos de clan)

const idMiembro = (u: Usuario) => sql(`SELECT Id FROM Miembros WHERE Email = '${u.email}'`);
const campo = (u: Usuario, c: string) => Number(sql(`SELECT ${c} FROM Miembros WHERE Email = '${u.email}'`));
const coins = (u: Usuario) => campo(u, "Coins");
const puntosClan = (nombre: string) => Number(sql(`SELECT PuntosClan FROM Clanes WHERE Nombre = '${nombre}'`));
const idItem = (nombre: string) => sql(`SELECT Id FROM Items WHERE Nombre = N'${nombre}'`);
const idNodo = (nombre: string) => sql(`SELECT Id FROM Nodos WHERE Nombre = N'${nombre}'`);
const entrenar = (u: Usuario, ejercicio: string, pesoKg: number, repeticiones: number) =>
  api(u, "POST", "/api/arena/entrenar", { ejercicio, pesoKg, repeticiones });
const tarjeta = (u: Usuario, texto: string) => u.page.locator("div.rounded-xl").filter({ hasText: texto });

test.describe.serial("S7–S8", () => {
  test.beforeAll(async ({ browser }) => {
    atleta = await nuevoUsuario(browser, "atleta");
    companero = await nuevoUsuario(browser, "companero");
    ajeno = await nuevoUsuario(browser, "ajeno");
  });

  test.afterAll(async () => {
    for (const u of [atleta, companero, ajeno]) await u?.context.close();
    // Estos clanes suman mucho CER: se sacan de la guerra de la semana para no alterar el ranking que
    // espera la suite S4–S6 en la próxima corrida (sus entrenamientos y puntos de clan quedan)
    sql(`DELETE p FROM ParticipacionesGuerra p JOIN Clanes c ON c.Id = p.ClanId JOIN GuerrasGlobales g ON g.Id = p.GuerraId WHERE g.Estado = 'ACTIVA' AND c.Nombre IN ('${CLAN}', '${CLAN_AJENO}')`);
  });

  test("Incorporación: un clan con dos miembros y un clan ajeno", async () => {
    test.setTimeout(300_000);
    await fundarClan(atleta, CLAN, "VOLUMEN");
    await unirseAClan(companero, CLAN, "ATLETICO");
    await fundarClan(ajeno, CLAN_AJENO, "DEFINIDO");
  });

  test("Estado inicial: sin entrenar no hay trofeos (CU-005-005 FA-1), rango BRONCE, nivel 1, 0 coins", async () => {
    await atleta.page.goto("/perfil/trofeos");
    await expect(atleta.page.getByText("Aún no tienes trofeos. Participa en la Arena para comenzar tu historia.")).toBeVisible();
    // RF-011: sin entrenar no hay botín diario (las monedas se ganan entrenando)
    await atleta.page.goto("/evolucion/botin");
    await expect(atleta.page.getByText("Entrená hoy para desbloquear el botín diario")).toBeVisible();
    await atleta.page.goto("/evolucion");
    await expect(atleta.page.getByTestId("escalera-rangos")).toContainText("BRONCE ◆");
    await expect(atleta.page.getByTestId("nivel")).toHaveText("NIVEL 1");
    expect(coins(atleta)).toBe(0);
  });

  test("Validación server-side: no se aceptan entrenamientos inválidos", async () => {
    const antes = puntosClan(CLAN);
    for (const [peso, reps] of [[-100, 10], [0, 10], [600, 10], [60, 0], [60, 500]]) {
      const r = await entrenar(atleta, "trampa", peso, reps);
      expect(r.status, `${peso} kg × ${reps}`).toBe(400);
    }
    expect((await entrenar(atleta, " ", 60, 8)).status).toBe(400);
    expect(puntosClan(CLAN)).toBe(antes);
  });

  test("RF-010: el primer entrenamiento otorga medallas automáticamente (una sola vez)", async () => {
    await atleta.page.goto("/arena/registrar");
    await atleta.page.locator('input[name="ejercicio"]').fill("sentadilla");
    // Valores por defecto: 60 kg × 8 reps × VOLUMEN 1.1 = 528 CER → 52 XP
    await atleta.page.getByRole("button", { name: /REGISTRAR ESFUERZO/ }).click();
    await expect(atleta.page.getByText("+52 XP")).toBeVisible();

    // "Primer Esfuerzo" + "Centurión" (100 CER acumulado) y un cofre ALPHA por hito
    const id = idMiembro(atleta);
    expect(sql(`SELECT COUNT(*) FROM Trofeos WHERE MiembroId = '${id}'`)).toBe("2");
    expect(sql(`SELECT COUNT(*) FROM Cofres WHERE MiembroId = '${id}' AND Rareza = 'COMUN'`)).toBe("1");
    expect((await entrenar(atleta, "remo", 50, 10)).status).toBe(200);
    expect(sql(`SELECT COUNT(*) FROM Trofeos WHERE MiembroId = '${id}'`)).toBe("2");
  });

  test("CU-004-001: nivel, barra hacia el próximo rango, BRONCE → PLATA y atributos (RF-006)", async () => {
    // 200 kg × 30 × 1.1 = 6600 CER → 660 XP. Total: 52 + 55 + 660 = 767 ≥ 500 → PLATA, nivel 8
    expect((await entrenar(atleta, "peso muerto", 200, 30)).status).toBe(200);
    expect(sql(`SELECT Rango FROM Miembros WHERE Email = '${atleta.email}'`)).toBe("PLATA");

    await atleta.page.goto("/evolucion");
    await expect(atleta.page.getByRole("heading", { name: "PERFIL" })).toBeVisible();
    await expect(atleta.page.getByText("Cámara de desarrollo de atributos físicos y nivel de clan.")).toBeVisible();
    await expect(atleta.page.getByTestId("nivel")).toHaveText("NIVEL 8");
    await expect(atleta.page.getByTestId("escalera-rangos")).toHaveText(/BRONCE\s*—\s*PLATA ◆\s*—\s*ORO/);
    await expect(atleta.page.getByTestId("progreso-rango")).toContainText("faltan 733 XP");
    // FUERZA = (480 + 500 + 6000) / 100 = 70 · RESISTENCIA = 8 + 10 + 30 = 48 · AGILIDAD = 1 día × 10
    await expect(atleta.page.getByTestId("atributo-FUERZA")).toContainText("70 PTS");
    await expect(atleta.page.getByTestId("atributo-RESISTENCIA")).toContainText("48 PTS");
    await expect(atleta.page.getByTestId("atributo-AGILIDAD")).toContainText("10 PTS");

    // Paso 15–16: RENDIMIENTO → Dashboard
    await atleta.page.getByRole("link", { name: /RENDIMIENTO/ }).click();
    await expect(atleta.page).toHaveURL(/\/perfil$/);
  });

  test("CU-004-001 FA-1 / FA-2: MAX LEVEL en ORO y atributos 999+ PTS", async () => {
    sql(`UPDATE Miembros SET Xp = 2000, Rango = 'ORO' WHERE Email = '${companero.email}'`);
    await entrenar(companero, "press", 400, 200); // 80.000 kg×reps → FUERZA 800; RESISTENCIA 200
    await entrenar(companero, "press", 400, 100); // FUERZA 1200 → 999+
    await companero.page.goto("/evolucion");
    await expect(companero.page.getByTestId("progreso-rango")).toHaveText("MAX LEVEL");
    await expect(companero.page.getByTestId("atributo-FUERZA")).toContainText("999+ PTS");
    // Se restaura para no afectar los demás tests (sus entrenamientos se borran)
    sql(`DELETE FROM Entrenamientos WHERE MiembroId = '${idMiembro(companero)}'; UPDATE Miembros SET Xp = 0, Rango = 'BRONCE' WHERE Email = '${companero.email}'`);
  });

  test("CU-004-003: Bóveda con 4 tarjetas, botín diario, multiplicador y cofre LISTO que acredita SB + XP", async () => {
    await atleta.page.goto("/evolucion/botin");
    await expect(atleta.page.getByText("Reclama tus recompensas de alto rendimiento. El esfuerzo se paga en metal y recursos.")).toBeVisible();
    // Cofre ALPHA del hito + botín diario ALPHA
    await expect(atleta.page.getByTestId("stat-cajas")).toHaveText("2");
    await expect(atleta.page.getByTestId("stat-listos")).toHaveText("2");
    await expect(atleta.page.getByTestId("stat-multiplicador")).toHaveText("x1.1"); // racha de 1 día
    await expect(atleta.page.getByTestId("stat-proximo")).toHaveText(/^\d\d:\d\d:\d\d$/);

    const xpAntes = campo(atleta, "Xp");
    const cofre = atleta.page.getByTestId("cofre").filter({ hasText: "LISTO" }).first();
    await expect(cofre).toContainText("COFRE ALPHA");
    await cofre.getByRole("button", { name: "RECLAMAR" }).click();
    await expect(atleta.page.getByTestId("cofre-abierto")).toContainText("COFRE ALPHA: +100 SB · +11 XP"); // 10 XP × 1.1
    await expect(atleta.page.getByTestId("stat-cajas")).toHaveText("1");
    expect(coins(atleta)).toBe(100);
    expect(campo(atleta, "Xp")).toBe(xpAntes + 11);

    // No se reclama dos veces, ni el cofre de otro miembro
    const reclamado = sql(`SELECT TOP 1 Id FROM Cofres WHERE MiembroId = '${idMiembro(atleta)}' AND Estado = 'RECLAMADO'`);
    expect((await api(atleta, "POST", `/api/evolucion/cofres/${reclamado}/reclamar`)).status).toBe(400);
    await api(companero, "GET", "/api/evolucion/boveda"); // genera el botín diario del compañero
    const ajenoCofre = sql(`SELECT TOP 1 Id FROM Cofres WHERE MiembroId = '${idMiembro(companero)}'`);
    expect((await api(atleta, "POST", `/api/evolucion/cofres/${ajenoCofre}/reclamar`)).status).toBe(400);
    expect(coins(atleta)).toBe(100);
  });

  test("CU-004-003: cofre BLOQUEADO con Llaves de Acero (FA-1) y botín diario único", async () => {
    const id = idMiembro(atleta);
    sql(`INSERT INTO Cofres (Id, MiembroId, Rareza, Estado, ObtendioEn, LlavesRequeridas) VALUES (NEWID(), '${id}', 'EPICO', 'DISPONIBLE', GETUTCDATE(), 2)`);
    sql(`UPDATE Miembros SET LlavesAcero = 1 WHERE Id = '${id}'`);
    await atleta.page.goto("/evolucion/botin");
    const omega = atleta.page.getByTestId("cofre").filter({ hasText: "COFRE OMEGA" });
    await expect(omega).toContainText("BLOQUEADO");
    await expect(omega.getByRole("button")).toBeDisabled();
    await expect(omega).toContainText("Ganás una cada 5 entrenamientos");
    const omegaId = sql(`SELECT Id FROM Cofres WHERE MiembroId = '${id}' AND Rareza = 'EPICO'`);
    const sinLlaves = await api(atleta, "POST", `/api/evolucion/cofres/${omegaId}/reclamar`);
    expect(sinLlaves.status).toBe(400);
    expect(sinLlaves.json?.error).toContain("Llaves de Acero");

    sql(`UPDATE Miembros SET LlavesAcero = 2 WHERE Id = '${id}'`);
    await atleta.page.reload();
    await omega.getByRole("button", { name: /ABRIR/ }).click();
    await expect(atleta.page.getByTestId("cofre-abierto")).toContainText("COFRE OMEGA: +500 SB");
    expect(campo(atleta, "LlavesAcero")).toBe(0);
    expect(coins(atleta)).toBe(600);

    // El botín diario no se duplica al volver a entrar
    await api(atleta, "GET", "/api/evolucion/boveda");
    await api(atleta, "GET", "/api/evolucion/boveda");
    expect(sql(`SELECT COUNT(*) FROM Cofres WHERE MiembroId = '${id}' AND Origen = 'BOTIN_DIARIO'`)).toBe("1");
    // Para los tests siguientes: saldo conocido
    sql(`UPDATE Miembros SET Coins = 100 WHERE Id = '${id}'`);
  });

  test("CU-004-004: filtros SKINS/AURAS/ICONOS, confirmación de compra y saldo que nunca queda negativo", async () => {
    await atleta.page.goto("/evolucion/tienda");
    await expect(atleta.page.getByText("Equípate con las mejores skins, auras e iconos. Demuestra tu jerarquía en la arena.")).toBeVisible();
    await expect(atleta.page.getByTestId("saldo-sb")).toHaveText("100 SB");

    // Filtros (pasos 6–10)
    await atleta.page.getByRole("link", { name: "SKINS" }).click();
    await expect(atleta.page.getByTestId("item")).toHaveCount(2);
    await expect(atleta.page.getByTestId("item").first()).toContainText("SKIN");
    await atleta.page.getByRole("link", { name: "TODOS" }).click();
    await expect(atleta.page.getByTestId("item")).toHaveCount(6);

    // FA-1: sin saldo → botón deshabilitado y precio en rojo
    const aura = atleta.page.getByTestId("item").filter({ hasText: "Aura de Fuego" });
    await expect(aura.getByRole("button", { name: "COMPRAR" })).toBeDisabled();
    await expect(aura.getByTestId("precio")).toHaveClass(/text-red-500/);

    // Pasos 15–17: COMPRAR → confirmación con nombre y costo → descuento
    const icono = atleta.page.getByTestId("item").filter({ hasText: "Ícono Gorila Alfa" });
    await icono.getByRole("button", { name: "COMPRAR" }).click();
    const dialogo = atleta.page.getByRole("dialog", { name: "Confirmar compra" });
    await expect(dialogo).toContainText("Ícono Gorila Alfa");
    await expect(dialogo).toContainText("100 SB");
    await dialogo.getByRole("button", { name: "CONFIRMAR" }).click();
    await expect(atleta.page.getByText("Compraste Ícono Gorila Alfa")).toBeVisible();
    await expect(atleta.page.getByTestId("saldo-sb")).toHaveText("0 SB");
    expect(coins(atleta)).toBe(0);

    // Sin saldo la API rechaza; un ítem que ya tenés no se vuelve a cobrar
    const r = await api(atleta, "POST", "/api/evolucion/items/comprar", { itemId: idItem("Ícono Manada") });
    expect(r.status).toBe(400);
    expect(r.json?.error).toContain("Coins insuficientes");
    sql(`UPDATE Miembros SET Coins = 100 WHERE Email = '${atleta.email}'`);
    const repetido = await api(atleta, "POST", "/api/evolucion/items/comprar", { itemId: idItem("Ícono Gorila Alfa") });
    expect(repetido.json?.error).toContain("Ya tenés");
    expect(coins(atleta)).toBe(100);

    // Doble gasto: con 250 SB, 5 compras en paralelo de 200 y 150 → pasa una sola
    sql(`UPDATE Miembros SET Coins = 250 WHERE Email = '${atleta.email}'`);
    const skin = idItem("Skin Guerrero Negro");
    const manada = idItem("Ícono Manada");
    const resultados = await Promise.all(
      [skin, manada, skin, manada, skin].map((itemId) => api(atleta, "POST", "/api/evolucion/items/comprar", { itemId })),
    );
    expect(resultados.filter((x) => x.status === 200)).toHaveLength(1);
    expect(coins(atleta)).toBeGreaterThanOrEqual(0);
    expect(sql(`SELECT COUNT(*) FROM InventarioItems WHERE MiembroId = '${idMiembro(atleta)}'`)).toBe("2");
    // RF-011: historial de compras (TRANSACCION_MARKETPLACE)
    expect(sql(`SELECT COUNT(*) FROM TransaccionesMarketplace WHERE MiembroId = '${idMiembro(atleta)}'`)).toBe("2");

    // Paso 18: el ítem queda en el inventario y se activa desde el perfil
    await atleta.page.goto("/perfil");
    const gorila = atleta.page.getByTestId("item-inventario").filter({ hasText: "Ícono Gorila Alfa" });
    await gorila.getByRole("button", { name: "ACTIVAR" }).click();
    await expect(gorila).toContainText("ACTIVO");
  });

  test("CU-004-002: árbol colectivo del clan con Puntos de Clan, niveles e historial (RF-015)", async () => {
    const xpAntes = campo(atleta, "Xp");
    await atleta.page.goto("/evolucion/habilidades");
    await expect(atleta.page.getByRole("heading", { name: "SKILL TREE" })).toBeVisible();
    const puntos = puntosClan(CLAN);
    await expect(atleta.page.getByTestId("puntos-clan")).toHaveText(puntos.toLocaleString("es-AR"));

    // FA-1: clic en un nodo bloqueado → no se selecciona y se informa el prerrequisito
    await atleta.page.getByRole("button", { name: "Nodo ATAQUE" }).click();
    await expect(atleta.page.getByRole("tooltip")).toContainText("requiere FUERZA");
    const bloqueado = await api(atleta, "POST", "/api/evolucion/nodos/mejorar", { nodoId: idNodo("ATAQUE") });
    expect(bloqueado.status).toBe(400);
    expect(bloqueado.json?.error).toContain("FUERZA");

    // Pasos 7–17: seleccionar FUERZA → MEJORAR NODO → nivel 1/3, se descuentan 100 puntos, ÚLTIMAS INVERSIONES
    await atleta.page.getByRole("button", { name: "Nodo FUERZA" }).click();
    const panel = atleta.page.getByTestId("panel-nodo");
    await expect(panel).toContainText("FUERZA");
    await expect(panel.getByTestId("nivel-nodo")).toHaveText("0 / 3");
    await panel.getByRole("button", { name: "MEJORAR NODO" }).click();
    await expect(panel.getByTestId("nivel-nodo")).toHaveText("1 / 3");
    await expect(atleta.page.getByTestId("ultimas-inversiones")).toContainText("FUERZA → NV 1");
    await expect(atleta.page.getByTestId("ultimas-inversiones")).toContainText("−100");
    expect(puntosClan(CLAN)).toBe(puntos - 100);
    expect(campo(atleta, "Xp")).toBe(xpAntes); // se paga con Puntos de Clan, no con XP

    // Es colectivo: el compañero ve el mismo nivel y ATAQUE ya no está bloqueado para el clan
    const arbol = await api(companero, "GET", "/api/evolucion/arbol");
    const nodos = arbol.json.nodos as { nombre: string; nivel: number; bloqueado: boolean }[];
    expect(nodos.find((n) => n.nombre === "FUERZA")?.nivel).toBe(1);
    expect(nodos.find((n) => n.nombre === "ATAQUE")?.bloqueado).toBe(false);
    // Otro clan no comparte el árbol
    const otro = await api(ajeno, "GET", "/api/evolucion/arbol");
    expect((otro.json.nodos as { nombre: string; nivel: number }[]).find((n) => n.nombre === "FUERZA")?.nivel).toBe(0);

    // FA-2: sin puntos suficientes → "PUNTOS INSUFICIENTES" deshabilitado
    sql(`UPDATE Clanes SET PuntosClan = 10 WHERE Nombre = '${CLAN}'`);
    await atleta.page.reload();
    await atleta.page.getByRole("button", { name: "Nodo FUERZA" }).click();
    await expect(atleta.page.getByTestId("panel-nodo").getByRole("button", { name: "PUNTOS INSUFICIENTES" })).toBeDisabled();
    expect((await api(atleta, "POST", "/api/evolucion/nodos/mejorar", { nodoId: idNodo("FUERZA") })).status).toBe(400);
    sql(`UPDATE Clanes SET PuntosClan = ${puntos - 100} WHERE Nombre = '${CLAN}'`);
  });

  test("CU-005-001: dashboard comparativo 2×2 contra el promedio del clan (RF-007)", async () => {
    const d = await api(atleta, "GET", "/api/perfil/dashboard");
    expect(d.status).toBe(200);
    expect(d.json.estadisticas.totalSesiones).toBe(3);
    expect(d.json.indiceDominancia).not.toBeNull();
    expect(d.json.radar.map((e: { eje: string }) => e.eje)).toEqual(["FUERZA BRUTA", "RESISTENCIA", "AGILIDAD", "TÉCNICA"]);
    expect(d.json.volumen.usuario).toBe(6980);
    expect(d.json.clan.puntosClan).toBe(puntosClan(CLAN));

    await atleta.page.goto("/perfil");
    await expect(atleta.page.getByText("Análisis comparativo contra el promedio del clan. Sector Delta.")).toBeVisible();
    for (const b of ["bloque-dominancia", "bloque-radar", "bloque-volumen", "bloque-cer"]) {
      await expect(atleta.page.getByTestId(b)).toBeVisible();
    }
    await expect(atleta.page.getByTestId("bloque-volumen")).toContainText("TU RENDIMIENTO");
    await expect(atleta.page.getByTestId("bloque-volumen")).toContainText("PROMEDIO CLAN");
    await expect(atleta.page.getByTestId("bloque-cer")).toContainText("CAPACIDAD");

    // FA-1: con menos de 3 sesiones el Índice de Dominancia muestra "--"
    await companero.page.goto("/perfil");
    await expect(companero.page.getByTestId("bloque-dominancia")).toContainText("--");
    await expect(companero.page.getByTestId("bloque-dominancia")).toContainText("al menos 3 sesiones");
  });

  test("CU-005-004: fatiga según CER de 7 días y peso corporal, protocolo mandatorio y tendencia (RF-009)", async () => {
    // Compañero ATLÉTICO (×1.0), 82 kg. Carga relativa = CER 7 días / 82
    const nivel = async () => (await api(companero, "GET", "/api/perfil/fatiga")).json;
    await entrenar(companero, "sentadilla", 100, 30); // 3000 → 36.6 → ÓPTIMA
    expect((await nivel()).nivelFatiga).toBe("OPTIMA");
    await entrenar(companero, "sentadilla", 100, 10); // 4000 → 48.8 → MODERADA
    expect((await nivel()).nivelFatiga).toBe("MODERADA");
    await entrenar(companero, "sentadilla", 100, 30); // 7000 → 85.4 → ELEVADA
    expect((await nivel()).nivelFatiga).toBe("ELEVADA");
    await entrenar(companero, "sentadilla", 100, 20); // 9000 → 109.8 → CRÍTICA
    const critica = await nivel();
    expect(critica.nivelFatiga).toBe("CRITICA");
    expect(critica.porcentajeCarga).toBe(100);

    await companero.page.goto("/perfil/fatiga");
    await expect(companero.page.getByRole("heading", { name: "ANÁLISIS BIOMÉTRICO DE RECUPERACIÓN" })).toBeVisible();
    await expect(companero.page.getByTestId("indicador-fatiga")).toContainText("ALTO RIESGO DE FATIGA");
    await expect(companero.page.getByText("! SOBRECARGA DETECTADA")).toBeVisible();
    await expect(companero.page.getByText("MANDATO")).toBeVisible();
    await expect(companero.page.getByTestId("protocolo")).toContainText("Reducir la intensidad al 50%");
    await expect(companero.page.getByTestId("tendencia").locator("div.bg-\\[\\#F97316\\]")).toHaveCount(1); // hoy en naranja

    // Un entrenamiento de hace 8 días ya no cuenta: 9000 − 3000 = 6000 → 73.2 → ELEVADA
    sql(`UPDATE TOP (1) Entrenamientos SET FechaHora = DATEADD(day, -8, GETUTCDATE()) WHERE MiembroId = '${idMiembro(companero)}' AND PuntajeCer = 3000`);
    const elevada = await nivel();
    expect(elevada.nivelFatiga).toBe("ELEVADA");
    expect(elevada.porcentajeCarga).toBe(73);

    // FA-1: el ajeno no entrenó → ESTADO ÓPTIMO
    await ajeno.page.goto("/perfil/fatiga");
    await expect(ajeno.page.getByTestId("indicador-fatiga")).toContainText("ESTADO ÓPTIMO");
  });

  test("CU-005-002: la racha cuenta días en hora Argentina y se reinicia a 0 si se rompe (RF-008)", async () => {
    const id = idMiembro(atleta);
    // FA-1: ya entrenó hoy → sin banner ni opciones
    await atleta.page.goto("/perfil/racha");
    await expect(atleta.page.getByRole("heading", { name: "RACHA ACTUAL" })).toBeVisible();
    await expect(atleta.page.getByText("RACHA A PUNTO DE PERDERSE")).toHaveCount(0);

    // Último entrenamiento: ayer 23:00 hora Argentina (= hoy 02:00 UTC) → entrenar ahora es día consecutivo
    const ayer23hArg = "DATEADD(hour, 2, CAST(CAST(DATEADD(hour, -3, GETUTCDATE()) AS date) AS datetime2))";
    sql(`UPDATE Rachas SET DiasConsecutivos = 5, Estado = 'ACTIVA', UltimoEntrenamiento = ${ayer23hArg} WHERE MiembroId = '${id}'`);
    await entrenar(atleta, "dominadas", 10, 10);
    expect(sql(`SELECT DiasConsecutivos FROM Rachas WHERE MiembroId = '${id}'`)).toBe("6");
    await entrenar(atleta, "dominadas", 10, 10); // mismo día: no suma
    expect(sql(`SELECT DiasConsecutivos FROM Rachas WHERE MiembroId = '${id}'`)).toBe("6");

    // Dos días sin entrenar → la racha se pierde: el contador vuelve a 0; al entrenar arranca de 1
    sql(`UPDATE Rachas SET UltimoEntrenamiento = DATEADD(day, -2, GETUTCDATE()) WHERE MiembroId = '${id}'`);
    const rota = await api(atleta, "GET", "/api/perfil/racha");
    expect(rota.json.estado).toBe("ROTA");
    expect(rota.json.diasConsecutivos).toBe(0);
    await entrenar(atleta, "dominadas", 10, 10);
    expect(sql(`SELECT DiasConsecutivos FROM Rachas WHERE MiembroId = '${id}'`)).toBe("1");
  });

  test("CU-005-003: salvar la racha desde el banner, con Puntos de Clan propios, y volver al Santuario", async () => {
    const id = idMiembro(atleta);
    sql(`UPDATE Rachas SET DiasConsecutivos = 4, UltimoEntrenamiento = DATEADD(day, -1, GETUTCDATE()) WHERE MiembroId = '${id}'`);
    const antes = puntosClan(CLAN);

    // Santuario: el botón de racha muestra el contador y la alerta
    await atleta.page.goto("/santuario");
    await expect(atleta.page.getByTestId("boton-racha")).toContainText("RACHA 4 DÍAS");
    await atleta.page.getByTestId("boton-racha").click();
    await expect(atleta.page).toHaveURL(/\/perfil\/racha$/);
    await expect(atleta.page.getByText("Tu disciplina está en riesgo.")).toBeVisible();
    await expect(atleta.page.getByText("RACHA A PUNTO DE PERDERSE")).toBeVisible();
    await expect(atleta.page.getByTestId("costo-rescate")).toHaveText(`50 pts (Tienes: ${antes} pts)`);

    await atleta.page.getByRole("button", { name: /SALVAR RACHA/ }).click();
    await expect(atleta.page).toHaveURL(/\/santuario\?racha=salvada/);
    await expect(atleta.page.getByText("¡Racha salvada!")).toBeVisible();
    await expect(atleta.page.getByTestId("boton-racha")).toContainText("RACHA 4 DÍAS");
    expect(puntosClan(CLAN)).toBe(antes - 50);
    expect((await api(atleta, "POST", "/api/perfil/racha/salvar")).status).toBe(400); // ya no está en riesgo

    // Al día siguiente, entrenar continúa la racha (4 → 5)
    sql(`UPDATE Rachas SET UltimoEntrenamiento = DATEADD(day, -1, UltimoEntrenamiento) WHERE MiembroId = '${id}'`);
    await entrenar(atleta, "dominadas", 10, 10);
    expect(sql(`SELECT DiasConsecutivos FROM Rachas WHERE MiembroId = '${id}'`)).toBe("5");
  });

  test("CU-005-003 FA-2: DEJAR MORIR LA RACHA la reinicia a 0 sin cargo", async () => {
    const id = idMiembro(atleta);
    sql(`UPDATE Rachas SET DiasConsecutivos = 9, UltimoEntrenamiento = DATEADD(day, -1, GETUTCDATE()) WHERE MiembroId = '${id}'`);
    const antes = puntosClan(CLAN);
    await atleta.page.goto("/perfil/racha");
    await atleta.page.getByRole("button", { name: "DEJAR MORIR LA RACHA" }).click();
    await expect(atleta.page.getByTestId("dias-racha")).toHaveText("0");
    expect(puntosClan(CLAN)).toBe(antes);
  });

  test("CU-005-003 (seguridad): no se pueden gastar los puntos de otro clan", async () => {
    sql(`UPDATE Rachas SET DiasConsecutivos = 3, UltimoEntrenamiento = DATEADD(day, -1, GETUTCDATE()) WHERE MiembroId = '${idMiembro(ajeno)}'`);
    const clanAtleta = sql(`SELECT Id FROM Clanes WHERE Nombre = '${CLAN}'`);
    const antes = puntosClan(CLAN);
    const r = await api(ajeno, "POST", "/api/perfil/racha/salvar", { clanId: clanAtleta });
    expect(r.status).toBe(400);
    expect(r.json?.error).toContain("insuficientes");
    expect(puntosClan(CLAN)).toBe(antes);
    expect(puntosClan(CLAN_AJENO)).toBe(0);
    // FA-1 de CU-005-003: el botón aparece deshabilitado con el motivo
    await ajeno.page.goto("/perfil/racha");
    await expect(ajeno.page.getByRole("button", { name: /SALVAR RACHA/ })).toBeDisabled();
    await expect(ajeno.page.getByText("Saldo insuficiente")).toBeVisible();
  });

  test("CU-005-005: vitrina con VICTORIAS, rango, trofeo destacado y detalle (FA-2)", async () => {
    await atleta.page.goto("/perfil/trofeos");
    await expect(atleta.page.getByText("LOGROS DE COMBATE")).toBeVisible();
    await expect(atleta.page.getByTestId("victorias")).toHaveText("0");
    await expect(atleta.page.getByTestId("rango-vitrina")).toHaveText("PLATA");
    await expect(atleta.page.getByTestId("trofeo-destacado")).toBeVisible();
    await atleta.page.getByText("Primer Esfuerzo").click();
    const detalle = atleta.page.getByRole("dialog", { name: "Detalle del trofeo" });
    await expect(detalle).toContainText("CONDICIONES CUMPLIDAS");
    await expect(detalle).toContainText("Obtenido el");
  });

  test("CU-005-006: beneficios por rango (bloqueados visibles), acción según el tipo y vencimiento (RF-016)", async () => {
    // Beneficio propio de la corrida, ya vencido: debe figurar EXPIRADO (FA-2) sin tocar el catálogo
    sql(`INSERT INTO BeneficiosAliado (Id, AliadoId, Titulo, Descripcion, Tipo, RangoMinimo, Estado, Categoria, FechaVencimiento, Destacado)
         SELECT NEWID(), Id, N'Vencido ${corrida}', N'Prueba E2E', 'CUPON', 'BRONCE', 'DISPONIBLE', N'NUTRICIÓN', DATEADD(day, -1, GETUTCDATE()), 0
         FROM AliadosComerciales WHERE Nombre = 'ProteoLab'`.replace(/\s+/g, " "));

    await atleta.page.goto("/perfil/beneficios");
    await expect(atleta.page.getByText("Arsenal de recompensas exclusivas para el Clan Silverback. Reclama tu ventaja.")).toBeVisible();
    const b = (u: Usuario, titulo: string) => u.page.getByTestId("beneficio").filter({ hasText: titulo });
    await expect(b(atleta, "15% OFF en equipamiento")).toContainText("DESTACADO");
    await expect(b(atleta, "Sesión de crioterapia")).toHaveAttribute("data-estado", "BLOQUEADO"); // ORO
    await expect(b(atleta, "Sesión de crioterapia")).toContainText("REQUIERE ORO");
    await expect(b(atleta, "Plan de alimentación")).toHaveAttribute("data-estado", "DISPONIBLE"); // PLATA
    await expect(b(atleta, `Vencido ${corrida}`)).toHaveAttribute("data-estado", "EXPIRADO");
    await expect(b(atleta, "2x1 en proteína")).toContainText(/VENCE EN \d+ DÍAS?/);

    // FILTROS por categoría
    await atleta.page.getByRole("button", { name: "FILTROS" }).click();
    await atleta.page.getByRole("button", { name: "ROPA DEPORTIVA" }).click();
    await expect(atleta.page.getByTestId("beneficio")).toHaveCount(1);
    await atleta.page.reload();

    // Paso 7–8: DESBLOQUEAR CÓDIGO en el destacado → código exclusivo; al volver sigue visible como reclamado
    await b(atleta, "15% OFF en equipamiento").getByRole("button", { name: "DESBLOQUEAR CÓDIGO" }).click();
    await expect(b(atleta, "15% OFF en equipamiento").getByTestId("codigo-beneficio")).toHaveText(/^SB-/);
    await atleta.page.reload();
    await expect(b(atleta, "15% OFF en equipamiento")).toContainText("YA RECLAMADO");
    // Paso 14: COPIAR CUPÓN
    await b(atleta, "Envío gratis + 20% OFF").getByRole("button", { name: "COPIAR CUPÓN" }).click();
    await expect(b(atleta, "Envío gratis + 20% OFF").getByTestId("codigo-beneficio")).toHaveText(/^SB-/);

    const idBen = (t: string) => sql(`SELECT Id FROM BeneficiosAliado WHERE Titulo = N'${t}'`);
    expect((await api(atleta, "POST", "/api/perfil/beneficios/reclamar", { beneficioId: idBen("15% OFF en equipamiento") })).status).toBe(400);
    const oro = await api(atleta, "POST", "/api/perfil/beneficios/reclamar", { beneficioId: idBen("Sesión de crioterapia") });
    expect(oro.json?.error).toContain("Requiere rango ORO");
    const vencido = await api(atleta, "POST", "/api/perfil/beneficios/reclamar", { beneficioId: idBen(`Vencido ${corrida}`) });
    expect(vencido.json?.error).toContain("expiró");

    // Paso 18: ACTIVAR OFERTA (suscripción a precio base) deja una suscripción activa con el aliado
    await b(atleta, "Plan de alimentación").getByRole("button", { name: "ACTIVAR OFERTA" }).click();
    await expect(b(atleta, "Plan de alimentación").getByTestId("suscripcion-activa")).toBeVisible();
    expect(sql(`SELECT COUNT(*) FROM SuscripcionesActivas WHERE MiembroId = '${idMiembro(atleta)}'`)).toBe("1");
    await atleta.page.reload();
    await expect(b(atleta, "Plan de alimentación").getByTestId("suscripcion-activa")).toContainText("HASTA");

    // El ajeno (BRONCE) ve el de PLATA bloqueado y el destacado sin reclamar
    await ajeno.page.goto("/perfil/beneficios");
    await expect(b(ajeno, "Plan de alimentación")).toHaveAttribute("data-estado", "BLOQUEADO");
    await expect(b(ajeno, "15% OFF en equipamiento").getByRole("button", { name: "DESBLOQUEAR CÓDIGO" })).toBeVisible();
  });

  test("CU-005-007: datos de cuenta y cambio de contraseña con confirmación (FA-1 a FA-3)", async () => {
    const base = { nombre: atleta.nombre, email: atleta.email };
    const datos: [object, string][] = [
      [{ ...base, email: companero.email }, "Este email ya está en uso."],
      [{ ...base, email: "sin-arroba" }, "no es válido"],
      [{ ...base, nombre: " " }, "no puede estar vacío"],
    ];
    for (const [body, error] of datos) {
      const r = await api(atleta, "PUT", "/api/perfil/cuenta", body);
      expect(r.status, error).toBe(400);
      expect(r.json?.error).toContain(error);
    }
    const pass = (passwordActual: string, passwordNueva: string, passwordConfirmacion: string) =>
      api(atleta, "PUT", "/api/perfil/cuenta/password", { passwordActual, passwordNueva, passwordConfirmacion });
    expect((await pass("incorrecta", "NuevaClave1!", "NuevaClave1!")).json?.error).toBe("Contraseña actual incorrecta.");
    expect((await pass(PASSWORD, "NuevaClave1!", "OtraClave1!")).json?.error).toContain("no coinciden");
    expect((await pass(PASSWORD, "corta", "corta")).json?.error).toContain("al menos 8");

    // Pasos 3–5: nombre
    const nuevoNombre = `${atleta.nombre} Editado`;
    await atleta.page.goto("/perfil/cuenta");
    await atleta.page.locator('input[name="nombre"]').fill(nuevoNombre);
    await atleta.page.getByRole("button", { name: "GUARDAR CAMBIOS" }).click();
    await expect(atleta.page.getByText("Datos actualizados.")).toBeVisible();
    atleta.nombre = nuevoNombre;

    // Pasos 6–9 + FA-3: CAMBIAR CONTRASEÑA con confirmación
    await atleta.page.getByRole("button", { name: /CAMBIAR CONTRASEÑA/ }).click();
    await atleta.page.locator('input[name="passwordActual"]').fill(PASSWORD);
    await atleta.page.locator('input[name="passwordNueva"]').fill("NuevaClave1!");
    await atleta.page.locator('input[name="passwordConfirmacion"]').fill("Distinta1!");
    await atleta.page.getByRole("button", { name: "ACTUALIZAR CONTRASEÑA" }).click();
    await expect(atleta.page.getByText("Las contraseñas nuevas no coinciden.")).toBeVisible();
    await expect(atleta.page.locator('input[name="passwordConfirmacion"]')).toHaveAttribute("aria-invalid", "true");
    await atleta.page.locator('input[name="passwordActual"]').fill(PASSWORD);
    await atleta.page.locator('input[name="passwordNueva"]').fill("NuevaClave1!");
    await atleta.page.locator('input[name="passwordConfirmacion"]').fill("NuevaClave1!");
    await atleta.page.getByRole("button", { name: "ACTUALIZAR CONTRASEÑA" }).click();
    await expect(atleta.page.getByText("Contraseña actualizada.")).toBeVisible();

    const login = (password: string) =>
      atleta.page.request.post(`${API}/api/auth/login`, { data: { email: atleta.email, password } });
    expect((await login("NuevaClave1!")).status()).toBe(200);
    expect((await login(PASSWORD)).status()).not.toBe(200);
  });

  test("S10: integración entre módulos (Arena → Evolución → Perfil → Santuario)", async () => {
    const [d, p] = await Promise.all([
      api(atleta, "GET", "/api/perfil/dashboard"),
      api(atleta, "GET", "/api/evolucion/progreso"),
    ]);
    expect(d.json.miembro.xp).toBe(p.json.miembro.xp);
    expect(d.json.miembro.coins).toBe(p.json.miembro.coins);
    expect(d.json.miembro.rango).toBe(p.json.miembro.rango);
    expect(d.json.miembro.nombre).toBe(atleta.nombre);

    // Los Puntos de Clan (CER − nodos − rescates) son los mismos en Perfil, Árbol y Santuario
    const arbol = await api(atleta, "GET", "/api/evolucion/arbol");
    expect(arbol.json.puntosClan).toBe(d.json.clan.puntosClan);
    const panel = await api(atleta, "GET", `/api/santuario/${d.json.clan.id}`);
    expect(JSON.stringify(panel.json)).toContain(String(d.json.clan.puntosClan));

    await atleta.page.goto("/santuario");
    await expect(atleta.page.locator("aside")).toContainText(atleta.nombre);
    await expect(atleta.page.locator("aside")).toContainText("Mercado");

    const rutas = ["/api/evolucion/arbol", "/api/evolucion/items", "/api/evolucion/progreso", "/api/evolucion/boveda", "/api/perfil/inventario",
      "/api/perfil/dashboard", "/api/perfil/racha", "/api/perfil/fatiga", "/api/perfil/trofeos", "/api/perfil/beneficios"];
    const problemas: string[] = [];
    for (const ruta of rutas) {
      const { status, json } = await api(atleta, "GET", ruta);
      if (status >= 400) problemas.push(`${ruta} → ${status}`);
      if (JSON.stringify(json ?? "").toLowerCase().includes("passwordhash")) problemas.push(`${ruta} → passwordHash`);
    }
    expect(problemas).toEqual([]);
  });
});
