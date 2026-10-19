---
name: code-style
description: Code style rules for otp-api (quotes, functions, types, imports, naming). Use when writing or reviewing any TypeScript in this repo.
---

# Code style

Prettier and oxlint enforce most of this (`pnpm format`, `pnpm lint`). The rest is convention.

| Topic | Rule |
|---|---|
| Quotes / `;` | Double quotes, no semicolons, `printWidth: 100`, trailing commas |
| Functions | Outside classes: arrow functions only. Inside Nest classes (controllers, services, repositories, guards): normal methods |
| Spacing | One blank line between functions and methods |
| Language | Code in English. Keep Chilean terms: `rut`, `cartola`. User-facing messages and docs in Spanish |
| Types | `type`, never `interface`. Derive from `z.infer` / `$inferSelect` when possible |
| Enums | No TS `enum`. Use `pgEnum` or `z.enum` plus a derived union |
| Returns | Explicit return type on every exported function or method |
| Imports | `#src/*.js` alias (ESM nodenext, `.js` extension). In `src/db/schema.ts` and `src/db/tables/*` use relative imports: drizzle-kit does not resolve the alias |
| Exports | Named exports only, no default exports |
| Files | kebab-case with the Nest suffix (`transactions.service.ts`, `companies.table.ts`) |
| Comments | Only the why that the code cannot show |

```ts
// ✅
import { Company } from "#src/companies/company.schema.js"

export const toLabel = (company: Company): string => `${company.rut} ${company.name}`

// ❌
import { Company } from "../companies/company.schema"

export default function toLabel(company: Company) {
  return company.rut + " " + company.name;
}
```

```ts
// ✅ type + union derived from the schema
export const transactionTypeSchema = z.enum(["income", "expense"])
export type TransactionType = z.infer<typeof transactionTypeSchema>

// ❌
export enum TransactionType { Income = "income" }
export interface Company { rut: string }
```
