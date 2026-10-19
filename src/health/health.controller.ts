import { Controller, Get, Inject, Logger, ServiceUnavailableException } from "@nestjs/common"
import { sql } from "drizzle-orm"
import { DB, type Database } from "#src/db/database.module.js"

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name)

  constructor(@Inject(DB) private readonly db: Database) {}

  @Get()
  async check(): Promise<{ status: "ok" }> {
    try {
      await this.db.execute(sql`select 1`)
    } catch (error) {
      this.logger.error(error)
      throw new ServiceUnavailableException("Database unavailable")
    }

    return { status: "ok" }
  }
}
