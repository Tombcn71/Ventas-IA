import { NextRequest, NextResponse } from 'next/server'
import { sql, stringifyJson, parseJson } from '@/lib/db'
import { ScraperOrchestrator } from '@/lib/scrapers'
import { calculateLeadScore } from '@/lib/utils'
import { productDetector } from '@/lib/scrapers/product-detector'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { city, places } = await request.json()

    if (!city || !places) {
      return NextResponse.json({ error: 'City and places required' }, { status: 400 })
    }

    let saved = 0

    for (const place of places) {
      try {
        const venueId = uuidv4()
        // Check if venue already exists
        const existing = await sql`
          SELECT id FROM venues WHERE name = ${place.displayName?.text || place.displayName} AND city = ${city} LIMIT 1
        `
        
        if (existing.length > 0) {
          continue // Skip duplicates
        }

        // Get photo URLs if available
        const photos = place.photos?.slice(0, 5).map((p: any) => p.name) || []
        
        await sql`
          INSERT INTO venues (
            id, name, address, city, 
            latitude, longitude, venue_type, "businessType", source,
            rating, price_level, "phoneNumber", website, platforms, status, "createdAt"
          )
          VALUES (
            ${venueId},
            ${place.displayName?.text || place.displayName},
            ${place.formattedAddress},
            ${city},
            ${place.location?.latitude || 0},
            ${place.location?.longitude || 0},
            'restaurant',
            'restaurant',
            'google_places',
            ${place.rating || null},
            ${place.priceLevel ? 2 : null},
            ${place.internationalPhoneNumber || null},
            ${place.websiteUri || null},
            ${JSON.stringify({ photos })},
            'new',
            NOW()
          )
        `
        saved++
      } catch (err) {
        console.error('Error saving venue:', err)
      }
    }

    return NextResponse.json({ saved })
  } catch (error) {
    console.error('Error saving scrape:', error)
    return NextResponse.json({ error: 'Error saving' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (jobId) {
      const job = await sql`SELECT * FROM "ScrapingJob" WHERE id = ${jobId}`
      if (job.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }
      return NextResponse.json({
        ...job[0],
        errors: job[0].errors ? parseJson(job[0].errors) : null,
      })
    }

    const jobs = await sql`SELECT * FROM "ScrapingJob" ORDER BY "createdAt" DESC LIMIT 20`

    return NextResponse.json(jobs.map((job: any) => ({
      ...job,
      errors: job.errors ? parseJson(job.errors) : null,
    })))
  } catch (error) {
    console.error('Error fetching scraping jobs:', error)
    return NextResponse.json({ error: 'Error fetching jobs' }, { status: 500 })
  }
}

async function runScraping(
  jobId: string,
  config: { city: string; cuisine?: string; limit?: number }
) {
  try {
    const orchestrator = new ScraperOrchestrator()
    const results = await orchestrator.scrapeAllSources(config)

    let prospectsCreated = 0

    for (const restaurant of results) {
      try {
        // Detect missing products
        const { found, missing } = productDetector.detectProducts(restaurant.menuItems)
        const topOpportunities = productDetector.getTopOpportunities(
          missing,
          restaurant.businessType,
          restaurant.priceRange
        )

        const missingProducts = topOpportunities.map((p) => ({
          brand: p.brand,
          category: p.category,
          confidence: p.confidence,
        }))

        const leadScore = calculateLeadScore({
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          missingProducts,
          lastContactDate: null,
        })

        // Check if prospect already exists
        const existing = await sql`
          SELECT * FROM "Prospect" 
          WHERE name = ${restaurant.name} AND city = ${restaurant.city}
          LIMIT 1
        `

        if (existing && existing.length > 0) {
          // Update existing
          await sql`
            UPDATE "Prospect"
            SET rating = ${restaurant.rating || null},
                "reviewCount" = ${restaurant.reviewCount || null},
                "phoneNumber" = ${restaurant.phoneNumber || null},
                website = ${restaurant.website || null},
                "currentProducts" = ${stringifyJson(found.map((p) => p.brand))},
                "missingProducts" = ${stringifyJson(missingProducts)},
                "leadScore" = ${leadScore},
                "lastScraped" = CURRENT_TIMESTAMP,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = ${existing[0].id}
          `
        } else {
          // Create new
          const prospectId = uuidv4()
          await sql`
            INSERT INTO "Prospect" (
              id, name, address, city, "postalCode", latitude, longitude,
              "phoneNumber", website, email, "businessType", cuisine, "priceRange",
              rating, "reviewCount", "currentProducts", "missingProducts", competitors,
              "leadScore", source, "sourceUrl", "lastScraped"
            ) VALUES (
              ${prospectId}, ${restaurant.name}, ${restaurant.address}, ${restaurant.city},
              ${restaurant.postalCode || null}, ${restaurant.latitude}, ${restaurant.longitude},
              ${restaurant.phoneNumber || null}, ${restaurant.website || null},
              ${restaurant.email || null}, ${restaurant.businessType},
              ${restaurant.cuisine || null}, ${restaurant.priceRange || null},
              ${restaurant.rating || null}, ${restaurant.reviewCount || null},
              ${stringifyJson(found.map((p) => p.brand))},
              ${stringifyJson(missingProducts)},
              ${stringifyJson([])},
              ${leadScore}, ${restaurant.source}, ${restaurant.sourceUrl || null},
              CURRENT_TIMESTAMP
            )
          `
          prospectsCreated++
        }
      } catch (error) {
        console.error(`Error saving restaurant ${restaurant.name}:`, error)
      }
    }

    // Update job
    await sql`
      UPDATE "ScrapingJob"
      SET status = 'completed',
          "prospectsFound" = ${prospectsCreated},
          "completedAt" = CURRENT_TIMESTAMP
      WHERE id = ${jobId}
    `
  } catch (error) {
    console.error('Error in scraping job:', error)
    await sql`
      UPDATE "ScrapingJob"
      SET status = 'failed',
          errors = ${stringifyJson({ message: String(error) })},
          "completedAt" = CURRENT_TIMESTAMP
      WHERE id = ${jobId}
    `
  }
}
