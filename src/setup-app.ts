import { NestFastifyApplication } from "@nestjs/platform-fastify"
import { AllExceptionsFilter } from "./common/all-exceptions.filter.js"
import { ConfigService } from "@nestjs/config"
import { Env } from "./config/env.schema.js"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export const setupApp = async (app: NestFastifyApplication): Promise<void> => {
  const config = app.get<ConfigService<Env, true>>(ConfigService)

  app.setGlobalPrefix("v1", { exclude: ["health"] })
  app.useGlobalFilters(new AllExceptionsFilter())
  app.enableShutdownHooks()

  if (config.get("SWAGGER_ENABLED", { infer: true })) {
    const options = new DocumentBuilder().setTitle("otp-api").setVersion("0.1.0").build()

    SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, options))
  }
}
