import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set - database operations will fail')
}

export const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : null as any

// Helper function to parse JSON fields
export function parseJson<T>(value: string | null | undefined): T {
  if (!value) return [] as T
  try {
    if (typeof value === 'string') {
      return JSON.parse(value) as T
    }
    return value as T
  } catch {
    return [] as T
  }
}

// Helper function to stringify JSON fields
export function stringifyJson(value: any): string {
  if (value === null || value === undefined) {
    return '[]'
  }
  return JSON.stringify(value)
}

