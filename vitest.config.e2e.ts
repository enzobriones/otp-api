import { defineConfig } from "vitest/config"

export default defineConfig({
  ssr: { resolve: { conditions: ["source"] } },
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/otp_test",
      SWAGGER_ENABLED: "true",
    },
    globals: true,
    fileParallelism: false,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
  },
})
