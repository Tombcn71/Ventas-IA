import { NextResponse } from 'next/server'
import { sql, stringifyJson, parseJson } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET /api/brands/manage
 * Get all brands/products for management
 */
export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const brands = await sql`
      SELECT 
        id,
        brand_id,
        product_name as name,
        category,
        keywords,
        active
      FROM brand_products
      ORDER BY created_at DESC
    `

    return NextResponse.json(
      brands.map((b: any) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        keywords: parseJson(b.keywords),
        active: b.active,
      }))
    )
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brands/manage
 * Create a new brand/product
 */
export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, category, keywords } = body

    if (!name || !category || !keywords) {
      return NextResponse.json(
        { error: 'Name, category, and keywords are required' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const brandId = uuidv4()

    // First create brand
    await sql`
      INSERT INTO brands (id, name, company)
      VALUES (${brandId}, ${name}, ${name})
    `

    // Then create brand_product
    await sql`
      INSERT INTO brand_products (
        id,
        brand_id,
        product_name,
        category,
        keywords,
        active,
        created_at
      )
      VALUES (
        ${id},
        ${brandId},
        ${name},
        ${category},
        ${stringifyJson(keywords)},
        true,
        NOW()
      )
    `

    return NextResponse.json({
      id,
      name,
      category,
      keywords,
      active: true,
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}


