import { Test } from "@nestjs/testing"
import request from "supertest"
import { AppModule } from "#src/app.module.js"
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify"
import { setupApp } from "#src/setup-app.js"

describe("App (e2e)", () => {
  let app: NestFastifyApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    await setupApp(app)
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it("/docs (GET)", () => request(app.getHttpServer()).get("/docs").expect(200))

  it("/health (GET)", () =>
    request(app.getHttpServer()).get("/health").expect(200).expect({ status: "ok" }))
})
