import { ImageAnnotatorClient } from '@google-cloud/vision'
import * as dotenv from 'dotenv'
dotenv.config()

async function test() {
  try {
    const client = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_VISION_KEY
    })
    
    const testImageUrl = 'https://cloud.google.com/static/vision/docs/images/sign_text.png'
    
    console.log('Testing Vision AI...')
    const [result] = await client.textDetection(testImageUrl)
    const text = result.textAnnotations?.[0]?.description || ''
    
    console.log('✅ Vision AI works!')
    console.log('Extracted text:', text.substring(0, 100))
  } catch (error: any) {
    console.error('❌ Vision AI error:', error.message)
  }
}

test()


