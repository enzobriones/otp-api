# otp-api

API de **Ordena tu Pyme**: flujo de caja y cuentas por pagar para pymes chilenas, multiempresa y opensource (MIT). NestJS 12 sobre Fastify, Drizzle + PostgreSQL 17, Zod, pnpm, Vitest y oxlint.

El frontend vive en [otp-frontend](https://github.com/enzobriones/otp-frontend).

## Requisitos

Node 24 y pnpm 12 (`corepack enable`), y Docker.

## Setup local

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm start:dev
```

La API queda en `http://localhost:3000`, con `GET /health` y Swagger en `/docs` (si `SWAGGER_ENABLED=true`).

## Scripts

| Script | Qué hace |
|---|---|
| `start:dev` | API en modo watch |
| `build`, `start:prod` | Compilar y ejecutar en producción |
| `lint`, `typecheck`, `format` | oxlint, tsc y Prettier |
| `test`, `test:e2e`, `test:cov` | Tests unitarios, e2e (base `otp_test`) y cobertura |
| `db:generate`, `db:migrate` | Migraciones con drizzle-kit |

## Documentación

- [`docs/DESIGN.md`](docs/DESIGN.md): alcance, modelo y decisiones.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): CI y despliegue en Railway (staging y production).
- [`docs/superpowers/specs/`](docs/superpowers/specs/): spec aprobado del MVP.
- `AGENTS.md` y `.agents/skills/`: convenciones de código y de módulos.

## Licencia

[MIT](LICENSE)
