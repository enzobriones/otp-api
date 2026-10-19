import z from "zod"
import { ZodValidationPipe } from "./zod-validation.pipe.js"
import { BadRequestException } from "@nestjs/common"

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().min(3) }))

  it("returns the parsed value", () => {
    expect(pipe.transform({ name: "Pyme SpA" })).toEqual({ name: "Pyme SpA" })
  })

  it("throws BadRequestException with the issues", () => {
    expect(() => pipe.transform({ name: "x" })).toThrow(BadRequestException)
  })
})
