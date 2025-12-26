import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()
const sql = neon(process.env.DATABASE_URL!)

async function clear() {
  console.log('🗑️  Clearing database...')
  
  await sql`DELETE FROM product_availability`
  console.log('✅ Cleared product_availability')
  
  await sql`DELETE FROM venues`
  console.log('✅ Cleared venues')
  
  await sql`DELETE FROM "ScrapingJob"`
  console.log('✅ Cleared scraping jobs')
  
  console.log('\n✨ Database cleared! Ready for fresh scraping.')
}

clear().catch(console.error)


