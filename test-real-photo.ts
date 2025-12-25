import { neon } from '@neondatabase/serverless'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function test() {
  // Get venue with photos
  const venues = await sql`SELECT id, name, platforms FROM venues WHERE platforms IS NOT NULL LIMIT 5`
  
  for (const venue of venues) {
    const platforms = typeof venue.platforms === 'string' ? JSON.parse(venue.platforms) : venue.platforms
    const photos = platforms?.photos || []
    
    if (photos.length > 0) {
      console.log(`\n✅ Testing: ${venue.name}`)
      console.log(`Photos: ${photos.length}`)
      
      const photoName = photos[0]
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      
      console.log('Fetching photo...')
      const imageRes = await fetch(photoUrl)
      const buffer = await imageRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      console.log(`Image size: ${Math.round(buffer.byteLength / 1024)}KB`)
      
      console.log('Analyzing with Gemini...')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const result = await model.generateContent([
        'What drinks or beer brands do you see in this image? List them.',
        { inlineData: { mimeType: 'image/jpeg', data: base64 } }
      ])
      
      console.log('Gemini response:', result.response.text())
      return
    }
  }
  
  console.log('No venues with photos found')
}

test().catch(console.error)

