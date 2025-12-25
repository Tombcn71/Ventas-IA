import { NextResponse } from 'next/server'
import { sql, stringifyJson } from '@/lib/db'

/**
 * PATCH /api/brands/manage/:id
 * Update a brand/product
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const params = await context.params
    const { id } = params
    const body = await request.json()

    const updates: string[] = []
    const values: any[] = []

    if (body.name !== undefined) {
      updates.push('product_name = $' + (values.length + 1))
      values.push(body.name)
    }

    if (body.category !== undefined) {
      updates.push('category = $' + (values.length + 1))
      values.push(body.category)
    }

    if (body.keywords !== undefined) {
      updates.push('keywords = $' + (values.length + 1))
      values.push(stringifyJson(body.keywords))
    }

    if (body.active !== undefined) {
      updates.push('active = $' + (values.length + 1))
      values.push(body.active)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    updates.push('updated_at = NOW()')

    // Build and execute update query
    const query = `
      UPDATE brand_products
      SET ${updates.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING *
    `
    values.push(id)

    const result = await sql.unsafe(query, values)

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/brands/manage/:id
 * Delete a brand/product
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const params = await context.params
    const { id } = params

    // Delete related product_availability records first
    await sql`
      DELETE FROM product_availability
      WHERE brand_product_id = ${id}
    `

    // Delete the brand product
    const result = await sql`
      DELETE FROM brand_products
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}


