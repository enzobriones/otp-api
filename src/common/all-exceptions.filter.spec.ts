import { ArgumentsHost, BadRequestException } from "@nestjs/common"
import { AllExceptionsFilter } from "./all-exceptions.filter.js"

const run = (exception: unknown) => {
  const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }
  const host = { switchToHttp: () => ({ getResponse: () => reply }) } as unknown as ArgumentsHost

  new AllExceptionsFilter().catch(exception, host)

  return reply
}

describe("AllExceptionsFilter", () => {
  it("keeps status and message of an HttpException", () => {
    const reply = run(new BadRequestException({ message: "Validation failed", details: [] }))

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
      details: [],
    })
  })

  it("hides the details of an unknown error", () => {
    const reply = run(new Error("db password leaked"))

    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Internal server error",
    })
  })
})
