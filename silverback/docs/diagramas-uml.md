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

- **Patrón de capas:** Pages (Next.js App Router) → Services (lógica de negocio) → Repositories (acceso a base de datos)
- **Base de datos:** PostgreSQL o SQL Server — base de datos relacional. Los repositorios ejecutan SQL via ORM o driver nativo.
- **Autenticación:** sesiones almacenadas en base de datos, validadas por HTTP (cookie de sesión).
- **Actores:** Miembro (usuario estándar), LiderClan (rol SILVERBACK), Sistema SilverBack, Aliado Comercial (externo)
- **Coherencia:** Todos los diagramas usan la misma nomenclatura canónica (PascalCase clases, camelCase métodos)
- **CER:** `puntajeCER = pesoKg × repeticiones × multiplicadorArquetipo` (VOLUMEN 1.15x, DEFINIDO 1.10x, ATLETICO 1.20x)
