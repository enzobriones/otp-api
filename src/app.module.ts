import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envSchema } from "#src/config/env.schema.js"
import { DatabaseModule } from "#src/db/database.module.js"
import { HealthController } from "#src/health/health.controller.js"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (env) => envSchema.parse(env) }),
    DatabaseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
