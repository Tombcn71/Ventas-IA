import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()
const sql = neon(process.env.DATABASE_URL!)

async function check() {
  console.log('Checking menu analysis results...\n')
  
  // Check if any product_availability records exist
  const results = await sql`
    SELECT 
      v.name as venue_name,
      b.name as brand_name,
      pa.detected_at
    FROM product_availability pa
    INNER JOIN venues v ON pa.venue_id = v.id
    INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
    INNER JOIN brands b ON bp.brand_id = b.id
    WHERE pa.is_available = true
    ORDER BY pa.detected_at DESC
    LIMIT 20
  `
  
  console.log(`Found ${results.length} detected products:\n`)
  
  results.forEach((r: any) => {
    console.log(`✅ ${r.venue_name} → ${r.brand_name}`)
  })
  
  if (results.length === 0) {
    console.log('❌ No menu analysis results found yet')
    console.log('\nPossible reasons:')
    console.log('- Gemini has not run yet (check server logs)')
    console.log('- No brands configured')
    console.log('- No venues with photos')
  }
}

check().catch(console.error)


