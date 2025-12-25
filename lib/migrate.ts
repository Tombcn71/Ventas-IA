import { neon } from '@neondatabase/serverless'

// For local development, try to load .env files
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config({ path: '.env.local' })
  } catch {}
  try {
    require('dotenv').config({ path: '.env' })
  } catch {}
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please set it in .env.local or environment variables')
}

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('🚀 Running database migrations...')

  try {
    // Create Prospects table
    await sql`
      CREATE TABLE IF NOT EXISTS "Prospect" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "postalCode" TEXT,
        "latitude" REAL NOT NULL,
        "longitude" REAL NOT NULL,
        "phoneNumber" TEXT,
        "website" TEXT,
        "email" TEXT,
        "businessType" TEXT NOT NULL,
        "cuisine" TEXT,
        "priceRange" TEXT,
        "rating" REAL,
        "reviewCount" INTEGER,
        "missingProducts" JSONB DEFAULT '[]'::jsonb,
        "currentProducts" JSONB DEFAULT '[]'::jsonb,
        "competitors" JSONB DEFAULT '[]'::jsonb,
        "leadScore" INTEGER DEFAULT 0,
        "priority" TEXT DEFAULT 'medium',
        "status" TEXT DEFAULT 'new',
        "assignedTo" TEXT,
        "lastContactDate" TIMESTAMP,
        "nextFollowUp" TIMESTAMP,
        "notes" TEXT,
        "source" TEXT NOT NULL,
        "sourceUrl" TEXT,
        "lastScraped" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Visits table
    await sql`
      CREATE TABLE IF NOT EXISTS "Visit" (
        "id" TEXT PRIMARY KEY,
        "prospectId" TEXT NOT NULL,
        "visitDate" TIMESTAMP NOT NULL,
        "duration" INTEGER,
        "outcome" TEXT NOT NULL,
        "orderPlaced" BOOLEAN DEFAULT false,
        "orderValue" REAL,
        "notes" TEXT,
        "salesPerson" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE
      )
    `

    // Create Routes table
    await sql`
      CREATE TABLE IF NOT EXISTS "Route" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "salesPerson" TEXT NOT NULL,
        "plannedDate" TIMESTAMP NOT NULL,
        "startLocation" TEXT,
        "startLat" REAL,
        "startLng" REAL,
        "status" TEXT DEFAULT 'planned',
        "totalDistance" REAL,
        "estimatedDuration" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create RouteProspect junction table
    await sql`
      CREATE TABLE IF NOT EXISTS "RouteProspect" (
        "id" TEXT PRIMARY KEY,
        "routeId" TEXT NOT NULL,
        "prospectId" TEXT NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "visited" BOOLEAN DEFAULT false,
        "visitTime" TIMESTAMP,
        FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE,
        FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE
      )
    `

    // Create Activities table
    await sql`
      CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT PRIMARY KEY,
        "prospectId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "salesPerson" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE
      )
    `

    // Create ScrapingJob table
    await sql`
      CREATE TABLE IF NOT EXISTS "ScrapingJob" (
        "id" TEXT PRIMARY KEY,
        "source" TEXT NOT NULL,
        "status" TEXT DEFAULT 'pending',
        "city" TEXT,
        "cuisine" TEXT,
        "prospectsFound" INTEGER DEFAULT 0,
        "errors" JSONB,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Product table
    await sql`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "brand" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "keywords" JSONB DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "idx_prospect_city" ON "Prospect"("city")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_prospect_status" ON "Prospect"("status")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_prospect_priority" ON "Prospect"("priority")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_prospect_leadScore" ON "Prospect"("leadScore")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_visit_prospectId" ON "Visit"("prospectId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_routeProspect_routeId" ON "RouteProspect"("routeId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_activity_prospectId" ON "Activity"("prospectId")`

    console.log('✅ Database migrations completed!')
  } catch (error) {
    console.error('❌ Migration error:', error)
    throw error
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })



