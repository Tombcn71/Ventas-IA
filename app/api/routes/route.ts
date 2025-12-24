import { NextRequest, NextResponse } from 'next/server'
import { sql, parseJson } from '@/lib/db'
import { calculateDistance } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesPerson = searchParams.get('salesPerson')
    const status = searchParams.get('status')

    let query = sql`SELECT * FROM "Route" WHERE 1=1`
    
    if (salesPerson) {
      query = sql`${query} AND "salesPerson" = ${salesPerson}`
    }
    if (status) {
      query = sql`${query} AND status = ${status}`
    }

    query = sql`${query} ORDER BY "plannedDate" DESC`

    const routes = await query

    // Get prospects for each route
    const routesWithProspects = await Promise.all(
      routes.map(async (route: any) => {
        const routeProspects = await sql`
          SELECT rp.*, p.* 
          FROM "RouteProspect" rp
          INNER JOIN "Prospect" p ON rp."prospectId" = p.id
          WHERE rp."routeId" = ${route.id}
          ORDER BY rp."orderIndex" ASC
        `

        return {
          ...route,
          prospects: routeProspects.map((rp: any) => ({
            id: rp.id,
            routeId: rp.routeId,
            prospectId: rp.prospectId,
            orderIndex: rp.orderIndex,
            visited: rp.visited,
            visitTime: rp.visitTime,
            prospect: {
              ...rp,
              missingProducts: parseJson(rp.missingProducts),
              currentProducts: parseJson(rp.currentProducts),
              competitors: parseJson(rp.competitors),
            },
          })),
        }
      })
    )

    return NextResponse.json(routesWithProspects)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Error fetching routes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, salesPerson, plannedDate, prospectIds, startLat, startLng } = data

    if (!prospectIds || prospectIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one prospect is required' },
        { status: 400 }
      )
    }

    // Fetch prospects
    const prospectIdsStr = prospectIds.map((id: string) => `'${id}'`).join(',')
    const prospects = await sql.unsafe(`
      SELECT * FROM "Prospect" 
      WHERE id IN (${prospectIdsStr})
    `)

    // Optimize route order
    const optimizedOrder = optimizeRouteOrder(prospects, startLat, startLng)

    // Calculate total distance
    let totalDistance = 0
    for (let i = 0; i < optimizedOrder.length - 1; i++) {
      const from = optimizedOrder[i]
      const to = optimizedOrder[i + 1]
      totalDistance += calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude)
    }

    // Estimate duration
    const estimatedDuration = optimizedOrder.length * 10 + Math.round(totalDistance * 3)

    // Create route
    const routeId = uuidv4()
    await sql`
      INSERT INTO "Route" (
        id, name, "salesPerson", "plannedDate", "startLocation", "startLat", "startLng",
        status, "totalDistance", "estimatedDuration"
      ) VALUES (
        ${routeId}, ${name}, ${salesPerson}, ${new Date(plannedDate)}, 
        ${startLat && startLng ? `Start: ${startLat}, ${startLng}` : null},
        ${startLat || null}, ${startLng || null}, 'planned', ${totalDistance}, ${estimatedDuration}
      )
    `

    // Create route prospects
    for (let i = 0; i < optimizedOrder.length; i++) {
      await sql`
        INSERT INTO "RouteProspect" (id, "routeId", "prospectId", "orderIndex")
        VALUES (${uuidv4()}, ${routeId}, ${optimizedOrder[i].id}, ${i})
      `
    }

    // Fetch complete route with prospects
    const route = await sql`SELECT * FROM "Route" WHERE id = ${routeId}`
    const routeProspects = await sql`
      SELECT rp.*, p.* 
      FROM "RouteProspect" rp
      INNER JOIN "Prospect" p ON rp."prospectId" = p.id
      WHERE rp."routeId" = ${routeId}
      ORDER BY rp."orderIndex" ASC
    `

    return NextResponse.json({
      ...route[0],
      prospects: routeProspects.map((rp: any) => ({
        id: rp.id,
        routeId: rp.routeId,
        prospectId: rp.prospectId,
        orderIndex: rp.orderIndex,
        visited: rp.visited,
        visitTime: rp.visitTime,
        prospect: {
          ...rp,
          missingProducts: parseJson(rp.missingProducts),
          currentProducts: parseJson(rp.currentProducts),
          competitors: parseJson(rp.competitors),
        },
      })),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json({ error: 'Error creating route' }, { status: 500 })
  }
}

function optimizeRouteOrder(
  prospects: any[],
  startLat?: number,
  startLng?: number
): any[] {
  if (prospects.length <= 1) return prospects

  const remaining = [...prospects]
  const ordered: any[] = []

  let currentLat = startLat || prospects[0].latitude
  let currentLng = startLng || prospects[0].longitude

  while (remaining.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        remaining[i].latitude,
        remaining[i].longitude
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0]
    ordered.push(nearest)
    currentLat = nearest.latitude
    currentLng = nearest.longitude
  }

  return ordered
}
