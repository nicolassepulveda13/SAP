# SILVERBACK — Diagramas UML

**Proyecto:** SILVERBACK — Plataforma de Gamificación del Entrenamiento Físico  
**Entrega:** E2 — Especificación Técnica  
**Universidad:** UAI — Seminario de Trabajo Final (SAP 2026)  
**Versión:** 3.0 — PlantUML

---

## Índice

| Sección | Contenido | Archivo | Estado |
|---------|-----------|---------|--------|
| **10.5.4** | Diagramas de Secuencia — CU-001 INCORPORACIÓN + CU-002 SANTUARIO | [secuencias-cu001-cu002.md](./secuencias-cu001-cu002.md) | ✅ Completo |
| **10.5.4** | Diagramas de Secuencia — CU-003 ARENA + CU-004 EVOLUCIÓN | [secuencias-cu003-cu004.md](./secuencias-cu003-cu004.md) | ✅ Completo |
| **10.5.4** | Diagramas de Secuencia — CU-005 PERFIL | [secuencias-cu005.md](./secuencias-cu005.md) | ✅ Completo |
| **10.5.5** | Diagrama de Paquetes | [diagrama-paquetes.md](./diagrama-paquetes.md) | ✅ Completo |
| **10.5.6** | Diagrama de Componentes | [diagrama-componentes.md](./diagrama-componentes.md) | ✅ Completo |
| **10.5.7** | Diagrama de Clases | [diagrama-clases.md](./diagrama-clases.md) | ✅ Completo |
| **10.5.8** | Diagrama Entidad-Relación (crow's foot) | [diagrama-er.md](./diagrama-er.md) | ✅ Completo |

---

## Notas de arquitectura

- **Patrón de capas:** Pages (Next.js App Router) → Server Actions → API Controllers (.NET) → Services (lógica de negocio) → Repositories → SQL Server
- **Base de datos:** SQL Server — base de datos relacional. Los repositorios ejecutan SQL via ORM o driver nativo.
- **Autenticación:** JWT firmado por la API (.NET), guardado en la cookie HTTP-only `sb_token` y enviado como `Authorization: Bearer`.
- **Actores:** Miembro (usuario estándar), LiderClan (rol SILVERBACK), Sistema SilverBack, Aliado Comercial (externo)
- **Coherencia:** Todos los diagramas usan la misma nomenclatura canónica (PascalCase clases, camelCase métodos)
- **CER:** `puntajeCER = pesoKg × repeticiones × multiplicadorArquetipo` (VOLUMEN 1.10x, DEFINIDO 1.05x, ATLETICO 1.00x — decisión S4, ver `Modificacion-Carpeta.md`)
