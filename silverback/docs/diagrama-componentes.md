# 10.5.6 — Diagrama de Componentes

**Proyecto:** SILVERBACK  
**Tipo:** Diagrama de componentes UML  
**Descripción:** Vista de comunicación entre los componentes físicos del sistema. Las flechas muestran el protocolo de cada interacción.

---

```plantuml
@startuml component-diagram

node "Browser — Cliente Web" as Browser {
  [Pages Layer\nNext.js App Router] as UI
  [Web Speech API\nexterno browser] as SpeechAPI
}

node "Next.js App — Servidor" as NextApp {
  [Services Layer\nLógica de Negocio] as ServicesLayer
  [Repositories Layer\nAcceso a Datos] as ReposLayer
  [Auth Middleware\nValidación de sesión HTTP] as AuthMiddleware
}

node "Capa de Datos" as DataLayer {
  database "PostgreSQL / SQL Server\nBase de datos relacional" as DB
  [Tabla de Sesiones\nen base de datos] as Sessions
}

actor "Aliado Comercial\nactor externo" as Aliado
[Wearables API\nApple Health / Google Fit\n(futuro)] as WearablesAPI

UI --> ServicesLayer : HTTPS — Server Actions / API Routes
UI --> AuthMiddleware : Cookie de sesión HTTP
AuthMiddleware --> Sessions : SELECT sesion
ServicesLayer --> ReposLayer : llamadas internas
ReposLayer --> DB : SQL (ORM / driver)
Sessions ..> DB : misma instancia

UI --> SpeechAPI : Web Speech API — local
UI --> Aliado : HTTPS redirect

WearablesAPI ..> ServicesLayer : REST API (futuro)

@enduml
```
