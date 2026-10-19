import { defineConfig } from "drizzle-kit"
import { envSchema } from "./src/config/env.schema.js"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: envSchema.parse(process.env).DATABASE_URL },
})
