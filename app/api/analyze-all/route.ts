import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { analyzeMenuPhoto } from '@/lib/scrapers/gemini-menu-analyzer'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    // Get venues with photos that haven't been analyzed
    const venues = await sql`
      SELECT v.id, v.name, v.platforms 
      FROM venues v
      WHERE v.platforms IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM product_availability pa WHERE pa.venue_id = v.id
        )
      LIMIT 10
    `

    if (venues.length === 0) {
      return NextResponse.json({ message: 'All venues analyzed', analyzed: 0 })
    }

    // Get brands
    const brandsData = await sql`
      SELECT DISTINCT b.id, b.name 
      FROM brands b
      INNER JOIN brand_products bp ON b.id = bp.brand_id
      WHERE bp.active = true
    `
    const brandNames = brandsData.map((b: any) => b.name)

    let analyzed = 0

    for (const venue of venues) {
      const platforms = typeof venue.platforms === 'string' ? JSON.parse(venue.platforms) : venue.platforms
      const photos = platforms?.photos || []
      
      if (photos.length === 0) continue

      const detected = new Set<string>()
      
      for (const photoName of photos.slice(0, 2)) {
        try {
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&maxWidthPx=1600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          const result = await analyzeMenuPhoto(photoUrl, brandNames)
          result.brands.forEach(b => detected.add(b))
        } catch (err) {
          console.error('Photo error:', err)
        }
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

      analyzed++
    }

    return NextResponse.json({ analyzed, remaining: venues.length - analyzed })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}


