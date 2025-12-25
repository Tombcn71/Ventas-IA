import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Count total venues
    const totalVenues = await sql`SELECT COUNT(*) as count FROM venues`
    
    // Count analyzed venues
    const analyzedVenues = await sql`
      SELECT COUNT(DISTINCT venue_id) as count 
      FROM product_availability
    `
    
    // Recent detections
    const recentDetections = await sql`
      SELECT 
        v.name as venue_name,
        b.name as brand_name,
        pa.detected_at
      FROM product_availability pa
      INNER JOIN venues v ON pa.venue_id = v.id
      INNER JOIN brand_products bp ON pa.brand_product_id = bp.id
      INNER JOIN brands b ON bp.brand_id = b.id
      ORDER BY pa.detected_at DESC
      LIMIT 10
    `
    
    return NextResponse.json({
      total: Number(totalVenues[0].count),
      analyzed: Number(analyzedVenues[0].count),
      progress: Math.round((Number(analyzedVenues[0].count) / Number(totalVenues[0].count)) * 100),
      recentDetections: recentDetections.map((r: any) => ({
        venue: r.venue_name,
        brand: r.brand_name,
        when: r.detected_at
      }))
    })
  } catch (error) {
    console.error('Error checking status:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

