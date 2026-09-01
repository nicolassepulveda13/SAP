# 10.5.6 — Diagrama de Componentes

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama de componentes UML  
**Descripción:** Vista de comunicación entre los componentes físicos del sistema. Las flechas muestran el protocolo de cada interacción.  
**Decisión de arquitectura:** Se adoptó separación de servidores — Next.js actúa como frontend puro (Capa de Presentación) y ASP.NET Core Web API encapsula la lógica de negocio y acceso a datos. Esto permite depuración independiente de cada capa, Swagger integrado en la API, y contratos HTTP explícitos como interfaz entre frontend y backend.

---

```plantuml
@startuml component-diagram

node "Browser — Cliente Web" as Browser {
  [Pages Layer\nNext.js 16 — React 19\nApp Router / Server Components] as UI
  [Web Speech API\nexterno browser] as SpeechAPI
}

node "Next.js — Servidor de Presentación\n:3000" as NextApp {
  [Auth Middleware\nVerifica cookie sb_token\nRedirecciona si no autenticado] as AuthMiddleware
  [Server Components\nFetch al API con Bearer token] as ServerComponents
  [Server Actions\nlogin / logout] as ServerActions
}

node "ASP.NET Core Web API\n:5057" as DotnetAPI {
  [Controllers Layer\nHTTP endpoints REST] as Controllers
  [Services Layer\nLógica de Negocio] as ServicesLayer
  [Repositories Layer\nAcceso a Datos — EF Core] as ReposLayer
  [JWT Middleware\nValidación de token] as JWTMiddleware
}

node "Capa de Datos" as DataLayer {
  database "SQL Server\nNICO-DESKTOP\\SQLEXPRESS" as DB
}

actor "Aliado Comercial\nactor externo" as Aliado
[Wearables API\nApple Health / Google Fit\n(futuro)] as WearablesAPI

UI --> AuthMiddleware : Cookie HTTP-only sb_token
UI --> ServerComponents : RSC render
ServerComponents --> DotnetAPI : HTTPS — GET con Bearer token
ServerActions --> DotnetAPI : HTTPS — POST/PUT con Bearer token
AuthMiddleware ..> ServerComponents : pasa si autenticado

DotnetAPI --> JWTMiddleware : valida en cada request
JWTMiddleware --> Controllers : pasa si token válido
Controllers --> ServicesLayer : llamadas internas
ServicesLayer --> ReposLayer : llamadas internas
ReposLayer --> DB : SQL vía EF Core

UI --> SpeechAPI : Web Speech API — local
UI --> Aliado : HTTPS redirect

WearablesAPI ..> ServicesLayer : REST API (futuro)

@enduml
```
