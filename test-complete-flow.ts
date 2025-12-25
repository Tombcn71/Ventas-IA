import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function testComplete() {
  console.log('🧪 Testing complete flow:\n')
  
  // 1. Check venues with photos
  console.log('1️⃣ Checking venues with photos...')
  const venuesWithPhotos = await sql`
    SELECT COUNT(*) as count 
    FROM venues 
    WHERE platforms::text != '{}'
  `
  console.log(`   ✅ ${venuesWithPhotos[0].count} venues have photos\n`)
  
  // 2. Check brands configured
  console.log('2️⃣ Checking active brands...')
  const brands = await sql`
    SELECT b.name 
    FROM brands b
    INNER JOIN brand_products bp ON b.id = bp.brand_id
    WHERE bp.active = true
  `
  console.log(`   ✅ ${brands.length} active brands: ${brands.map((b: any) => b.name).join(', ')}\n`)
  
  // 3. Check Vision AI
  console.log('3️⃣ Testing Vision AI...')
  const visionTest = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { source: { imageUri: 'https://cloud.google.com/static/vision/docs/images/sign_text.png' } },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    })
  })
  const visionData = await visionTest.json()
  console.log(`   ✅ Vision AI works: ${visionData.responses?.[0]?.textAnnotations ? 'YES' : 'NO'}\n`)
  
  // 4. Check Gemini
  console.log('4️⃣ Testing Gemini...')
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const geminiResult = await model.generateContent('Say hello')
  console.log(`   ✅ Gemini works: ${geminiResult.response.text()}\n`)
  
  // 5. Check detections
  console.log('5️⃣ Checking product detections...')
  const detections = await sql`
    SELECT COUNT(*) as count 
    FROM product_availability
  `
  console.log(`   📊 ${detections[0].count} products detected in venues\n`)
  
  console.log('✨ All systems check complete!')
}

testComplete().catch(console.error)

