---
name: nest-module
description: How to build a business module in otp-api (controller, service, repository, Zod schemas) with multi-company rules. Use when adding or changing a feature module.
---

# Nest business module

Layers, one file each, in `src/<module>/`:

1. `<name>.schema.ts`: Zod schemas and inferred types for input and output.
2. `<name>.controller.ts`: HTTP only. Validates with `ZodValidationPipe` (`#src/common/zod-validation.pipe.js`), takes the company from the session, calls the service.
3. `<name>.service.ts`: business rules. No SQL.
4. `<name>.repository.ts`: Drizzle queries through the `DB` provider (`#src/db/database.module.js`).
5. `<name>.module.ts`: wires the four together.

Errors use Nest `HttpException`s; `AllExceptionsFilter` formats them. Table definitions live in `src/db/tables/<entity>.table.ts` and are re-exported from `src/db/schema.ts`; then run `pnpm db:generate`.

## Multi-company rules

- `companyId` comes from the session (a global guard injects it once auth exists), never from the body or URL.
- `companyId` is explicit in every layer: controller → service → repository. Every query filters by it; every insert sets it.
- Unique constraints and indexes include `companyId` (for example `(companyId, rut)` on suppliers).
- A resource of another company answers 404, never 403, so its existence is not revealed.
- Every module needs an isolation test: company B gets 404 on company A's ids and lists never mix.
- The MVP does not use Row Level Security; the explicit `companyId` filter is the only guard, so never skip it.

## Money and dates

- Amounts are integers in CLP (no decimals, no floats).
- Bill status (`paid`, `overdue`, `pending`) is calculated from `paidTransactionId` and `dueDate`, never stored.
- Paying a bill creates the expense and sets `paidTransactionId` in one database transaction.

## Tests

- Unit specs (`*.spec.ts`) sit next to the code; e2e specs (`*.e2e-spec.ts`) live in `test/` and use the `otp_test` database.
- Pure logic (RUT check digit, projection, import parsing and dedupe, bill status) gets a unit spec.
