import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function getOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await query(text, params)
  return (result.rows[0] as T) ?? null
}

export async function getMany<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await query(text, params)
  return result.rows as T[]
}

export default pool
