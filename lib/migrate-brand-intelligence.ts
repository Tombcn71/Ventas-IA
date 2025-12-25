import { sql } from './db'

/**
 * Brand Intelligence Migration
 * Adds support for multi-brand tracking, competitor analysis, and territory management
 */

async function migrate() {
  console.log('🚀 Starting Brand Intelligence migration...')

  try {
    // 1. Create Brands table
    await sql`
      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        logo_url TEXT,
        industry TEXT DEFAULT 'beverages',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Created brands table')

    // 2. Create Brand Products table
    await sql`
      CREATE TABLE IF NOT EXISTS brand_products (
        id TEXT PRIMARY KEY,
        brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        keywords JSONB DEFAULT '[]',
        sku TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Created brand_products table')

    // 3. Rename prospects to venues (if exists)
    await sql`
      ALTER TABLE IF EXISTS prospects RENAME TO venues
    `
    console.log('✅ Renamed prospects to venues')

    // 4. Add new columns to venues
    await sql`
      ALTER TABLE venues 
      ADD COLUMN IF NOT EXISTS venue_type TEXT DEFAULT 'restaurant',
      ADD COLUMN IF NOT EXISTS cuisine_type JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS price_level INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS estimated_weekly_visitors INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP
    `
    console.log('✅ Added new columns to venues')

    // 5. Create Product Availability table
    await sql`
      CREATE TABLE IF NOT EXISTS product_availability (
        id TEXT PRIMARY KEY,
        venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
        brand_product_id TEXT REFERENCES brand_products(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL,
        detected_at TIMESTAMP DEFAULT NOW(),
        source TEXT,
        confidence DECIMAL DEFAULT 1.0,
        price DECIMAL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(venue_id, brand_product_id, detected_at)
      )
    `
    console.log('✅ Created product_availability table')

    // 6. Create Competitor Presence table
    await sql`
      CREATE TABLE IF NOT EXISTS competitor_presence (
        id TEXT PRIMARY KEY,
        venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
        brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
        competitor_products JSONB DEFAULT '[]',
        detected_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Created competitor_presence table')

    // 7. Create Sales Territories table
    await sql`
      CREATE TABLE IF NOT EXISTS sales_territories (
        id TEXT PRIMARY KEY,
        brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        cities JSONB DEFAULT '[]',
        sales_person_name TEXT,
        sales_person_email TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Created sales_territories table')

    // 8. Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city)`
    await sql`CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_product_availability_venue ON product_availability(venue_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_product_availability_brand ON product_availability(brand_product_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_presence_venue ON competitor_presence(venue_id)`
    console.log('✅ Created performance indexes')

    // 9. Update routes table to reference venues
    await sql`
      ALTER TABLE routes
      ADD COLUMN IF NOT EXISTS territory_id TEXT REFERENCES sales_territories(id)
    `
    console.log('✅ Updated routes table')

    // 10. Update visits table
    await sql`
      ALTER TABLE visits
      ADD COLUMN IF NOT EXISTS outcome TEXT,
      ADD COLUMN IF NOT EXISTS products_pitched JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS products_sold JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS competitor_info JSONB DEFAULT '{}'
    `
    console.log('✅ Updated visits table')

    console.log('✨ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })


