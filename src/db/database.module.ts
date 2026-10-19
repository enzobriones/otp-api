import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "#src/db/schema.js"
import { Global, Inject, Module, OnApplicationShutdown } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Env } from "#src/config/env.schema.js"

export const DB = Symbol("DB")

export type Database = NodePgDatabase<typeof schema> & { $client: Pool }

@Global()
@Module({
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Database =>
        drizzle(new Pool({ connectionString: config.get("DATABASE_URL", { infer: true }) }), {
          schema,
        }),
    },
  ],
  exports: [DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB) private readonly db: Database) {}

  async onApplicationShutdown(): Promise<void> {
    await this.db.$client.end()
  }
}
