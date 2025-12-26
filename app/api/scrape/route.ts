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
    
    // Get active brands to detect
    const brandsData = await sql`
      SELECT DISTINCT b.id, b.name 
      FROM brands b
      INNER JOIN brand_products bp ON b.id = bp.brand_id
      WHERE bp.active = true
    `
    const brandNames = brandsData.map((b: any) => b.name.toLowerCase())

    for (const place of places) {
      try {
        const venueId = uuidv4()
        
        // Check if venue already exists
        const existing = await sql`
          SELECT id FROM venues WHERE name = ${place.displayName?.text || place.displayName} AND city = ${city} LIMIT 1
        `
        
        if (existing.length > 0) {
          continue
        }

        // AI Scoring (0-100)
        let aiScore = 0
        if (place.rating) aiScore += (place.rating / 5) * 40
        if (place.userRatingCount) aiScore += Math.min((place.userRatingCount / 500) * 30, 30)
        const priceMap: Record<string, number> = { 
          'PRICE_LEVEL_INEXPENSIVE': 10, 
          'PRICE_LEVEL_MODERATE': 20, 
          'PRICE_LEVEL_EXPENSIVE': 30 
        }
        aiScore += priceMap[place.priceLevel] || 15
        
        // Text mining in reviews - detect ALL products/keywords
        const detectedProducts = new Set<string>()
        const allReviewsText = place.reviews?.map((r: any) => 
          r.text?.text || r.originalText?.text || ''
        ).join(' ').toLowerCase() || ''
        
        // Check each brand and its keywords
        for (const brandData of brandsData) {
          const brand = await sql`SELECT keywords FROM brand_products WHERE brand_id = ${brandData.id} LIMIT 1`
          const keywords = brand[0]?.keywords || []
          const keywordList = typeof keywords === 'string' ? JSON.parse(keywords) : keywords
          
          // Check if brand name or any keyword appears in reviews
          const brandMatch = allReviewsText.includes(brandData.name.toLowerCase()) ||
            keywordList.some((kw: string) => allReviewsText.includes(kw.toLowerCase()))
          
          if (brandMatch) {
            detectedProducts.add(brandData.name)
          }
        }
        
        // Calculate AI Match Score (0-100)
        let matchScore = 0
        
        // Product Match (50pt)
        if (detectedProducts.size > 0) matchScore += 50
        
        // Segment Match (30pt) - bar matches beer, restaurant matches food
        const types = place.types || []
        if (types.includes('bar') || types.includes('night_club')) matchScore += 30
        
        // Populariteit (20pt)
        if (place.rating >= 4.0 && place.userRatingCount >= 50) matchScore += 20
        
        // Save venue with detected products
        await sql`
          INSERT INTO venues (
            id, name, address, city, 
            latitude, longitude, venue_type, "businessType", source,
            rating, price_level, "phoneNumber", website, 
            platforms, "currentProducts", status, "createdAt", "leadScore"
          )
          VALUES (
            ${venueId},
            ${place.displayName?.text || place.displayName},
            ${place.formattedAddress},
            ${city},
            ${place.location?.latitude || 0},
            ${place.location?.longitude || 0},
            types.includes('bar') ? 'bar' : 'restaurant',
            types.includes('bar') ? 'bar' : 'restaurant',
            'google_places',
            ${place.rating || null},
            ${place.priceLevel ? 2 : null},
            ${place.internationalPhoneNumber || null},
            ${place.websiteUri || null},
            ${JSON.stringify({ openingHours: place.regularOpeningHours })},
            ${JSON.stringify(Array.from(detectedProducts))},
            'new',
            NOW(),
            ${Math.round(matchScore)}
          )
        `
        
        // Save to product_availability for filtering
        for (const productName of detectedProducts) {
          const brand = brandsData.find((b: any) => b.name === productName)
          if (brand) {
            const products = await sql`SELECT id FROM brand_products WHERE brand_id = ${brand.id} LIMIT 1`
            if (products.length > 0) {
              await sql`
                INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, detected_at)
                VALUES (${uuidv4()}, ${venueId}, ${products[0].id}, true, NOW())
              `
            }
          }
        }
        
        saved++
      } catch (err) {
        console.error('Error saving venue:', err)
      }
    }

    // Create a job to track progress
    const jobId = uuidv4()
    await sql`
      INSERT INTO "ScrapingJob" (id, source, status, city, "prospectsFound", "startedAt")
      VALUES (${jobId}, 'google_places', 'analyzing_menus', ${city}, ${saved}, NOW())
    `
    
    // Start menu analysis in background
    if (venueIds.length > 0) {
      Promise.resolve().then(() => analyzeVenueMenus(jobId, venueIds))
    }

    return NextResponse.json({ saved, analyzing: venueIds.length, jobId })
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

async function analyzeVenueMenus(jobId: string, venueIds: string[]) {
  const { analyzeMenuPhoto } = await import('@/lib/scrapers/gemini-menu-analyzer')
  
  console.log(`🤖 Starting menu analysis for ${venueIds.length} venues...`)
  
  // Get active brands
  const brandsData = await sql`
    SELECT DISTINCT b.id, b.name 
    FROM brands b
    INNER JOIN brand_products bp ON b.id = bp.brand_id
    WHERE bp.active = true
  `
  const brandNames = brandsData.map((b: any) => b.name)
  
  if (brandNames.length === 0) {
    await sql`UPDATE "ScrapingJob" SET status = 'completed', "completedAt" = NOW() WHERE id = ${jobId}`
    console.log('⚠️  No active brands configured')
    return
  }

  let analyzed = 0
  
  for (const venueId of venueIds) {
    try {
      const venue = await sql`SELECT platforms FROM venues WHERE id = ${venueId} LIMIT 1`
      const platforms = typeof venue[0].platforms === 'string' 
        ? JSON.parse(venue[0].platforms) 
        : venue[0].platforms || {}
      
      const photos = platforms.photos || []
      if (photos.length === 0) continue

      const detectedBrands = new Set<string>()
      
      // Analyze first 3 photos with Gemini
      for (const photoName of photos.slice(0, 3)) {
        try {
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          const result = await analyzeMenuPhoto(photoUrl, brandNames)
          result.brands.forEach(b => detectedBrands.add(b))
        } catch (err) {
          console.error('Photo analysis error:', err)
        }
      }

      // Save to product_availability
      for (const brandName of detectedBrands) {
        const brand = brandsData.find((b: any) => b.name === brandName)
        if (brand) {
          const brandProducts = await sql`SELECT id FROM brand_products WHERE brand_id = ${brand.id} LIMIT 1`
          if (brandProducts.length > 0) {
            await sql`
              INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, detected_at)
              VALUES (${uuidv4()}, ${venueId}, ${brandProducts[0].id}, true, NOW())
            `
          }
        }
      }

      analyzed++
      
      // Update job progress
      await sql`UPDATE "ScrapingJob" SET "prospectsFound" = ${analyzed} WHERE id = ${jobId}`
      
      console.log(`  ✅ ${analyzed}/${venueIds.length}: ${detectedBrands.size} brands found`)
    } catch (err) {
      console.error(`Error analyzing venue ${venueId}:`, err)
    }
  }
  
  // Mark job as completed
  await sql`UPDATE "ScrapingJob" SET status = 'completed', "completedAt" = NOW() WHERE id = ${jobId}`
  
  console.log('✨ Menu analysis completed')
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
