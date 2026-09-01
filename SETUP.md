# SILVERBACK — Setup de entorno

## Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 20+ | `node --version` |
| .NET SDK | 9.0 | `dotnet --version` |
| SQL Server | Express o superior | SQL Server Management Studio o `sqlcmd` |
| Git | cualquiera | `git --version` |

---

## Estructura del repositorio

```
Repo sap/
├── silverback/          → Frontend — Next.js 16 + React 19
└── silverback-api/      → Backend — ASP.NET Core 9 Web API
    ├── SilverbackApi.Domain/
    ├── SilverbackApi.Data/
    ├── SilverbackApi.Services/
    └── SilverbackApi.Api/
```

---

## 1. Backend — ASP.NET Core API

### Configurar SQL Server

Abrí `silverback-api/SilverbackApi.Api/appsettings.json` y ajustá el connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=TU_INSTANCIA\\SQLEXPRESS;Database=silverback;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Reemplazá `TU_INSTANCIA` con el nombre de tu máquina (ej: `NICO-DESKTOP`).  
Si usás autenticación SQL (usuario/contraseña), el formato es:
```
Server=localhost;Database=silverback;User Id=sa;Password=TuPassword;TrustServerCertificate=True
```

### Cambiar el JWT Secret

En `appsettings.json`, reemplazá el valor de `Jwt:Secret` por una cadena aleatoria de al menos 32 caracteres.

### Correr la API

```bash
cd silverback-api

# Restaurar dependencias
dotnet restore

# Crear la base de datos (aplica migraciones)
dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api

# Levantar la API en http://localhost:5057
dotnet run --project SilverbackApi.Api
```

Verificá que funciona: `curl http://localhost:5057/health` → `{"status":"ok","db":"connected"}`

---

## 2. Frontend — Next.js

```bash
cd silverback

# Instalar dependencias
npm install

# Crear archivo de entorno
echo API_URL=http://localhost:5057 > .env.local

# Levantar en http://localhost:3000
npm run dev
```

---

## 3. Seed de datos de prueba

El seed crea un usuario y un clan para empezar a probar.

```bash
cd silverback

# Correr seed (requiere que la API esté UP y la DB migrada)
npm run db:seed
```

Credenciales del seed:
- **Email:** `seed@silverback.com`
- **Password:** `password123`

---

## Resumen de comandos

| Acción | Comando |
|---|---|
| Levantar API | `cd silverback-api && dotnet run --project SilverbackApi.Api` |
| Levantar frontend | `cd silverback && npm run dev` |
| Migrar DB | `cd silverback-api && dotnet ef database update --project SilverbackApi.Data --startup-project SilverbackApi.Api` |
| Nueva migración | `cd silverback-api && dotnet ef migrations add NombreMigracion --project SilverbackApi.Data --startup-project SilverbackApi.Api` |
| Seed | `cd silverback && npm run db:seed` |

---

## Puertos

| Servicio | Puerto |
|---|---|
| Next.js frontend | 3000 |
| ASP.NET Core API | 5057 |
| SQL Server | 1433 (default) |

---

## Troubleshooting

**Error de conexión a SQL Server:** Verificá que el servicio `SQL Server (SQLEXPRESS)` esté corriendo en Servicios de Windows.

**`401 Unauthorized` en la API:** El token JWT expiró o es inválido. Cerrá sesión y volvé a loguear.

**Next.js no conecta con la API:** Verificá que `API_URL` en `.env.local` apunte al puerto correcto y que la API esté corriendo.

**`dotnet ef` no encontrado:** Instalá las herramientas globales: `dotnet tool install --global dotnet-ef`
