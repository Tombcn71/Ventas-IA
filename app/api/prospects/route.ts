import { NextRequest, NextResponse } from 'next/server'
import { sql, parseJson } from '@/lib/db'
import { calculateLeadScore } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const minScore = searchParams.get('minScore')

    // Build query dynamically
    let query = 'SELECT * FROM "Prospect"'
    const conditions: string[] = []
    const params: any[] = []

    if (city) {
      conditions.push(`city = $${params.length + 1}`)
      params.push(city)
    }
    if (status) {
      conditions.push(`status = $${params.length + 1}`)
      params.push(status)
    }
    if (priority) {
      conditions.push(`priority = $${params.length + 1}`)
      params.push(priority)
    }
    if (assignedTo) {
      conditions.push(`"assignedTo" = $${params.length + 1}`)
      params.push(assignedTo)
    }
    if (minScore) {
      conditions.push(`"leadScore" >= $${params.length + 1}`)
      params.push(parseInt(minScore))
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY "leadScore" DESC, "createdAt" DESC`

    // Execute query
    const prospects = params.length > 0
      ? await sql.unsafe(query, params)
      : await sql.unsafe(query)

    // Ensure prospects is an array
    if (!Array.isArray(prospects)) {
      console.error('Prospects is not an array:', prospects)
      return NextResponse.json([])
    }

    // Get visits and activities for each prospect
    const prospectsWithRelations = await Promise.all(
      prospects.map(async (prospect: any) => {
        try {
          const [visits, activities] = await Promise.all([
            sql.unsafe(
              'SELECT * FROM "Visit" WHERE "prospectId" = $1 ORDER BY "visitDate" DESC LIMIT 1',
              [prospect.id]
            ),
            sql.unsafe(
              'SELECT * FROM "Activity" WHERE "prospectId" = $1 ORDER BY "createdAt" DESC LIMIT 3',
              [prospect.id]
            ),
          ])

          return {
            ...prospect,
            missingProducts: parseJson(prospect.missingProducts),
            currentProducts: parseJson(prospect.currentProducts),
            competitors: parseJson(prospect.competitors),
            visits: Array.isArray(visits) ? visits : [],
            activities: Array.isArray(activities) ? activities : [],
          }
        } catch (error) {
          console.error(`Error fetching relations for prospect ${prospect.id}:`, error)
          return {
            ...prospect,
            missingProducts: parseJson(prospect.missingProducts),
            currentProducts: parseJson(prospect.currentProducts),
            competitors: parseJson(prospect.competitors),
            visits: [],
            activities: [],
          }
        }
      })
    )

    return NextResponse.json(prospectsWithRelations)
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json({ error: 'Error fetching prospects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Calculate lead score
    const leadScore = calculateLeadScore({
      rating: data.rating,
      reviewCount: data.reviewCount,
      missingProducts: data.missingProducts,
      lastContactDate: data.lastContactDate,
    })

    const id = uuidv4()
    const missingProducts = JSON.stringify(data.missingProducts || [])
    const currentProducts = JSON.stringify(data.currentProducts || [])
    const competitors = JSON.stringify(data.competitors || [])

    await sql.unsafe(
      `INSERT INTO "Prospect" (
        id, name, address, city, "postalCode", latitude, longitude,
        "phoneNumber", website, email, "businessType", cuisine, "priceRange",
        rating, "reviewCount", "missingProducts", "currentProducts", competitors,
        "leadScore", priority, status, "assignedTo", "lastContactDate", "nextFollowUp",
        notes, source, "sourceUrl"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )`,
      [
        id, data.name, data.address, data.city, data.postalCode || null,
        data.latitude, data.longitude, data.phoneNumber || null,
        data.website || null, data.email || null, data.businessType,
        data.cuisine || null, data.priceRange || null, data.rating || null,
        data.reviewCount || null, missingProducts, currentProducts, competitors,
        leadScore, data.priority || 'medium', data.status || 'new',
        data.assignedTo || null, data.lastContactDate ? new Date(data.lastContactDate) : null,
        data.nextFollowUp ? new Date(data.nextFollowUp) : null, data.notes || null,
        data.source, data.sourceUrl || null
      ]
    )

    const prospect = await sql.unsafe('SELECT * FROM "Prospect" WHERE id = $1', [id])

    if (!prospect || prospect.length === 0) {
      return NextResponse.json({ error: 'Prospect not found after creation' }, { status: 500 })
    }

    return NextResponse.json({
      ...prospect[0],
      missingProducts: parseJson(prospect[0].missingProducts),
      currentProducts: parseJson(prospect[0].currentProducts),
      competitors: parseJson(prospect[0].competitors),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating prospect:', error)
    return NextResponse.json({ error: 'Error creating prospect' }, { status: 500 })
  }
}
