import { ServiceUnavailableException } from "@nestjs/common"
import type { Database } from "#src/db/database.module.js"
import { HealthController } from "#src/health/health.controller.js"

const controllerWith = (execute: () => Promise<unknown>) =>
  new HealthController({ execute } as unknown as Database)

describe("HealthController", () => {
  it("returns ok when the database answers", async () => {
    await expect(controllerWith(async () => [{}]).check()).resolves.toEqual({ status: "ok" })
  })

  it("throws 503 when the database fails", async () => {
    const down = async () => {
      throw new Error("connection refused")
    }

    await expect(controllerWith(down).check()).rejects.toThrow(ServiceUnavailableException)
  })
})
