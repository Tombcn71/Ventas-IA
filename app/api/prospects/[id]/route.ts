import { NextRequest, NextResponse } from 'next/server'
import { sql, parseJson, stringifyJson } from '@/lib/db'
import { calculateLeadScore } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await sql`SELECT * FROM "Prospect" WHERE id = ${id}`

    if (!prospect || prospect.length === 0) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    const [visits, activities, routes] = await Promise.all([
      sql`SELECT * FROM "Visit" WHERE "prospectId" = ${id} ORDER BY "visitDate" DESC`,
      sql`SELECT * FROM "Activity" WHERE "prospectId" = ${id} ORDER BY "createdAt" DESC`,
      sql`
        SELECT r.* FROM "Route" r
        INNER JOIN "RouteProspect" rp ON r.id = rp."routeId"
        WHERE rp."prospectId" = ${id}
      `,
    ])

    return NextResponse.json({
      ...prospect[0],
      missingProducts: parseJson(prospect[0].missingProducts),
      currentProducts: parseJson(prospect[0].currentProducts),
      competitors: parseJson(prospect[0].competitors),
      visits: visits || [],
      activities: activities || [],
      routes: routes || [],
    })
  } catch (error) {
    console.error('Error fetching prospect:', error)
    return NextResponse.json({ error: 'Error fetching prospect' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Get current prospect
    const current = await sql`SELECT * FROM "Prospect" WHERE id = ${id}`
    if (!current || current.length === 0) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    const prospect = current[0]

    // Recalculate lead score if relevant fields changed
    let leadScore = data.leadScore
    if (
      data.rating !== undefined ||
      data.reviewCount !== undefined ||
      data.missingProducts !== undefined ||
      data.lastContactDate !== undefined
    ) {
      leadScore = calculateLeadScore({
        rating: data.rating ?? prospect.rating,
        reviewCount: data.reviewCount ?? prospect.reviewCount,
        missingProducts: data.missingProducts ?? parseJson(prospect.missingProducts),
        lastContactDate: data.lastContactDate ?? prospect.lastContactDate,
      })
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push(`name = $${values.length + 1}`)
      values.push(data.name)
    }
    if (data.status !== undefined) {
      updates.push(`status = $${values.length + 1}`)
      values.push(data.status)
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${values.length + 1}`)
      values.push(data.priority)
    }
    if (data.assignedTo !== undefined) {
      updates.push(`"assignedTo" = $${values.length + 1}`)
      values.push(data.assignedTo)
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${values.length + 1}`)
      values.push(data.notes)
    }
    if (data.missingProducts !== undefined) {
      updates.push(`"missingProducts" = $${values.length + 1}`)
      values.push(stringifyJson(data.missingProducts))
    }
    if (data.currentProducts !== undefined) {
      updates.push(`"currentProducts" = $${values.length + 1}`)
      values.push(stringifyJson(data.currentProducts))
    }
    if (leadScore !== undefined) {
      updates.push(`"leadScore" = $${values.length + 1}`)
      values.push(leadScore)
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    if (updates.length > 1) {
      await sql.unsafe(
        `UPDATE "Prospect" SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      )
    }

    const updated = await sql`SELECT * FROM "Prospect" WHERE id = ${id}`

    return NextResponse.json({
      ...updated[0],
      missingProducts: parseJson(updated[0].missingProducts),
      currentProducts: parseJson(updated[0].currentProducts),
      competitors: parseJson(updated[0].competitors),
    })
  } catch (error) {
    console.error('Error updating prospect:', error)
    return NextResponse.json({ error: 'Error updating prospect' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM "Prospect" WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prospect:', error)
    return NextResponse.json({ error: 'Error deleting prospect' }, { status: 500 })
  }
}
