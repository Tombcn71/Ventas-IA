import { sql, stringifyJson } from './db'
import { v4 as uuidv4 } from 'uuid'

/**
 * Seed database with Brand Intelligence demo data
 */

async function seed() {
  console.log('🌱 Seeding Brand Intelligence data...')

  try {
    // 1. Create demo brands
    const heinekenId = uuidv4()
    const cocaColaId = uuidv4()
    
    await sql`
      INSERT INTO brands (id, name, company, industry, logo_url)
      VALUES 
        (${heinekenId}, 'Heineken', 'Heineken España', 'beverages', 'https://logo.clearbit.com/heineken.com'),
        (${cocaColaId}, 'Coca-Cola', 'Coca-Cola European Partners', 'beverages', 'https://logo.clearbit.com/coca-cola.com')
      ON CONFLICT (id) DO NOTHING
    `
    console.log('✅ Created demo brands')

    // 2. Create brand products
    const heinekenLagerId = uuidv4()
    const heineken0Id = uuidv4()
    const cokeClassicId = uuidv4()
    const cokeZeroId = uuidv4()

    await sql`
      INSERT INTO brand_products (id, brand_id, product_name, category, keywords)
      VALUES 
        (${heinekenLagerId}, ${heinekenId}, 'Heineken Lager', 'Beer', ${stringifyJson(['heineken', 'heineken lager', 'heineken beer'])}),
        (${heineken0Id}, ${heinekenId}, 'Heineken 0.0', 'Non-Alcoholic Beer', ${stringifyJson(['heineken 0.0', 'heineken zero', 'heineken sin alcohol'])}),
        (${cokeClassicId}, ${cocaColaId}, 'Coca-Cola Classic', 'Soft Drink', ${stringifyJson(['coca-cola', 'coke', 'coca cola'])}),
        (${cokeZeroId}, ${cocaColaId}, 'Coca-Cola Zero', 'Soft Drink', ${stringifyJson(['coca-cola zero', 'coke zero', 'coca cola zero'])})
      ON CONFLICT (id) DO NOTHING
    `
    console.log('✅ Created brand products')

    // 3. Create sales territories
    const bcnTerritoryId = uuidv4()
    const madridTerritoryId = uuidv4()

    await sql`
      INSERT INTO sales_territories (id, brand_id, name, cities, sales_person_name, sales_person_email)
      VALUES 
        (${bcnTerritoryId}, ${heinekenId}, 'Barcelona Centro', ${stringifyJson(['Barcelona'])}, 'Carlos García', 'carlos.garcia@heineken.com'),
        (${madridTerritoryId}, ${heinekenId}, 'Madrid Norte', ${stringifyJson(['Madrid'])}, 'Ana Martínez', 'ana.martinez@heineken.com')
      ON CONFLICT (id) DO NOTHING
    `
    console.log('✅ Created sales territories')

    // 4. Update existing venues with additional data
    const venues = await sql`
      SELECT id, city FROM venues LIMIT 20
    `

    for (const venue of venues) {
      const venueTypes = ['restaurant', 'bar', 'cafe', 'pub']
      const cuisineTypes = ['spanish', 'mediterranean', 'tapas', 'italian', 'japanese']
      const rating = 3.5 + Math.random() * 1.5 // 3.5-5.0
      const priceLevel = Math.floor(Math.random() * 4) + 1 // 1-4
      const visitors = Math.floor(Math.random() * 2000) + 500 // 500-2500
      
      await sql`
        UPDATE venues 
        SET 
          venue_type = ${venueTypes[Math.floor(Math.random() * venueTypes.length)]},
          cuisine_type = ${stringifyJson([cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)]])},
          rating = ${rating},
          price_level = ${priceLevel},
          estimated_weekly_visitors = ${visitors},
          platforms = ${stringifyJson({ glovo: Math.random() > 0.3, ubereats: Math.random() > 0.5, justeat: Math.random() > 0.6 })},
          last_scraped_at = NOW()
        WHERE id = ${venue.id}
      `
    }
    console.log('✅ Updated venues with additional data')

    // 5. Create product availability data
    for (const venue of venues.slice(0, 15)) {
      // Heineken is available in 60% of venues
      if (Math.random() > 0.4) {
        await sql`
          INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, source, confidence, price)
          VALUES (${uuidv4()}, ${venue.id}, ${heinekenLagerId}, true, 'glovo', 0.95, ${2.5 + Math.random() * 1.5})
          ON CONFLICT (venue_id, brand_product_id, detected_at) DO NOTHING
        `
      } else {
        // Not available = opportunity!
        await sql`
          INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, source, confidence)
          VALUES (${uuidv4()}, ${venue.id}, ${heinekenLagerId}, false, 'glovo', 0.90)
          ON CONFLICT (venue_id, brand_product_id, detected_at) DO NOTHING
        `
      }

      // Coca-Cola is available in 80% of venues
      if (Math.random() > 0.2) {
        await sql`
          INSERT INTO product_availability (id, venue_id, brand_product_id, is_available, source, confidence, price)
          VALUES (${uuidv4()}, ${venue.id}, ${cokeClassicId}, true, 'glovo', 0.98, ${1.5 + Math.random()})
          ON CONFLICT (venue_id, brand_product_id, detected_at) DO NOTHING
        `
      }
    }
    console.log('✅ Created product availability data')

    // 6. Create competitor presence data
    const competitors = ['Estrella Damm', 'Mahou', 'San Miguel', 'Cruzcampo']
    
    for (const venue of venues.slice(0, 15)) {
      const competitorProducts = []
      const numCompetitors = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < numCompetitors; i++) {
        competitorProducts.push({
          name: competitors[Math.floor(Math.random() * competitors.length)],
          category: 'Beer',
          price: 2.0 + Math.random() * 2.0
        })
      }

      await sql`
        INSERT INTO competitor_presence (id, venue_id, brand_id, competitor_products)
        VALUES (${uuidv4()}, ${venue.id}, ${heinekenId}, ${stringifyJson(competitorProducts)})
        ON CONFLICT DO NOTHING
      `
    }
    console.log('✅ Created competitor presence data')

    console.log('✨ Seeding completed successfully!')
    
    // Print summary
    const venueCount = await sql`SELECT COUNT(*) as count FROM venues`
    const brandCount = await sql`SELECT COUNT(*) as count FROM brands`
    const productCount = await sql`SELECT COUNT(*) as count FROM brand_products`
    const availabilityCount = await sql`SELECT COUNT(*) as count FROM product_availability`
    
    console.log('\n📊 Database Summary:')
    console.log(`   Brands: ${brandCount[0].count}`)
    console.log(`   Products: ${productCount[0].count}`)
    console.log(`   Venues: ${venueCount[0].count}`)
    console.log(`   Availability Records: ${availabilityCount[0].count}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run seeding
seed()
  .then(() => {
    console.log('🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })


