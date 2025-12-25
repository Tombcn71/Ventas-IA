import { neon } from '@neondatabase/serverless'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()
const sql = neon(process.env.DATABASE_URL!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function analyzeMenuPhoto(photoUrl: string, brands: string[]): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Analyze this menu/drink photo. Which of these brands do you see: ${brands.join(', ')}?
Return ONLY a JSON array like: ["brand1", "brand2"]
Only include brands clearly visible.`

    const imageResponse = await fetch(photoUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: base64 } }
    ])
    
    const text = result.response.text()
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return Array.isArray(json) ? json : (json.found || [])
  } catch (error) {
    console.error('Analysis error:', error)
    return []
  }
}

async function analyze() {
  console.log('🤖 Analyzing existing venues...\n')
  
  // Get brands (get from brand_products which has active column)
  const brandsData = await sql`
    SELECT DISTINCT b.id, b.name 
    FROM brands b
    INNER JOIN brand_products bp ON b.id = bp.brand_id
    WHERE bp.active = true
  `
  const brandNames = brandsData.map((b: any) => b.name)
  
  console.log(`Looking for: ${brandNames.join(', ')}\n`)
  
  // Get venues with photos
  const venues = await sql`SELECT id, name, platforms FROM venues WHERE platforms IS NOT NULL LIMIT 62`
  
  let analyzed = 0
  
  for (const venue of venues) {
    try {
      const platforms = typeof venue.platforms === 'string' ? JSON.parse(venue.platforms) : venue.platforms
      const photos = platforms?.photos || []
      
      if (photos.length === 0) continue
      
      console.log(`Analyzing: ${venue.name}`)
      const detected = new Set<string>()
      
      for (const photoName of photos.slice(0, 2)) {
        const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&maxWidthPx=1600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        const brands = await analyzeMenuPhoto(photoUrl, brandNames)
        brands.forEach(b => detected.add(b))
        await new Promise(r => setTimeout(r, 2000)) // Rate limit 2 sec
      }
      
      // Save results
      for (const brandName of detected) {
        const brand = brandsData.find((b: any) => b.name.toLowerCase() === brandName.toLowerCase())
        if (brand) {
          const products = await sql`SELECT id FROM brand_products WHERE brand_id = ${brand.id} LIMIT 1`
          if (products.length > 0) {
            await sql`
              INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, detected_at)
              VALUES (${uuidv4()}, ${venue.id}, ${products[0].id}, true, NOW())
            `
          }
        }
      }
      
      console.log(`  ✅ Found: ${Array.from(detected).join(', ') || 'none'}\n`)
      analyzed++
    } catch (err) {
      console.error(`  ❌ Error: ${err}\n`)
    }
  }
  
  console.log(`\n✨ Analyzed ${analyzed} venues`)
}

analyze().catch(console.error)

