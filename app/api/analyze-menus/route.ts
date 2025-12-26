import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { analyzeMenuPhoto } from '@/lib/scrapers/gemini-menu-analyzer'

export async function POST(request: NextRequest) {
  try {
    const { venueId } = await request.json()

    if (!venueId) {
      return NextResponse.json({ error: 'venueId required' }, { status: 400 })
    }

    // Get venue with photos
    const venue = await sql`SELECT * FROM venues WHERE id = ${venueId} LIMIT 1`
    
    if (!venue || venue.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const platforms = typeof venue[0].platforms === 'string' 
      ? JSON.parse(venue[0].platforms) 
      : venue[0].platforms || {}
    
    const photos = platforms.photos || []

    if (photos.length === 0) {
      return NextResponse.json({ error: 'No photos available' }, { status: 400 })
    }

    // Get active brands to look for
    const brands = await sql`SELECT name FROM brands WHERE active = true`
    const brandNames = brands.map((b: any) => b.name)

    // Analyze photos with Gemini
    const detectedBrands = new Set<string>()
    
    for (const photoName of photos.slice(0, 3)) {
      try {
        const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        const result = await analyzeMenuPhoto(photoUrl, brandNames)
        result.brands.forEach(b => detectedBrands.add(b))
      } catch (err) {
        console.error('Error analyzing photo:', err)
      }
    }

    // Save to product_availability
    const detected = Array.from(detectedBrands)
    
    return NextResponse.json({ 
      venueId, 
      detected,
      analyzed: photos.length 
    })
  } catch (error) {
    console.error('Error analyzing menus:', error)
    return NextResponse.json({ error: 'Error analyzing' }, { status: 500 })
  }
}


