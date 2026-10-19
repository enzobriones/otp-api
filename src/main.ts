import { NestFactory } from "@nestjs/core"
import { AppModule } from "#src/app.module.js"
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify"
import { setupApp } from "./setup-app.js"
import { ConfigService } from "@nestjs/config"
import { Env } from "./config/env.schema.js"

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const config = app.get<ConfigService<Env, true>>(ConfigService)
  await setupApp(app)
  await app.listen(config.get("PORT", { infer: true }), "0.0.0.0")
}
await bootstrap()
