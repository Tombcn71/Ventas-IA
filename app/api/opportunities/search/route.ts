import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getLeadIntelligence } from '@/app/actions/analyze-leads'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const productsParam = searchParams.get('products')
    
    if (!city || !productsParam) {
      return NextResponse.json({ error: 'City and products required' }, { status: 400 })
    }

    const selectedProducts = productsParam.split(',').map(p => p.trim())
    
    // GAP ANALYSIS: Venues WITHOUT your products
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
        v."currentProducts",
        v.platforms,
        v."reviewCount",
        CASE
          WHEN v.rating >= 4.0 AND v."reviewCount" >= 100 THEN 95
          WHEN v.rating >= 4.0 AND v."reviewCount" >= 50 THEN 85
          WHEN v."currentProducts"::text LIKE '%heineken%' OR v."currentProducts"::text LIKE '%mahou%' THEN 80
          WHEN v.rating >= 3.5 THEN 70
          ELSE 60
        END as sales_score
      FROM venues v
      WHERE v.city = ${city}
        AND v."businessType" IN ('bar', 'restaurant', 'cafe')
        AND v.id NOT IN (
          SELECT DISTINCT pa.venue_id
          FROM product_availability pa
          INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
          INNER JOIN brands b ON bp.brand_id = b.id
          WHERE b.name = ANY(${selectedProducts})
            AND pa.is_available = true
        )
      ORDER BY sales_score DESC, v.rating DESC
      LIMIT 50
    `

    // Extract AI insights already stored during scraping
    const leadsWithIntelligence = leads.map((lead: any) => {
      const platforms = typeof lead.platforms === 'string' ? JSON.parse(lead.platforms) : lead.platforms
      const aiInsight = platforms?.aiInsight || null
      const currentProducts = typeof lead.currentProducts === 'string' 
        ? JSON.parse(lead.currentProducts) 
        : (lead.currentProducts || [])
      
      return {
        ...lead,
        matchScore: aiInsight?.match_score || lead.sales_score,
        competitorDetected: aiInsight?.competitor_detected || currentProducts,
        painPoints: aiInsight?.pain_points || [],
        perfectPitch: lead.notes || aiInsight?.perfect_pitch || null,
        currentProducts
      }
    })

    return NextResponse.json({ leads: leadsWithIntelligence })
  } catch (error) {
    console.error('Opportunities search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

