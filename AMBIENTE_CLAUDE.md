# Ambiente Claude Code — Setup en PC Nueva

Guía para replicar el entorno completo de Claude Code (CLI, plugins, MCP servers, skills) en otra máquina Windows.

---

## 1. Instalar Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
```

Verificar:

```powershell
claude --version
```

Iniciar sesión (abre el browser para auth):

```powershell
claude
```

---

## 2. Plugins de Claude

Los plugins se activan desde `claude.ai` → Settings → Integrations, **no desde el CLI**. Están atados a tu cuenta Anthropic, así que al loguearte en la nueva PC ya deberían aparecer. Verificar que estén habilitados:

| Plugin | Estado en PC original |
|---|---|
| `superpowers@claude-plugins-official` | ✅ Habilitado |
| `frontend-design@claude-plugins-official` | ✅ Habilitado |
| `figma@claude-plugins-official` | ✅ Habilitado |

Si no aparecen activos, buscarlos en el catálogo de plugins de claude.ai y habilitarlos manualmente.

---

## 3. Settings globales de Claude Code

Crear/editar `~/.claude/settings.json` (en Windows: `C:\Users\<tu-usuario>\.claude\settings.json`):

```json
{
  "enabledPlugins": {
    "frontend-design@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true,
    "figma@claude-plugins-official": true
  },
  "autoUpdatesChannel": "latest",
  "skipDangerousModePermissionPrompt": true,
  "agentPushNotifEnabled": true
}
```

---

## 4. MCP Servers

Los MCP servers que usan `claude.ai` como fuente están **atados a tu cuenta** → se migran solos al iniciar sesión. Los que son `HTTP` local necesitan re-autenticación.

### Conectados automáticamente (via cuenta claude.ai)

| Servidor | URL |
|---|---|
| Atlassian Rovo | `https://mcp.atlassian.com/v1/mcp` |
| Mermaid Chart | `https://chatgpt.mermaid.ai/anthropic/mcp` |
| Supabase | `https://mcp.supabase.com/mcp` |
| Vercel | `https://mcp.vercel.com` |
| Figma | `https://mcp.figma.com/mcp` |
| Google Drive | `https://drivemcp.googleapis.com/mcp/v1` |
| Gmail | `https://gmailmcp.googleapis.com/mcp/v1` |
| Google Calendar | `https://calendarmcp.googleapis.com/mcp/v1` |
| stitch | `https://stitch.googleapis.com/mcp` |

### Necesitan re-autenticación manual

| Servidor | Motivo |
|---|---|
| `n8n` (`https://n8n.xmatica.ai/mcp-server/http`) | Auth expirada — correr `claude mcp` y re-autenticar |
| `plugin:figma:figma` | Plugin local HTTP — re-autenticar desde el plugin de Figma |

### Agregar un MCP server manualmente (si no aparece)

```powershell
claude mcp add <nombre> <url>
```

Verificar estado:

```powershell
claude mcp list
```

---

## 5. Skills (mattpocock/skills)

Instalar el pack completo:

```powershell
npx skills add mattpocock/skills
```

Esto genera un `skills-lock.json` en la raíz del proyecto. El lock file ya está commiteado en el repo, así que al hacer `git pull` ya lo tenés. Pero el comando de arriba descarga los archivos reales de skills a `~/.claude/skills/`.

### Skills incluidas (35 total)

**Ingeniería:**
- `ask-matt` — consultar a Matt Pocock sobre TypeScript
- `code-review` — revisar código
- `codebase-design` — diseño de módulos profundos (deep modules, seams, locality)
- `diagnosing-bugs` — diagnóstico estructurado de bugs
- `domain-modeling` — modelado de dominio, glosario, ADRs
- `grill-with-docs` — interrogar documentación
- `implement` — implementar features desde spec
- `improve-codebase-architecture` — mejorar arquitectura
- `prototype` — prototipado rápido
- `research` — investigación técnica
- `resolving-merge-conflicts` — resolver conflictos de merge
- `setup-matt-pocock-skills` — setup inicial del pack
- `tdd` — desarrollo orientado a tests
- `to-spec` — convertir requerimientos a spec
- `to-tickets` — convertir a tickets
- `triage` — triaje de issues
- `wayfinder` — navegación en codebases desconocidos
- `wizard` — implementación guiada paso a paso

**Productividad:**
- `grill-me` — práctica de concepto por interrogación
- `grilling` — interrogar al agente sobre un tema
- `handoff` — handoff entre sesiones de Claude
- `teach` — explicar conceptos
- `to-questionnaire` — generar cuestionarios
- `wait-what` — clarificar confusión rápidamente
- `writing-for-agents` — escribir prompts efectivos

**Misc:**
- `git-guardrails-claude-code` — guardrails para operaciones git
- `migrate-to-shoehorn` — migración de patrones
- `scaffold-exercises` — armar ejercicios
- `setup-pre-commit` — configurar pre-commit hooks
- `setup-ts-deep-modules` — setup de módulos TypeScript

**En progreso (disponibles pero experimentales):**
- `claude-handoff`, `implement-spec`, `loop-me`, `retro`, `setup-ts-deep-modules`, `writing-beats`, `writing-fragments`, `writing-shape`

---

## 6. Clonar el repo del proyecto

```powershell
git clone https://github.com/nicolassepulveda13/SAP.git "Repo sap"
cd "Repo sap"
```

El archivo `.claude/settings.local.json` ya está commiteado en el repo con los permisos del proyecto (auto-allow para `dotnet *`, `npm *`, `git push/pull`, etc.).

---

## 7. Setup del proyecto SILVERBACK

### Backend (.NET 9)

Requisitos:
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- SQL Server Express (instancia `NICO-DESKTOP\SQLEXPRESS`, Windows Auth)

```powershell
cd "Repo sap\silverback-api\SilverbackApi.Api"

# Aplicar todas las migraciones pendientes
dotnet ef database update --project ..\SilverbackApi.Data

# Correr la API
dotnet run
# → http://localhost:5057
```

### Frontend (Next.js 16)

Requisitos:
- Node.js 20+

```powershell
cd "Repo sap\silverback"
npm install
npm run dev
# → http://localhost:3000
```

---

## 8. Verificación final

```powershell
# MCP servers
claude mcp list

# Skills instaladas
npx skills list

# Health check del stack
curl http://localhost:5057/health
```

---

## Notas

- Los MCP servers de Google (Drive, Gmail, Calendar) y Atlassian requieren estar logueado en la misma cuenta Google/Atlassian que en la PC original. Al conectarse desde claude.ai, OAuth hace el trabajo solo.
- `skipDangerousModePermissionPrompt: true` en settings.json desactiva los prompts de confirmación para comandos peligrosos — asegurarse de entender esto antes de activarlo en una PC compartida.
- El `skills-lock.json` en la raíz del repo fija las versiones de los skills. Si querés actualizar: `npx skills update`.
