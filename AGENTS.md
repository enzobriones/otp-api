# otp-api

API of Ordena tu Pyme: cash flow and accounts payable for Chilean SMEs, multi-company SaaS. NestJS 12 on Fastify, Drizzle + PostgreSQL 18, Zod, pnpm, Vitest, oxlint.

Domain, scope and decisions: [`docs/DESIGN.md`](docs/DESIGN.md) and the approved spec in [`docs/superpowers/specs/`](docs/superpowers/specs/). Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Commands

```bash
pnpm install
docker compose up -d        # local Postgres (needs .env, see .env.example)
pnpm db:migrate
pnpm start:dev              # API on :3000
pnpm lint
pnpm typecheck
pnpm format
pnpm test                   # unit
pnpm test:e2e               # needs the otp_test database
pnpm db:generate            # after changing src/db/tables/*
```

Before calling something done, run what CI runs: `pnpm lint && pnpm typecheck && pnpm test && pnpm db:migrate && pnpm test:e2e` (with `DATABASE_URL` pointing to the test database).

## Structure

- `src/common/`: `ZodValidationPipe`, `AllExceptionsFilter`
- `src/config/`: Zod env schema (the only place that reads `process.env`)
- `src/db/`: Drizzle `schema.ts` (re-exports `tables/*.table.ts`) and the `DB` provider
- `src/health/`: `GET /health` (runs `select 1`)
- `test/`: e2e specs
- `drizzle/`: generated migrations, never edited by hand

## Skills

- `.agents/skills/code-style/SKILL.md`: style rules
- `.agents/skills/nest-module/SKILL.md`: how to build a module, multi-company rules

## Deploy

Railway project `ordena-tu-pyme`, deployed from GitHub after CI passes (Wait for CI). Config lives in the Railway dashboard, not in the repo.

- `production` ← `main`, `staging` ← `develop`; each has its own Postgres.
- `api`: `pnpm start:prod`, pre-deploy `pnpm db:migrate`, healthcheck `/health`.
- `staging` has `SWAGGER_ENABLED=true`.

## Git

- Each vertical slice is one feature branch (`feat/<slice>`) off an up-to-date `develop`, one PR to `develop`, merged once CI passes. Production releases are a PR from `develop` to `main`.
- Flow: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` → push → `gh pr create --base develop` → `gh pr checks <n> --watch` → `gh pr merge <n> --merge --delete-branch` (merge commit).
- After the merge: `git checkout develop && git pull`, then confirm the feature branch is gone locally and on the remote (`git branch -a`, `git fetch --prune`).
- Conventional Commits with scope: `feat(api): ...`, `fix(api): ...`, `chore(api): ...`, `docs: ...`.
- Commits and PR descriptions have no `Co-Authored-By` line and no tool signature.
