import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { parseJson } from '@/lib/db'

/**
 * GET /api/coverage
 * Returns brand coverage analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const city = searchParams.get('city')

    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 })
    }

    // Get brand info
    const brands = await sql`
      SELECT * FROM brands WHERE id = ${brandId}
    `
    
    if (brands.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const brand = brands[0]

    // Get brand products
    const products = await sql`
      SELECT * FROM brand_products 
      WHERE brand_id = ${brandId} AND active = true
    `

    // Total venues query
    let venuesQuery = sql`SELECT COUNT(*) as total FROM venues WHERE 1=1`
    if (city) {
      venuesQuery = sql`SELECT COUNT(*) as total FROM venues WHERE city = ${city}`
    }
    const totalVenues = await venuesQuery

    // Venues with at least one brand product
    let coverageQuery = city 
      ? sql`
          SELECT COUNT(DISTINCT v.id) as covered
          FROM venues v
          INNER JOIN product_availability pa ON v.id = pa.venue_id
          INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
          WHERE bp.brand_id = ${brandId} 
            AND pa.is_available = true
            AND v.city = ${city}
        `
      : sql`
          SELECT COUNT(DISTINCT v.id) as covered
          FROM venues v
          INNER JOIN product_availability pa ON v.id = pa.venue_id
          INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
          WHERE bp.brand_id = ${brandId} AND pa.is_available = true
        `
    
    const coverage = await coverageQuery

    const total = parseInt(totalVenues[0]?.total || '0')
    const covered = parseInt(coverage[0]?.covered || '0')
    const penetrationRate = total > 0 ? (covered / total) * 100 : 0

    // Coverage by city
    const cityBreakdown = await sql`
      SELECT 
        v.city,
        COUNT(DISTINCT v.id) as total_venues,
        COUNT(DISTINCT CASE WHEN pa.is_available = true THEN v.id END) as covered_venues
      FROM venues v
      LEFT JOIN product_availability pa ON v.id = pa.venue_id
      LEFT JOIN brand_products bp ON pa.brand_product_id = bp.id AND bp.brand_id = ${brandId}
      ${city ? sql`WHERE v.city = ${city}` : sql``}
      GROUP BY v.city
      ORDER BY total_venues DESC
      LIMIT 10
    `

    // Coverage by venue type
    const typeBreakdown = await sql`
      SELECT 
        v.venue_type,
        COUNT(DISTINCT v.id) as total_venues,
        COUNT(DISTINCT CASE WHEN pa.is_available = true THEN v.id END) as covered_venues
      FROM venues v
      LEFT JOIN product_availability pa ON v.id = pa.venue_id
      LEFT JOIN brand_products bp ON pa.brand_product_id = bp.id AND bp.brand_id = ${brandId}
      ${city ? sql`WHERE v.city = ${city}` : sql``}
      GROUP BY v.venue_type
      ORDER BY total_venues DESC
    `

    // Product performance
    const productPerformance = await sql`
      SELECT 
        bp.product_name,
        bp.category,
        COUNT(DISTINCT CASE WHEN pa.is_available = true THEN pa.venue_id END) as present_in,
        AVG(CASE WHEN pa.is_available = true THEN pa.price END) as avg_price
      FROM brand_products bp
      LEFT JOIN product_availability pa ON bp.id = pa.brand_product_id
      WHERE bp.brand_id = ${brandId}
      GROUP BY bp.id, bp.product_name, bp.category
    `

    // Recent changes (last 7 days)
    const recentChanges = await sql`
      SELECT 
        v.name as venue_name,
        v.city,
        bp.product_name,
        pa.is_available,
        pa.detected_at
      FROM product_availability pa
      INNER JOIN venues v ON pa.venue_id = v.id
      INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
      WHERE bp.brand_id = ${brandId}
        AND pa.detected_at > NOW() - INTERVAL '7 days'
      ORDER BY pa.detected_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      brand,
      products: products.map((p: any) => ({
        ...p,
        keywords: parseJson(p.keywords)
      })),
      overview: {
        totalVenues: total,
        coveredVenues: covered,
        penetrationRate: Math.round(penetrationRate * 10) / 10,
        uncoveredVenues: total - covered,
      },
      cityBreakdown: cityBreakdown.map((c: any) => ({
        city: c.city,
        totalVenues: parseInt(c.total_venues),
        coveredVenues: parseInt(c.covered_venues),
        penetrationRate: c.total_venues > 0 
          ? Math.round((c.covered_venues / c.total_venues) * 100 * 10) / 10
          : 0
      })),
      typeBreakdown: typeBreakdown.map((t: any) => ({
        venueType: t.venue_type,
        totalVenues: parseInt(t.total_venues),
        coveredVenues: parseInt(t.covered_venues),
        penetrationRate: t.total_venues > 0 
          ? Math.round((t.covered_venues / t.total_venues) * 100 * 10) / 10
          : 0
      })),
      productPerformance: productPerformance.map((p: any) => ({
        productName: p.product_name,
        category: p.category,
        presentIn: parseInt(p.present_in || '0'),
        avgPrice: p.avg_price ? parseFloat(p.avg_price).toFixed(2) : null
      })),
      recentChanges: recentChanges.map((c: any) => ({
        venueName: c.venue_name,
        city: c.city,
        productName: c.product_name,
        isAvailable: c.is_available,
        detectedAt: c.detected_at
      }))
    })

  } catch (error) {
    console.error('Coverage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coverage data' },
      { status: 500 }
    )
  }
}

