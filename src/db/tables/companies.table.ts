import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const companies = pgTable("companies", {
  id: uuid().primaryKey().defaultRandom(),
  rut: text().notNull().unique(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
