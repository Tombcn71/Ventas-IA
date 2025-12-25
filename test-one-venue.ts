import { neon } from '@neondatabase/serverless'
import { analyzeMenuPhoto } from './lib/scrapers/gemini-menu-analyzer'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function test() {
  // Get one venue with photos
  const venue = await sql`
    SELECT id, name, platforms 
    FROM venues 
    WHERE platforms IS NOT NULL 
    LIMIT 1
  `
  
  if (venue.length === 0) {
    console.log('No venues with photos')
    return
  }
  
  const platforms = typeof venue[0].platforms === 'string' ? JSON.parse(venue[0].platforms) : venue[0].platforms
  const photos = platforms.photos || []
  
  console.log('Venue:', venue[0].name)
  console.log('Photos:', photos.length)
  
  if (photos.length === 0) {
    console.log('No photos!')
    return
  }
  
  const photoName = photos[0]
  const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&maxWidthPx=1600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  
  console.log('Photo URL:', photoUrl)
  console.log('\nAnalyzing with Gemini...')
  
  const result = await analyzeMenuPhoto(photoUrl, ['heineken', 'mahou', 'pizza'])
  
  console.log('\nResult:', result)
}

test().catch(console.error)

