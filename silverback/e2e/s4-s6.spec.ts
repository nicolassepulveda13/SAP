// E2E S4–S6: Santuario II (Tácticas, Roles), Forja, registro manual y por voz, Guerra Global e Historial.
// Cada corrida crea sus propios usuarios y clanes (sufijo único). Los tests van en orden y comparten estado.
import { test, expect } from "@playwright/test";
import {
  api, backupBase, corrida, fundarClan, nuevoUsuario, simularMicrofono, sinMicrofono, sql, unirseAClan,
  type Usuario,
} from "./helpers";

const CLAN_A = `E2E Alfa ${corrida}`;
const CLAN_B = `E2E Beta ${corrida}`;
const DESAFIO = `Sentadilla e2e ${corrida}`;

let lider: Usuario;   // funda CLAN_A → SILVERBACK, arquetipo VOLUMEN (×1.1)
let recluta: Usuario; // se une a CLAN_A → RECLUTA
let rival: Usuario;   // funda CLAN_B → SILVERBACK, arquetipo ATLETICO (×1.0)

test.describe.serial("S4–S6", () => {
  test.beforeAll(async ({ browser }) => {
    lider = await nuevoUsuario(browser, "lider");
    recluta = await nuevoUsuario(browser, "recluta");
    rival = await nuevoUsuario(browser, "rival");
  });

  test.afterAll(async () => {
    for (const u of [lider, recluta, rival]) await u?.context.close();
  });

  test("Incorporación: fundar dos clanes y unirse a uno", async () => {
    test.setTimeout(300_000); // 3 onboardings completos + primera compilación de cada ruta en next dev
    await fundarClan(lider, CLAN_A, "VOLUMEN");
    await unirseAClan(recluta, CLAN_A, "ATLETICO");
    await fundarClan(rival, CLAN_B, "ATLETICO");

    // Sidebar con datos reales (no el "Nivel 42" fijo de la maqueta)
    await expect(lider.page.locator("aside")).toContainText(lider.nombre);
    await expect(lider.page.locator("aside")).toContainText(`SILVERBACK · ${CLAN_A}`);
    await expect(recluta.page.locator("aside")).toContainText(`RECLUTA · ${CLAN_A}`);
  });

  test("Pantallas sin integración ocultas: /perfil y /evolucion redirigen", async () => {
    await lider.page.goto("/perfil");
    await expect(lider.page).toHaveURL(/\/santuario$/);
    await lider.page.goto("/evolucion/tienda");
    await expect(lider.page).toHaveURL(/\/santuario$/);
    await expect(lider.page.locator("header")).not.toContainText("Bóveda");
    await expect(lider.page.locator("aside")).not.toContainText("Trofeos");
  });

  test("CU-002-004: el chat de Tácticas persiste y lo ve otro miembro", async () => {
    const mensaje = `Hola manada ${corrida}`;
    await lider.page.goto("/santuario/tacticas");
    await lider.page.locator('input[name="contenido"]').fill(mensaje);
    await lider.page.locator('input[name="contenido"]').press("Enter");
    await expect(lider.page.getByText(mensaje)).toBeVisible();

    await recluta.page.goto("/santuario/tacticas");
    await expect(recluta.page.getByText(mensaje)).toBeVisible();
    await expect(recluta.page.getByText(lider.nombre)).toBeVisible();
  });

  test("CU-002-007 + CU-002-003: el SILVERBACK publica y el RECLUTA acepta", async () => {
    await lider.page.goto("/santuario/forja");
    await lider.page.getByRole("button", { name: /Publicar nueva directiva/ }).click();
    await lider.page.locator('[name="descripcion"]').fill(DESAFIO);
    await lider.page.locator('select[name="tier"]').selectOption("ORO");
    await lider.page.locator('input[name="recompensaXp"]').fill("300");
    await lider.page.locator('input[name="fechaExpiracion"]').fill("2026-12-31");
    await lider.page.getByRole("button", { name: "PUBLICAR DIRECTIVA" }).click();
    await expect(lider.page.getByRole("heading", { name: DESAFIO })).toBeVisible();

    await recluta.page.goto("/santuario/forja");
    await expect(recluta.page.getByRole("button", { name: /Publicar nueva directiva/ })).toHaveCount(0);
    const tarjeta = recluta.page.locator("div.rounded-xl.overflow-hidden").filter({ hasText: DESAFIO });
    await expect(tarjeta).toContainText("ORO TIER");
    await tarjeta.getByRole("button", { name: "ACEPTAR DESAFÍO" }).click();
    await expect(tarjeta).toContainText("PROTOCOLO ASEGURADO");
  });

  test("CU-002-005/006: permisos de Roles", async () => {
    const clanId = sql(`SELECT Id FROM Clanes WHERE Nombre = '${CLAN_A}'`);
    const idRecluta = sql(`SELECT Id FROM Miembros WHERE Email = '${recluta.email}'`);
    const idLider = sql(`SELECT Id FROM Miembros WHERE Email = '${lider.email}'`);

    // El RECLUTA no ve controles y la API le responde 403
    await recluta.page.goto("/santuario/roles");
    await expect(recluta.page.getByText(/Solo el líder del clan/)).toBeVisible();
    await expect(recluta.page.getByRole("button", { name: "GUARDAR" })).toHaveCount(0);
    const prohibido = await api(recluta, "PUT", `/api/santuario/${clanId}/miembros/${idLider}/rol`, { rol: "RECLUTA" });
    expect(prohibido.status).toBe(403);

    // El SILVERBACK no puede cambiarse su propio rol (dejaba el clan sin líder)
    const propio = await api(lider, "PUT", `/api/santuario/${clanId}/miembros/${idLider}/rol`, { rol: "BETA" });
    expect(propio.status).toBe(400);
    expect(propio.json?.error).toContain("propio rol");

    // El SILVERBACK asciende al recluta a BETA desde la pantalla
    await lider.page.goto("/santuario/roles");
    const fila = lider.page.locator("div.rounded-xl").filter({ hasText: recluta.nombre });
    await fila.locator('select[name="rol"]').selectOption("BETA");
    await fila.getByRole("button", { name: "GUARDAR" }).click();
    await expect.poll(() => sql(`SELECT Rol FROM Miembros WHERE Id = '${idRecluta}'`)).toBe("BETA");

    await recluta.page.goto("/santuario");
    await expect(recluta.page.locator("aside")).toContainText(`BETA · ${CLAN_A}`);
  });

  test("CU-003-002 (manual): registrar entrenamiento suma CER y XP", async () => {
    await lider.page.goto("/arena/registrar");
    await lider.page.locator('input[name="ejercicio"]').fill("remo con barra");
    // Valores por defecto: 60 kg × 8 reps × VOLUMEN 1.1 = 528 CER → 52 XP
    await lider.page.getByRole("button", { name: /REGISTRAR ESFUERZO/ }).click();
    await expect(lider.page.getByText("¡ESFUERZO REGISTRADO!")).toBeVisible();
    await expect(lider.page.getByText("528", { exact: true })).toBeVisible();
    await expect(lider.page.getByText("+52 XP")).toBeVisible();
  });

  test("CU-003-002 (voz): el dictado se confirma y completa los campos", async ({ browser }) => {
    // Contexto con la sesión del líder + micrófono simulado
    const ctx = await browser.newContext({ storageState: await lider.context.storageState() });
    await simularMicrofono(ctx, "press banca 100 kilos 10 repeticiones");
    const page = await ctx.newPage();
    await page.goto("/arena/registrar");

    await page.getByRole("button", { name: /DICTAR/ }).click();
    await expect(page.getByText("press banca 100 kilos 10 repeticiones")).toBeVisible();
    await page.getByRole("button", { name: "USAR ESTOS DATOS" }).click();

    await expect(page.locator('input[name="ejercicio"]')).toHaveValue("PRESS BANCA");
    await expect(page.locator('input[name="pesoKg"]')).toHaveValue("100");
    await expect(page.locator('input[name="repeticiones"]')).toHaveValue("10");

    // 100 × 10 × 1.1 = 1100 CER → 110 XP
    await page.getByRole("button", { name: /REGISTRAR ESFUERZO/ }).click();
    await expect(page.getByText("1100", { exact: true })).toBeVisible();
    await expect(page.getByText("+110 XP")).toBeVisible();
    await ctx.close();
  });

  test("CU-003-002 (voz): sin soporte se avisa y queda el formulario manual", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: await lider.context.storageState() });
    await sinMicrofono(ctx);
    const page = await ctx.newPage();
    await page.goto("/arena/registrar");
    await expect(page.getByText(/Tu navegador no soporta dictado por voz/)).toBeVisible();
    await expect(page.getByRole("button", { name: /DICTAR/ })).toHaveCount(0);
    await expect(page.locator('input[name="ejercicio"]')).toBeEditable();
    await ctx.close();
  });

  test("CU-003-001: Guerra Global con ranking y rival", async () => {
    // El rival suma menos: 60 × 8 × ATLETICO 1.0 = 480
    await rival.page.goto("/arena/registrar");
    await rival.page.locator('input[name="ejercicio"]').fill("sentadilla");
    await rival.page.getByRole("button", { name: /REGISTRAR ESFUERZO/ }).click();
    await expect(rival.page.getByText("480", { exact: true })).toBeVisible();

    // CLAN_A = 528 + 1100 = 1628
    await lider.page.goto("/arena");
    const nuestra = lider.page.locator("div.rounded-xl").filter({ hasText: "NUESTRA MANADA" }).first();
    const contraria = lider.page.locator("div.rounded-xl").filter({ hasText: "CLAN RIVAL" }).first();
    await expect(nuestra).toContainText(CLAN_A);
    await expect(nuestra).toContainText("1.628");
    await expect(nuestra).toContainText("RANGO #1");
    await expect(contraria).toContainText(CLAN_B);
    await expect(contraria).toContainText("480");
    await expect(lider.page.getByText(/Cierra (hoy|en \d+ días)/)).toBeVisible();

    // Desde el otro lado, el rival de CLAN_B es CLAN_A
    await rival.page.goto("/arena");
    await expect(rival.page.locator("div.rounded-xl").filter({ hasText: "CLAN RIVAL" }).first()).toContainText(CLAN_A);
  });

  test("CU-003-004: al cerrar la semana queda VICTORIA / DERROTA en el historial", async () => {
    const respaldo = backupBase(`silverback_pre_e2e_${corrida}`);
    test.info().annotations.push({ type: "backup", description: respaldo });

    // Simula que la semana venció: renombra la guerra activa y le pone fecha de fin en el pasado
    sql(`UPDATE GuerrasGlobales SET Semana = 'E2E-${corrida}', FechaFin = DATEADD(minute, -1, GETUTCDATE()) WHERE Estado = 'ACTIVA'`);

    // Entrar a la Arena dispara el cierre y abre la guerra de la semana nueva
    await lider.page.goto("/arena");
    await expect(lider.page.getByText(/todavía no sumó CER esta semana/)).toBeVisible();
    expect(sql(`SELECT Estado FROM GuerrasGlobales WHERE Semana = 'E2E-${corrida}'`)).toBe("FINALIZADA");

    await lider.page.goto("/arena/historial");
    const batallaA = lider.page.locator("div.rounded-xl").filter({ hasText: `VS ${CLAN_B}` });
    await expect(batallaA).toContainText("VICTORIA");
    await expect(batallaA).toContainText("#1");

    await rival.page.goto("/arena/historial");
    const batallaB = rival.page.locator("div.rounded-xl").filter({ hasText: `VS ${CLAN_A}` });
    await expect(batallaB).toContainText("DERROTA");
    await expect(batallaB).toContainText("#2");

    // Filtro de sesiones por ejercicio
    await lider.page.goto("/arena/historial?ejercicio=press");
    await expect(lider.page.getByText("PRESS BANCA")).toBeVisible();
    await expect(lider.page.getByText("REMO CON BARRA")).toHaveCount(0);
  });

  test("CU-002-006: el SILVERBACK expulsa a un miembro", async () => {
    await lider.page.goto("/santuario/roles");
    const fila = lider.page.locator("div.rounded-xl").filter({ hasText: recluta.nombre });
    await fila.getByTitle("Expulsar del clan").click();
    await expect(lider.page.locator("div.rounded-xl").filter({ hasText: recluta.nombre })).toHaveCount(0);

    expect(sql(`SELECT ISNULL(CONVERT(varchar(36), ClanId), 'SIN CLAN') + '|' + Rol FROM Miembros WHERE Email = '${recluta.email}'`))
      .toBe("SIN CLAN|RECLUTA");

    // El expulsado ya no puede entrar a pantallas del clan
    await recluta.page.goto("/santuario/tacticas");
    await expect(recluta.page).not.toHaveURL(/\/santuario\/tacticas/);
  });
});
