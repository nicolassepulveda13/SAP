// E2E SilverBack (S4–S6). Levanta API y front si no están corriendo; si ya están, los reutiliza.
// Correr: npm run test:e2e   ·   Ver reporte: npx playwright show-report
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // los tests comparten usuarios y clanes creados en orden
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    navigationTimeout: 90_000, // next dev compila cada ruta la primera vez
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "dotnet run --project SilverbackApi.Api --urls http://localhost:5057",
      cwd: "../silverback-api",
      url: "http://localhost:5057/health",
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      // node directo (sin npm): en Windows Playwright mata a npm pero dejaba huérfano a next dev
      command: "node node_modules/next/dist/bin/next dev",
      url: "http://localhost:3000/api/health",
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
});
