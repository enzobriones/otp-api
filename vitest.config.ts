import { defineConfig } from "vitest/config"

export default defineConfig({
  ssr: { resolve: { conditions: ["source"] } },
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts"],
  },
})
