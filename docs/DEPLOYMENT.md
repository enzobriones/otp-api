# CI/CD en Railway

Proyecto `ordena-tu-pyme` en Railway con dos entornos, cada uno con su propia base de datos.
Flujo del repositorio: `feat/*` → PR a `develop` → CI → despliegue en `staging`. Un PR de
`develop` a `main` libera `production`.

| Entorno | Rama | Servicios | Swagger |
|---|---|---|---|
| `staging` | `develop` | `api`, `frontend`, `Postgres` | activo |
| `production` | `main` | `api`, `frontend`, `Postgres` | apagado |

La configuración vive en el dashboard de Railway, no en el repo. No hay `railway.json`.

## CI en GitHub

`.github/workflows/ci.yml` corre en cada PR y en cada push a `develop` y `main`: instalación con
lockfile congelado, oxlint, `tsc`, Prettier, tests unitarios, migraciones y tests e2e contra un
PostgreSQL 17 temporal (`otp_test`). No usa credenciales de Railway.

Las ramas tienen **Wait for CI** activo: Railway despliega solo si el workflow termina bien.

## Servicio `api`

| Ajuste | Valor |
|---|---|
| Fuente | GitHub `enzobriones/otp-api` (`develop` en staging, `main` en production) |
| Build | `pnpm build` |
| Pre-deploy | `pnpm db:migrate` |
| Start | `pnpm start:prod` |
| Healthcheck | `/health` (hace `select 1`; responde 503 si la base no está) |
| Réplicas | 1 |

Variables:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (red privada) |
| `SWAGGER_ENABLED` | `true` en staging, `false` en production |

Railway asigna `PORT`. No uses `DATABASE_PUBLIC_URL` ni subas archivos `.env`.

## Servicio `Postgres`

PostgreSQL con volumen persistente, uno por entorno. No cambies la versión mayor de una base ya
inicializada.

## Servicio `frontend`

Ver el README de `otp-frontend`. Apunta a la API del mismo entorno por la red privada con
`API_BASE_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}/v1`.

## Comandos útiles

```sh
railway link --project ordena-tu-pyme --environment staging --service api
railway status
railway logs --service api --lines 100
railway usage
```

## Costos

Plan Hobby: USD 5 al mes con USD 5 de recursos incluidos, compartidos por todo el workspace. Dos
entornos con tres servicios cada uno consumen más que un solo entorno; revisa **Usage** después
del primer día y no cambies los límites de gasto del workspace sin decidirlo.

## Fallos y recuperación

- Un workflow fallido impide el autodespliegue (**Wait for CI**).
- Si falla el pre-deploy (`db:migrate`), el nuevo despliegue no continúa.
- Para volver a una versión: **Deployments → Redeploy**. Esto **no revierte migraciones**; el
  código anterior debe ser compatible con el esquema actual.
- No uses `drizzle-kit push`: versiona las migraciones SQL antes del merge.
