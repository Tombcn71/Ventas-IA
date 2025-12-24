import { NextRequest, NextResponse } from 'next/server'
import { sql, parseJson } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const prospectId = searchParams.get('prospectId')
    const salesPerson = searchParams.get('salesPerson')

    let query = sql`SELECT v.*, p.* FROM "Visit" v INNER JOIN "Prospect" p ON v."prospectId" = p.id WHERE 1=1`

    if (prospectId) {
      query = sql`${query} AND v."prospectId" = ${prospectId}`
    }
    if (salesPerson) {
      query = sql`${query} AND v."salesPerson" = ${salesPerson}`
    }

    query = sql`${query} ORDER BY v."visitDate" DESC`

    const visits = await query

    return NextResponse.json(visits.map((visit: any) => ({
      ...visit,
      prospect: {
        ...visit,
        missingProducts: parseJson(visit.missingProducts),
        currentProducts: parseJson(visit.currentProducts),
        competitors: parseJson(visit.competitors),
      },
    })))
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json({ error: 'Error fetching visits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const visitId = uuidv4()
    await sql`
      INSERT INTO "Visit" (
        id, "prospectId", "visitDate", duration, outcome, "orderPlaced", "orderValue", notes, "salesPerson"
      ) VALUES (
        ${visitId}, ${data.prospectId}, ${new Date(data.visitDate)}, 
        ${data.duration || null}, ${data.outcome}, ${data.orderPlaced || false},
        ${data.orderValue || null}, ${data.notes || null}, ${data.salesPerson}
      )
    `

    // Update prospect's last contact date
    await sql`
      UPDATE "Prospect"
      SET "lastContactDate" = ${new Date(data.visitDate)},
          status = ${data.outcome === 'successful' ? 'customer' : 'contacted'},
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${data.prospectId}
    `

    // Create activity
    const activityId = uuidv4()
    await sql`
      INSERT INTO "Activity" (id, "prospectId", type, description, "salesPerson")
      VALUES (
        ${activityId}, ${data.prospectId}, 'visit',
        ${`Visit: ${data.outcome}${data.orderPlaced ? ' - Order placed' : ''}`},
        ${data.salesPerson}
      )
    `

    const visit = await sql`SELECT * FROM "Visit" WHERE id = ${visitId}`

    return NextResponse.json(visit[0], { status: 201 })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json({ error: 'Error creating visit' }, { status: 500 })
  }
}
