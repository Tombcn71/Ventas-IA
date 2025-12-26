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

    // Get reviews for each lead and generate AI insights
    const leadsWithIntelligence = await Promise.all(
      leads.slice(0, 10).map(async (lead: any) => {
        try {
          // Get actual reviews from Google (would need to fetch or store them)
          // For now, generate intelligence based on available data
          const currentProducts = typeof lead.currentProducts === 'string' 
            ? JSON.parse(lead.currentProducts) 
            : (lead.currentProducts || [])
          
          // Get real reviews from platforms storage
          const platforms = typeof lead.platforms === 'string' ? JSON.parse(lead.platforms) : lead.platforms
          const reviewsText = platforms?.reviews || []
          
          if (reviewsText.length === 0) {
            return { ...lead, matchScore: lead.sales_score, perfectPitch: `Perfecto para ${selectedProducts[0]}.` }
          }
          
          const intelligence = await getLeadIntelligence(reviewsText.slice(0, 10), selectedProducts)
          
          return {
            ...lead,
            matchScore: intelligence.match_score || lead.sales_score,
            competitorDetected: intelligence.competitor_detected || currentProducts,
            painPoints: intelligence.pain_points || [],
            perfectPitch: intelligence.perfect_pitch,
            currentProducts
          }
        } catch (error) {
          return {
            ...lead,
            matchScore: lead.sales_score,
            perfectPitch: `Hola, vengo a presentarte ${selectedProducts[0]}.`
          }
        }
      })
    )

    return NextResponse.json({ leads: leadsWithIntelligence })
  } catch (error) {
    console.error('Opportunities search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

