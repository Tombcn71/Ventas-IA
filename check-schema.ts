import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()
const sql = neon(process.env.DATABASE_URL!)

async function check() {
  const result = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'venues'
    ORDER BY ordinal_position
  `
  console.log('Venues kolommen:')
  result.forEach((r: any) => console.log(`  ${r.column_name}: ${r.data_type}`))
}

check().catch(console.error)

