import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn("DATABASE_URL no está configurada. Se usará el modo local de respaldo.")
}

export const sql = databaseUrl ? neon(databaseUrl) : null
