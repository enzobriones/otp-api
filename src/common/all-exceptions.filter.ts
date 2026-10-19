import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common"
import type { FastifyReply } from "fastify"
import { STATUS_CODES } from "node:http"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()
      const body = typeof response === "string" ? { message: response } : response

      void reply.status(status).send({ statusCode: status, error: STATUS_CODES[status], ...body })
      return
    }

    this.logger.error(exception)
    void reply
      .status(500)
      .send({ statusCode: 500, error: STATUS_CODES[500], message: "Internal server error" })
  }
}
