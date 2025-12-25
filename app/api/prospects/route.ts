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

    // Query venues table
    let prospects
    
    if (city) {
      prospects = await sql`SELECT * FROM venues WHERE city = ${city} ORDER BY rating DESC, created_at DESC LIMIT 100`
    } else {
      prospects = await sql`SELECT * FROM venues ORDER BY rating DESC, created_at DESC LIMIT 100`
    }

    // Ensure prospects is an array
    if (!Array.isArray(prospects)) {
      console.error('Prospects is not an array:', prospects)
      return NextResponse.json([])
    }

    // Get visits and activities for each prospect
    const prospectsWithRelations = await Promise.all(
      prospects.map(async (prospect: any) => {
        try {
          return {
            id: prospect.id,
            name: prospect.name,
            address: prospect.address,
            city: prospect.city,
            latitude: prospect.latitude,
            longitude: prospect.longitude,
            phoneNumber: prospect.phone,
            website: prospect.website,
            businessType: prospect.venue_type,
            rating: prospect.rating,
            priceRange: '€'.repeat(prospect.price_level || 2),
            status: prospect.status || 'new',
            leadScore: Math.round((prospect.rating || 0) * 20),
            missingProducts: [],
            currentProducts: [],
            competitors: [],
            visits: [],
            activities: [],
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
    // Return empty array instead of error object
    return NextResponse.json([])
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

    await sql`
      INSERT INTO "Prospect" (
        id, name, address, city, "postalCode", latitude, longitude,
        "phoneNumber", website, email, "businessType", cuisine, "priceRange",
        rating, "reviewCount", "missingProducts", "currentProducts", competitors,
        "leadScore", priority, status, "assignedTo", "lastContactDate", "nextFollowUp",
        notes, source, "sourceUrl"
      ) VALUES (
        ${id}, ${data.name}, ${data.address}, ${data.city}, ${data.postalCode || null},
        ${data.latitude}, ${data.longitude}, ${data.phoneNumber || null},
        ${data.website || null}, ${data.email || null}, ${data.businessType},
        ${data.cuisine || null}, ${data.priceRange || null}, ${data.rating || null},
        ${data.reviewCount || null}, ${missingProducts}, ${currentProducts}, ${competitors},
        ${leadScore}, ${data.priority || 'medium'}, ${data.status || 'new'},
        ${data.assignedTo || null}, ${data.lastContactDate ? new Date(data.lastContactDate) : null},
        ${data.nextFollowUp ? new Date(data.nextFollowUp) : null}, ${data.notes || null},
        ${data.source}, ${data.sourceUrl || null}
      )
    `

    const prospect = await sql`SELECT * FROM "Prospect" WHERE id = ${id}`

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
