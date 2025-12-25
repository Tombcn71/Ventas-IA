import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * GET /api/search/keyword
 * Search for custom keyword in venue menus (OCR text)
 * Returns venues that have/don't have the keyword
 */
export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const city = searchParams.get('city') || 'Barcelona'
    const mode = searchParams.get('mode') || 'with' // 'with' or 'without'

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      )
    }

    // Search for keyword in product_availability source data
    // This assumes we store OCR text or menu items somewhere
    // For now, we'll search in existing product names and keywords
    
    if (mode === 'with') {
      // Venues WITH the keyword
      const venues = await sql`
        SELECT DISTINCT
          v.id,
          v.name,
          v.address,
          v.city,
          v.latitude,
          v.longitude,
          v.venue_type,
          v.rating,
          v.price_level,
          COUNT(DISTINCT pa.id) as matches
        FROM venues v
        INNER JOIN product_availability pa ON v.id = pa.venue_id
        INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
        WHERE v.city = ${city}
          AND pa.is_available = true
          AND (
            LOWER(bp.product_name) LIKE ${`%${keyword.toLowerCase()}%`}
            OR bp.keywords::text ILIKE ${`%${keyword.toLowerCase()}%`}
          )
        GROUP BY v.id, v.name, v.address, v.city, v.latitude, v.longitude, v.venue_type, v.rating, v.price_level
        ORDER BY matches DESC, v.rating DESC
        LIMIT 100
      `

      return NextResponse.json({
        keyword,
        city,
        mode: 'with',
        count: venues.length,
        venues: venues.map((v: any) => ({
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          latitude: v.latitude,
          longitude: v.longitude,
          venueType: v.venue_type,
          rating: v.rating ? parseFloat(v.rating) : null,
          priceLevel: v.price_level,
          matches: parseInt(v.matches),
        })),
      })
    } else {
      // Venues WITHOUT the keyword (opportunities)
      const venues = await sql`
        SELECT 
          v.id,
          v.name,
          v.address,
          v.city,
          v.latitude,
          v.longitude,
          v.venue_type,
          v.rating,
          v.price_level,
          v.estimated_weekly_visitors,
          (
            COALESCE(v.rating, 0) * 20 +
            COALESCE(v.price_level, 0) * 15 +
            COALESCE(v.estimated_weekly_visitors, 0) / 100
          ) as opportunity_score
        FROM venues v
        WHERE v.city = ${city}
          AND v.id NOT IN (
            SELECT DISTINCT v2.id
            FROM venues v2
            INNER JOIN product_availability pa ON v2.id = pa.venue_id
            INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
            WHERE pa.is_available = true
              AND (
                LOWER(bp.product_name) LIKE ${`%${keyword.toLowerCase()}%`}
                OR bp.keywords::text ILIKE ${`%${keyword.toLowerCase()}%`}
              )
          )
        ORDER BY opportunity_score DESC
        LIMIT 100
      `

      return NextResponse.json({
        keyword,
        city,
        mode: 'without',
        count: venues.length,
        venues: venues.map((v: any) => ({
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          latitude: v.latitude,
          longitude: v.longitude,
          venueType: v.venue_type,
          rating: v.rating ? parseFloat(v.rating) : null,
          priceLevel: v.price_level,
          estimatedWeeklyVisitors: v.estimated_weekly_visitors,
          opportunityScore: Math.round(v.opportunity_score || 0),
        })),
      })
    }
  } catch (error) {
    console.error('Keyword search error:', error)
    return NextResponse.json(
      { error: 'Failed to search keyword' },
      { status: 500 }
    )
  }
}

