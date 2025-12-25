import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { parseJson } from '@/lib/db'

/**
 * GET /api/opportunities
 * Returns sales opportunities (venues without brand presence but with competitors)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const city = searchParams.get('city')
    const minScore = searchParams.get('minScore')
    const territoryId = searchParams.get('territoryId')

    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 })
    }

    // Build query conditions
    let whereConditions = sql`WHERE 1=1`
    
    if (city) {
      whereConditions = sql`${whereConditions} AND v.city = ${city}`
    }

    // Get opportunities: venues without brand but potentially with competitors
    const opportunities = await sql`
      SELECT 
        v.id,
        v.name,
        v.address,
        v.city,
        v.latitude,
        v.longitude,
        v.venue_type,
        v.cuisine_type,
        v.rating,
        v.price_level,
        v.estimated_weekly_visitors,
        v.platforms,
        v.last_scraped_at,
        cp.competitor_products,
        -- Calculate opportunity score
        (
          COALESCE(v.rating, 0) * 20 +
          COALESCE(v.price_level, 0) * 15 +
          COALESCE(v.estimated_weekly_visitors, 0) / 100 +
          CASE WHEN cp.competitor_products IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN v.platforms::text LIKE '%true%' THEN 5 ELSE 0 END
        ) as opportunity_score
      FROM venues v
      LEFT JOIN product_availability pa ON v.id = pa.venue_id
      LEFT JOIN brand_products bp ON pa.brand_product_id = bp.id AND bp.brand_id = ${brandId}
      LEFT JOIN competitor_presence cp ON v.id = cp.venue_id AND cp.brand_id = ${brandId}
      ${whereConditions}
      -- Only venues where brand is NOT present
      AND NOT EXISTS (
        SELECT 1 FROM product_availability pa2
        INNER JOIN brand_products bp2 ON pa2.brand_product_id = bp2.id
        WHERE pa2.venue_id = v.id 
          AND bp2.brand_id = ${brandId}
          AND pa2.is_available = true
      )
      ORDER BY opportunity_score DESC
      LIMIT 100
    `

    // Filter by min score if provided
    let filtered = opportunities
    if (minScore) {
      const minScoreNum = parseFloat(minScore)
      filtered = opportunities.filter((o: any) => o.opportunity_score >= minScoreNum)
    }

    // Calculate summary stats
    const totalOpportunities = filtered.length
    const highValueOpportunities = filtered.filter((o: any) => o.opportunity_score >= 100).length
    const withCompetitors = filtered.filter((o: any) => o.competitor_products).length

    // Estimate potential revenue
    const estimatedMonthlyRevenue = filtered.reduce((sum: number, o: any) => {
      // Assume €50 per venue per month as base
      const base = 50
      const multiplier = (o.price_level || 2) * 0.5
      const visitorBonus = (o.estimated_weekly_visitors || 0) / 1000 * 10
      return sum + (base * multiplier) + visitorBonus
    }, 0)

    return NextResponse.json({
      opportunities: filtered.map((o: any) => ({
        id: o.id,
        name: o.name,
        address: o.address,
        city: o.city,
        latitude: o.latitude,
        longitude: o.longitude,
        venueType: o.venue_type,
        cuisineType: parseJson(o.cuisine_type),
        rating: o.rating ? parseFloat(o.rating) : null,
        priceLevel: o.price_level,
        estimatedWeeklyVisitors: o.estimated_weekly_visitors,
        platforms: parseJson(o.platforms),
        lastScrapedAt: o.last_scraped_at,
        competitorProducts: parseJson(o.competitor_products),
        opportunityScore: Math.round(o.opportunity_score),
        // Add priority level
        priority: o.opportunity_score >= 100 ? 'high' : o.opportunity_score >= 60 ? 'medium' : 'low'
      })),
      summary: {
        totalOpportunities,
        highValueOpportunities,
        withCompetitors,
        estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
        averageScore: totalOpportunities > 0 
          ? Math.round(filtered.reduce((sum: number, o: any) => sum + o.opportunity_score, 0) / totalOpportunities)
          : 0
      }
    })

  } catch (error) {
    console.error('Opportunities API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}

