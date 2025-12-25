/**
 * Seed Barcelona venues with real Google Places + OCR data
 */

import { sql, stringifyJson } from './db'
import { v4 as uuidv4 } from 'uuid'
import { 
  searchVenuesBarcelona, 
  processVenueMenu 
} from './scrapers/google-places-menus'

// Spanish beer brands
const BEER_BRANDS = [
  { id: uuidv4(), name: 'Heineken', category: 'Beer', keywords: ['heineken'] },
  { id: uuidv4(), name: 'Mahou', category: 'Beer', keywords: ['mahou'] },
  { id: uuidv4(), name: 'Estrella Damm', category: 'Beer', keywords: ['estrella', 'estrella damm'] },
  { id: uuidv4(), name: 'San Miguel', category: 'Beer', keywords: ['san miguel'] },
  { id: uuidv4(), name: 'Cruzcampo', category: 'Beer', keywords: ['cruzcampo'] },
  { id: uuidv4(), name: 'Alhambra', category: 'Beer', keywords: ['alhambra'] },
]

// Soft drinks
const SOFT_DRINK_BRANDS = [
  { id: uuidv4(), name: 'Coca-Cola', category: 'Soft Drink', keywords: ['coca-cola', 'coke', 'coca cola'] },
  { id: uuidv4(), name: 'Pepsi', category: 'Soft Drink', keywords: ['pepsi'] },
  { id: uuidv4(), name: 'Fanta', category: 'Soft Drink', keywords: ['fanta'] },
  { id: uuidv4(), name: 'Sprite', category: 'Soft Drink', keywords: ['sprite'] },
]

const ALL_BRANDS = [...BEER_BRANDS, ...SOFT_DRINK_BRANDS]

async function seed() {
  console.log('🌱 Starting Barcelona seeding with real data...\n')

  try {
    // Step 1: Create brands
    console.log('📦 Creating brands...')
    for (const brand of ALL_BRANDS) {
      await sql`
        INSERT INTO brand_products (id, brand_id, product_name, category, keywords, active)
        VALUES (
          ${brand.id},
          ${brand.id},
          ${brand.name},
          ${brand.category},
          ${stringifyJson(brand.keywords)},
          true
        )
        ON CONFLICT (id) DO NOTHING
      `
    }
    console.log(`✅ Created ${ALL_BRANDS.length} brands\n`)

    // Step 2: Search Barcelona venues
    console.log('🔍 Searching Barcelona venues via Google Places...')
    const venues = await searchVenuesBarcelona(50) // Start with 50 for MVP
    console.log(`✅ Found ${venues.length} venues\n`)

    // Step 3: Process each venue
    console.log('🏪 Processing venues and detecting products...')
    let processedCount = 0
    let withMenuData = 0

    for (const venue of venues) {
      try {
        console.log(`  Processing: ${venue.name}`)
        
        // Insert venue
        const venueId = uuidv4()
        await sql`
          INSERT INTO venues (
            id, name, address, city, 
            latitude, longitude, venue_type,
            rating, price_level, platforms,
            phone, status, created_at
          )
          VALUES (
            ${venueId},
            ${venue.name},
            ${venue.address},
            ${venue.city},
            ${venue.latitude},
            ${venue.longitude},
            ${venue.venueType},
            ${venue.rating || null},
            ${venue.priceLevel || null},
            ${stringifyJson({ google: true })},
            ${venue.phoneNumber || null},
            'new',
            NOW()
          )
          ON CONFLICT (id) DO NOTHING
        `

        // Process menu photos if available
        if (venue.photoReferences.length > 0) {
          console.log(`    📸 Found ${venue.photoReferences.length} photos, running OCR...`)
          
          const detectedBrands = await processVenueMenu(venue)
          const brandNames = Object.keys(detectedBrands).filter(k => detectedBrands[k])
          
          if (brandNames.length > 0) {
            console.log(`    ✅ Detected: ${brandNames.join(', ')}`)
            withMenuData++
            
            // Save product availability
            for (const brandKey of brandNames) {
              // Find brand product ID
              const brandProduct = ALL_BRANDS.find(b => 
                b.keywords.some(k => k.toLowerCase().includes(brandKey.toLowerCase()))
              )
              
              if (brandProduct) {
                await sql`
                  INSERT INTO product_availability (
                    id, venue_id, brand_product_id, 
                    is_available, detected_at, source, confidence
                  )
                  VALUES (
                    ${uuidv4()},
                    ${venueId},
                    ${brandProduct.id},
                    true,
                    NOW(),
                    'google_ocr',
                    0.85
                  )
                  ON CONFLICT DO NOTHING
                `
              }
            }
          } else {
            console.log(`    ⚠️  No brands detected in photos`)
          }
        } else {
          console.log(`    ℹ️  No photos available`)
        }

        processedCount++
        
      } catch (error) {
        console.error(`  ❌ Error processing ${venue.name}:`, error)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Total venues: ${venues.length}`)
    console.log(`   Successfully processed: ${processedCount}`)
    console.log(`   With menu data: ${withMenuData}`)
    console.log(`   Coverage: ${Math.round((withMenuData / processedCount) * 100)}%`)
    
    console.log('\n✨ Barcelona seeding completed!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run seeding
seed()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })


