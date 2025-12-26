import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandName = searchParams.get('brand')
    const city = searchParams.get('city') || 'Barcelona'
    const mode = searchParams.get('mode') || 'without' // 'with' or 'without'

    if (!brandName) {
      return NextResponse.json({ error: 'Brand required' }, { status: 400 })
    }

    // Get brand
    const brands = await sql`SELECT id FROM brands WHERE LOWER(name) = LOWER(${brandName}) LIMIT 1`
    
    if (brands.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const brandId = brands[0].id

    if (mode === 'with') {
      // Venues WITH this brand
      const venues = await sql`
        SELECT DISTINCT
          v.id, v.name, v.address, v.city,
          v.latitude, v.longitude, v.venue_type,
          v.rating, v.price_level, v."phoneNumber", v.website
        FROM venues v
        INNER JOIN product_availability pa ON v.id = pa.venue_id
        INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
        WHERE bp.brand_id = ${brandId}
          AND pa.is_available = true
          AND v.city = ${city}
        ORDER BY v.rating DESC
        LIMIT 100
      `
      
      return NextResponse.json({ mode: 'with', brand: brandName, city, count: venues.length, venues })
    } else {
      // Venues WITHOUT this brand (opportunities!)
      const venues = await sql`
        SELECT 
          v.id, v.name, v.address, v.city,
          v.latitude, v.longitude, v.venue_type,
          v.rating, v.price_level, v."phoneNumber", v.website,
          (COALESCE(v.rating, 0) * 20) as opportunity_score
        FROM venues v
        WHERE v.city = ${city}
          AND v.id NOT IN (
            SELECT DISTINCT pa.venue_id
            FROM product_availability pa
            INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
            WHERE bp.brand_id = ${brandId} AND pa.is_available = true
          )
        ORDER BY opportunity_score DESC
        LIMIT 100
      `
      
      return NextResponse.json({ mode: 'without', brand: brandName, city, count: venues.length, venues })
    }
  } catch (error) {
    console.error('Brand search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}


