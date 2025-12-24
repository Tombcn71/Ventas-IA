import { sql, stringifyJson } from './db'
import { v4 as uuidv4 } from 'uuid'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Seed example products
    const products = [
      { name: 'Heineken', brand: 'Heineken', category: 'beer', keywords: ['heineken'] },
      { name: 'Coca-Cola', brand: 'Coca-Cola', category: 'soft_drink', keywords: ['coca cola', 'coca-cola'] },
      { name: 'Estrella Damm', brand: 'Estrella Damm', category: 'beer', keywords: ['estrella damm', 'estrella'] },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO "Product" (id, name, brand, category, keywords)
        VALUES (${uuidv4()}, ${product.name}, ${product.brand}, ${product.category}, ${stringifyJson(product.keywords)})
        ON CONFLICT (id) DO NOTHING
      `
    }

    console.log('✅ Created', products.length, 'products')

    // Seed example prospects
    const exampleProspects = [
      {
        name: 'Bar Central',
        address: 'Calle Mayor 10',
        city: 'Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
        phoneNumber: '+34 91 123 4567',
        businessType: 'bar',
        priceRange: '€€',
        rating: 4.5,
        reviewCount: 120,
        currentProducts: ['Mahou', 'Coca-Cola'],
        missingProducts: [
          { brand: 'Heineken', category: 'beer', confidence: 95 },
          { brand: 'Estrella Damm', category: 'beer', confidence: 90 },
        ],
        competitors: [],
        leadScore: 85,
        priority: 'high',
        status: 'new',
        source: 'seed',
        sourceUrl: '',
      },
      {
        name: 'Restaurante El Prado',
        address: 'Paseo del Prado 25',
        city: 'Madrid',
        latitude: 40.4139,
        longitude: -3.6921,
        phoneNumber: '+34 91 234 5678',
        businessType: 'restaurant',
        cuisine: 'Española',
        priceRange: '€€€',
        rating: 4.8,
        reviewCount: 350,
        currentProducts: ['Rioja', 'Agua Mineral'],
        missingProducts: [
          { brand: 'Heineken', category: 'beer', confidence: 85 },
          { brand: 'Coca-Cola', category: 'soft_drink', confidence: 80 },
        ],
        competitors: [],
        leadScore: 92,
        priority: 'high',
        status: 'new',
        source: 'seed',
        sourceUrl: '',
      },
      {
        name: 'Cafetería La Esquina',
        address: 'Gran Vía 42',
        city: 'Madrid',
        latitude: 40.4201,
        longitude: -3.7077,
        phoneNumber: '+34 91 345 6789',
        businessType: 'cafe',
        priceRange: '€',
        rating: 4.2,
        reviewCount: 85,
        currentProducts: ['Café', 'Pasteles'],
        missingProducts: [
          { brand: 'Red Bull', category: 'soft_drinks', confidence: 70 },
          { brand: 'Nestea', category: 'soft_drinks', confidence: 75 },
        ],
        competitors: [],
        leadScore: 65,
        priority: 'medium',
        status: 'new',
        source: 'seed',
        sourceUrl: '',
      },
    ]

    for (const prospect of exampleProspects) {
      const id = uuidv4()
      await sql`
        INSERT INTO "Prospect" (
          id, name, address, city, latitude, longitude, phoneNumber,
          businessType, cuisine, priceRange, rating, reviewCount,
          currentProducts, missingProducts, competitors,
          leadScore, priority, status, source, sourceUrl
        ) VALUES (
          ${id},
          ${prospect.name},
          ${prospect.address},
          ${prospect.city},
          ${prospect.latitude},
          ${prospect.longitude},
          ${prospect.phoneNumber},
          ${prospect.businessType},
          ${prospect.cuisine || null},
          ${prospect.priceRange},
          ${prospect.rating},
          ${prospect.reviewCount},
          ${stringifyJson(prospect.currentProducts)},
          ${stringifyJson(prospect.missingProducts)},
          ${stringifyJson(prospect.competitors)},
          ${prospect.leadScore},
          ${prospect.priority},
          ${prospect.status},
          ${prospect.source},
          ${prospect.sourceUrl || null}
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    console.log('✅ Created', exampleProspects.length, 'example prospects')
    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('Error seeding:', error)
    throw error
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
