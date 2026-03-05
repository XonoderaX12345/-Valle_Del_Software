# Valle Software - Arquitectura Inicial

Este repositorio inicia la arquitectura de `Front_Valle` y `Back_Valle` con enfoque en microservicios y persistencia real desde base de datos.

## Stack base

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Express + TypeScript
- Base de datos: PostgreSQL
- ORM: Prisma
- Infra local: Docker Compose (Postgres + Redis + NATS)

## Estructura

```text
Front_Valle/
  apps/
    web-public/
    web-platform/

Back_Valle/
  gateway/
  services/
    auth-service/
    users-service/
    cms-service/
    convocatoria-service/
    cohort-service/
    activity-service/
    evidence-service/
    certificate-service/
    seedbed-service/
    pmo-service/
    report-service/
    files-service/
  infra/
    docker-compose.yml
    postgres/init/00-create-schemas.sql
```

## Esquema de base de datos (Prisma)

Se usa **una sola instancia PostgreSQL** con **esquemas por microservicio**.

Puertos locales reservados en este proyecto:

- PostgreSQL Docker: `localhost:55432`
- Gateway API: `localhost:4300`

### 1) `auth-service` -> esquema `auth`

Tablas Prisma:

- `Role`
- `UserAuth`
- `RefreshToken`

Relaciones:

- `Role (1) -> (N) UserAuth`
- `UserAuth (1) -> (N) RefreshToken`

```text
auth.Role
  id (PK)
  key (UNIQUE)
    |
    | 1:N
    v
auth.UserAuth
  id (PK)
  email (UNIQUE)
  roleId (FK -> auth.Role.id)
    |
    | 1:N
    v
auth.RefreshToken
  id (PK)
  token (UNIQUE)
  userId (FK -> auth.UserAuth.id)
```

### 2) `users-service` -> esquema `users`

Tablas Prisma:

- `UserProfile`
- `Permission`

Relaciones y acoplamiento:

- `UserProfile.authUserId` referencia lógica al `id` de `auth.UserAuth`.
- No hay FK cruzada física entre microservicios para mantener independencia de dominio.

```text
users.UserProfile
  id (PK)
  authUserId (UNIQUE, referencia logica a auth.UserAuth.id)

users.Permission
  id (PK)
  key (UNIQUE)
```

### Esquemas ya creados en PostgreSQL (`valle_db`)

- `auth`, `users`, `cms`, `convocatoria`, `cohort`, `activity`, `evidence`, `certificate`, `seedbed`, `pmo`, `report`, `files`

## Flujo de conexión inicial

- `web-public` consume `GET /health` del gateway.
- `web-platform` consume `GET /api/users/profiles` vía gateway.
- Gateway enruta a:
  - `/api/auth/*` -> `auth-service`
  - `/api/users/*` -> `users-service`

## Arranque local

1. Levantar infraestructura:

```bash
docker compose -f Back_Valle/infra/docker-compose.yml up -d
```

2. Crear `.env` desde cada `.env.example`:

- `Back_Valle/gateway/.env.example`
- `Back_Valle/services/auth-service/.env.example`
- `Back_Valle/services/users-service/.env.example`
- `Back_Valle/services/cms-service/.env.example`
- `Front_Valle/apps/web-public/.env.example`
- `Front_Valle/apps/web-platform/.env.example`

3. Migrar y seed:

```bash
npm run prisma:migrate -w auth-service
npm run prisma:seed -w auth-service
npm run prisma:migrate -w users-service
npm run prisma:seed -w users-service
npm run prisma:migrate -w cms-service
npm run prisma:seed -w cms-service
```

4. Ejecutar servicios:

```bash
npm run dev -w auth-service
npm run dev -w users-service
npm run dev -w cms-service
npm run dev -w gateway
npm run dev -w web-public
npm run dev -w web-platform
```

Tambien puedes iniciar todo con:

```bash
npm run dev:core
```

## Regla de proyecto

No usar mocks de negocio. Toda informacion funcional debe vivir en base de datos y exponerse por API.
