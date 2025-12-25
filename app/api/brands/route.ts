import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get unique brands from brand_products
    const brands = await sql`
      SELECT DISTINCT 
        brand_id as id,
        product_name as name,
        category
      FROM brand_products
      WHERE active = true
      ORDER BY product_name
    `

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}


