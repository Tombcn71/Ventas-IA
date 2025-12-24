import { NextRequest, NextResponse } from 'next/server'
import { sql, parseJson } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesPerson = searchParams.get('salesPerson')

    const whereClause = salesPerson ? sql`WHERE "assignedTo" = ${salesPerson}` : sql``

    // Get overall stats
    const [
      totalProspects,
      highPriorityProspects,
      newProspects,
      contactedProspects,
      customers,
      totalVisits,
      successfulVisits,
      totalRevenue,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM "Prospect" ${whereClause}`.then((r: any) => Number(r[0]?.count) || 0),
      sql`SELECT COUNT(*) as count FROM "Prospect" ${whereClause} AND priority = 'high'`.then((r: any) => Number(r[0]?.count) || 0),
      sql`SELECT COUNT(*) as count FROM "Prospect" ${whereClause} AND status = 'new'`.then((r: any) => Number(r[0]?.count) || 0),
      sql`SELECT COUNT(*) as count FROM "Prospect" ${whereClause} AND status = 'contacted'`.then((r: any) => Number(r[0]?.count) || 0),
      sql`SELECT COUNT(*) as count FROM "Prospect" ${whereClause} AND status = 'customer'`.then((r: any) => Number(r[0]?.count) || 0),
      salesPerson
        ? sql`SELECT COUNT(*) as count FROM "Visit" WHERE "salesPerson" = ${salesPerson}`.then((r: any) => Number(r[0]?.count) || 0)
        : sql`SELECT COUNT(*) as count FROM "Visit"`.then((r: any) => Number(r[0]?.count) || 0),
      salesPerson
        ? sql`SELECT COUNT(*) as count FROM "Visit" WHERE "salesPerson" = ${salesPerson} AND outcome = 'successful'`.then((r: any) => Number(r[0]?.count) || 0)
        : sql`SELECT COUNT(*) as count FROM "Visit" WHERE outcome = 'successful'`.then((r: any) => Number(r[0]?.count) || 0),
      salesPerson
        ? sql`SELECT COALESCE(SUM("orderValue"), 0) as sum FROM "Visit" WHERE "salesPerson" = ${salesPerson}`.then((r: any) => Number(r[0]?.sum) || 0)
        : sql`SELECT COALESCE(SUM("orderValue"), 0) as sum FROM "Visit"`.then((r: any) => Number(r[0]?.sum) || 0),
    ])

    // Get top cities
    const topCitiesQuery = salesPerson
      ? sql`SELECT city, COUNT(*) as count FROM "Prospect" WHERE "assignedTo" = ${salesPerson} GROUP BY city ORDER BY count DESC LIMIT 5`
      : sql`SELECT city, COUNT(*) as count FROM "Prospect" GROUP BY city ORDER BY count DESC LIMIT 5`
    
    const topCities = await topCitiesQuery

    // Get recent activities
    const activitiesQuery = salesPerson
      ? sql`
          SELECT a.*, p.name as "prospectName", p.id as "prospectId"
          FROM "Activity" a
          INNER JOIN "Prospect" p ON a."prospectId" = p.id
          WHERE a."salesPerson" = ${salesPerson}
          ORDER BY a."createdAt" DESC
          LIMIT 10
        `
      : sql`
          SELECT a.*, p.name as "prospectName", p.id as "prospectId"
          FROM "Activity" a
          INNER JOIN "Prospect" p ON a."prospectId" = p.id
          ORDER BY a."createdAt" DESC
          LIMIT 10
        `
    
    const recentActivities = await activitiesQuery

    // Get conversion rate by city
    const cityStatsQuery = salesPerson
      ? sql`
          SELECT 
            city,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'customer' THEN 1 ELSE 0 END) as customers
          FROM "Prospect"
          WHERE "assignedTo" = ${salesPerson}
          GROUP BY city
          ORDER BY total DESC
          LIMIT 10
        `
      : sql`
          SELECT 
            city,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'customer' THEN 1 ELSE 0 END) as customers
          FROM "Prospect"
          GROUP BY city
          ORDER BY total DESC
          LIMIT 10
        `
    
    const cityStats = await cityStatsQuery

    return NextResponse.json({
      overview: {
        totalProspects: Number(totalProspects),
        highPriorityProspects: Number(highPriorityProspects),
        newProspects: Number(newProspects),
        contactedProspects: Number(contactedProspects),
        customers: Number(customers),
        totalVisits: Number(totalVisits),
        successfulVisits: Number(successfulVisits),
        conversionRate: Number(totalProspects) > 0 
          ? (Number(customers) / Number(totalProspects)) * 100 
          : 0,
        totalRevenue: Number(totalRevenue) || 0,
      },
      topCities: topCities.map((c: any) => ({
        city: c.city,
        count: Number(c.count),
      })),
      recentActivities: recentActivities.map((a: any) => ({
        ...a,
        prospect: {
          id: a.prospectId,
          name: a.prospectName,
        },
      })),
      cityStats,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}
