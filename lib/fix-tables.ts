import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()
const sql = neon(process.env.DATABASE_URL!)

async function fix() {
  await sql`CREATE TABLE IF NOT EXISTS "ScrapingJob" (
    "id" TEXT PRIMARY KEY,
    "source" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "city" TEXT,
    "cuisine" TEXT,
    "prospectsFound" INTEGER DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
  console.log('✅ ScrapingJob table created')
}

fix().catch(console.error)


