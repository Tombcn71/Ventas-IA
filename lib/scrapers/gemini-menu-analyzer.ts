import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface MenuAnalysisResult {
  brands: string[]
  products: string[]
  confidence: number
}

/**
 * Analyze menu photo with Gemini Flash Vision
 */
export async function analyzeMenuPhoto(photoUrl: string, brandsToLookFor: string[]): Promise<MenuAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Analyze this menu/drink photo and tell me which of these brands/products you see: ${brandsToLookFor.join(', ')}.

Return ONLY a JSON object like this:
{
  "found": ["brand1", "brand2"],
  "confidence": 0.9
}

Only include brands you clearly see in the image. Be strict.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: await fetchImageAsBase64(photoUrl)
        }
      }
    ])
    
    const response = result.response.text()
    const json = JSON.parse(response.replace(/```json|```/g, '').trim())
    
    return {
      brands: json.found || [],
      products: json.found || [],
      confidence: json.confidence || 0.5
    }
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return { brands: [], products: [], confidence: 0 }
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

