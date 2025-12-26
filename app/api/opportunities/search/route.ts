import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const productsParam = searchParams.get('products')
    
    if (!city || !productsParam) {
      return NextResponse.json({ error: 'City and products required' }, { status: 400 })
    }

    const selectedProducts = productsParam.split(',').map(p => p.trim().toLowerCase())
    
    // Get venues WITHOUT these products in their reviews
    const leads = await sql`
      SELECT 
        v.id,
        v.name,
        v.address,
        v.city,
        v.latitude,
        v.longitude,
        v.rating,
        v.price_level,
        v."businessType",
        v."phoneNumber",
        v.website,
        v."leadScore",
        (
          100 - (
            SELECT COUNT(*)::int * 10
            FROM product_availability pa
            INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
            INNER JOIN brands b ON bp.brand_id = b.id
            WHERE pa.venue_id = v.id 
              AND LOWER(b.name) = ANY(${selectedProducts})
          )
        ) as match_score
      FROM venues v
      WHERE v.city = ${city}
        AND v.id NOT IN (
          SELECT DISTINCT pa.venue_id
          FROM product_availability pa
          INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
          INNER JOIN brands b ON bp.brand_id = b.id
          WHERE LOWER(b.name) = ANY(${selectedProducts})
            AND pa.is_available = true
        )
      ORDER BY match_score DESC, v."leadScore" DESC
      LIMIT 100
    `

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Opportunities search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

