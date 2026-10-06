import { execSync } from "node:child_process";
import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

export const API = "http://localhost:5057";
export const PASSWORD = "Test1234!";
const SQL_SERVER = process.env.E2E_SQL_SERVER ?? "DESKTOP-JQBGOKE\\SQLEXPRESS";

export type Usuario = { nombre: string; email: string; context: BrowserContext; page: Page };

// Sufijo único por corrida: los datos de cada ejecución no chocan con los anteriores
export const corrida = Date.now().toString(36);

export async function nuevoUsuario(browser: Browser, rol: string): Promise<Usuario> {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { nombre: `E2E ${rol} ${corrida}`, email: `e2e-${rol}-${corrida}@silverback.local`, context, page };
}

// Texto visible de cada tarjeta de arquetipo (el id va sin tilde, la etiqueta no)
const ETIQUETA_ARQUETIPO = { VOLUMEN: "VOLUMEN", DEFINIDO: "DEFINIDO", ATLETICO: "ATLÉTICO" } as const;

// CU-001-000 → 001-002: formulario unificado + arquetipo
async function completarBiometriaYArquetipo(u: Usuario, arquetipo: "VOLUMEN" | "DEFINIDO" | "ATLETICO") {
  const { page } = u;
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding\/biometrics/);
  await page.locator('input[name="nombre"]').fill(u.nombre);
  await page.locator('input[name="email"]').fill(u.email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="edad"]').fill("28");
  await page.locator('input[name="pesoKg"]').fill("82");
  await page.locator('input[name="alturaCm"]').fill("178");
  await page.locator('select[name="nivelExperiencia"]').selectOption("INTERMEDIO");
  await page.getByRole("button", { name: /CONTINUAR/ }).click();

  await expect(page).toHaveURL(/\/onboarding\/archetype/);
  await page.getByRole("button", { name: new RegExp(ETIQUETA_ARQUETIPO[arquetipo]) }).first().click();
  await page.getByRole("button", { name: /CONFIRMAR ARQUETIPO/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/matchmaking/);
}

// CU-001-005: Fundar una Manada → queda como SILVERBACK
export async function fundarClan(u: Usuario, nombreClan: string, arquetipo: "VOLUMEN" | "DEFINIDO" | "ATLETICO" = "VOLUMEN") {
  await completarBiometriaYArquetipo(u, arquetipo);
  await u.page.getByRole("button", { name: /Fundar mi propio clan/ }).click();
  await u.page.locator('input[name="nombreClan"]').fill(nombreClan);
  await u.page.getByRole("button", { name: "FUNDAR CLAN" }).click();
  await expect(u.page).toHaveURL(/\/santuario$/);
}

// CU-001-003/004: Buscar y unirse a una Manada → queda como RECLUTA
export async function unirseAClan(u: Usuario, nombreClan: string, arquetipo: "VOLUMEN" | "DEFINIDO" | "ATLETICO" = "ATLETICO") {
  await completarBiometriaYArquetipo(u, arquetipo);
  const tarjeta = u.page.locator("form").filter({ hasText: nombreClan });
  await tarjeta.getByRole("button", { name: "UNIRSE" }).click();
  await expect(u.page).toHaveURL(/\/santuario$/);
}

export async function token(u: Usuario): Promise<string> {
  const cookie = (await u.context.cookies()).find((c) => c.name === "sb_token");
  if (!cookie) throw new Error(`${u.nombre} no tiene sesión`);
  return cookie.value;
}

// Llamada directa a la API con el JWT del usuario (para probar permisos sin depender de la UI)
export async function api(u: Usuario, metodo: string, ruta: string, body?: unknown) {
  const res = await u.page.request.fetch(`${API}${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${await token(u)}`, "Content-Type": "application/json" },
    data: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status(), json: await res.json().catch(() => null) };
}

// Simula el micrófono: SpeechRecognition falso que "escucha" la frase dada
export async function simularMicrofono(context: BrowserContext, frase: string) {
  await context.addInitScript((texto) => {
    class ReconocimientoFalso {
      lang = "";
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        setTimeout(() => {
          this.onresult?.({ results: [[{ transcript: texto }]] });
          this.onend?.();
        }, 100);
      }
      stop() { this.onend?.(); }
    }
    Object.defineProperty(window, "SpeechRecognition", { value: ReconocimientoFalso, configurable: true });
    Object.defineProperty(window, "webkitSpeechRecognition", { value: ReconocimientoFalso, configurable: true });
  }, frase);
}

export async function sinMicrofono(context: BrowserContext) {
  await context.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
    Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });
  });
}

export function sql(consulta: string): string {
  return execSync(`sqlcmd -S "${SQL_SERVER}" -d silverback -E -C -b -W -h -1 -Q "SET NOCOUNT ON; ${consulta.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
  }).trim();
}

export function backupBase(nombre: string) {
  const ruta = sql("SELECT SERVERPROPERTY('InstanceDefaultBackupPath')");
  execSync(
    `sqlcmd -S "${SQL_SERVER}" -E -C -b -Q "BACKUP DATABASE silverback TO DISK = N'${ruta}\\${nombre}.bak' WITH INIT"`,
    { encoding: "utf8" },
  );
  return `${ruta}\\${nombre}.bak`;
}
