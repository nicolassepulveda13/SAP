# ⚠️ DEPRECADO — no se usa

Esta carpeta (y `../prisma.config.ts`) quedó de una etapa anterior del proyecto, cuando el stack era Next.js full-stack con Prisma.

Desde S1 el acceso a datos lo hace la **API .NET** (`silverback-api/`) con **EF Core 9 + SQL Server**. El schema vigente son las migraciones de `silverback-api/SilverbackApi.Data/Migrations/`.

- No hay dependencias de Prisma instaladas: estos archivos no compilan ni se ejecutan.
- Están excluidos del chequeo de tipos en `tsconfig.json` para que no rompan `next build`.
- Se conservan solo como referencia histórica.
