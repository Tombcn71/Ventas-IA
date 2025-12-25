import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()
const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('🚀 Quick seed...')

  // Brands
  const heineken = uuidv4()
  const mahou = uuidv4()
  const cocacola = uuidv4()
  
  await sql`INSERT INTO brands (id, name, company) VALUES (${heineken}, 'Heineken', 'Heineken NV'), (${mahou}, 'Mahou', 'Mahou San Miguel'), (${cocacola}, 'Coca-Cola', 'The Coca-Cola Company') ON CONFLICT DO NOTHING`
  
  await sql`INSERT INTO brand_products (id, brand_id, product_name) VALUES (${uuidv4()}, ${heineken}, 'Heineken'), (${uuidv4()}, ${mahou}, 'Mahou'), (${uuidv4()}, ${cocacola}, 'Coca-Cola') ON CONFLICT DO NOTHING`

  // Venues
  const venues = [
    { name: 'Bar Marsella', lat: 41.3796, lng: 2.1737 },
    { name: 'El Xampanyet', lat: 41.3859, lng: 2.1820 },
    { name: 'Can Paixano', lat: 41.3809, lng: 2.1863 },
    { name: 'Boca Grande', lat: 41.3879, lng: 2.1699 },
    { name: 'Milk Bar', lat: 41.3838, lng: 2.1766 },
  ]

  for (const v of venues) {
    const id = uuidv4()
    await sql`INSERT INTO venues (id, name, address, city, latitude, longitude, venue_type, rating, price_level, status) 
      VALUES (${id}, ${v.name}, 'Barcelona', 'Barcelona', ${v.lat}, ${v.lng}, 'bar', ${3 + Math.random() * 2}, ${Math.floor(Math.random() * 3) + 1}, 'new') 
      ON CONFLICT DO NOTHING`
    
    await sql`INSERT INTO product_availability (id, venue_id, brand_product_id, is_available) 
      VALUES (${uuidv4()}, ${id}, (SELECT id FROM brand_products ORDER BY RANDOM() LIMIT 1), ${Math.random() > 0.5}) 
      ON CONFLICT DO NOTHING`
  }

  console.log('✅ Done!')
}

seed().catch(console.error)

