import { GoogleGenerativeAI } from '@google/generative-ai'
import { ImageAnnotatorClient } from '@google-cloud/vision'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface MenuAnalysisResult {
  brands: string[]
  products: string[]
  confidence: number
}

/**
 * Step 1: Extract text with Vision OCR
 * Step 2: Analyze text with Gemini
 */
export async function analyzeMenuPhoto(photoUrl: string, brandsToLookFor: string[]): Promise<MenuAnalysisResult> {
  try {
    // Step 1: Vision AI extracts text
    const visionClient = new ImageAnnotatorClient()
    const [result] = await visionClient.textDetection(photoUrl)
    const menuText = result.textAnnotations?.[0]?.description || ''
    
    if (!menuText || menuText.length < 10) {
      return { brands: [], products: [], confidence: 0 }
    }
    
    // Step 2: Gemini analyzes extracted text
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const prompt = `Menu text: "${menuText}"

Which brands are mentioned: ${brandsToLookFor.join(', ')}?

Return JSON array: ["brand1"]`

    const geminiResult = await model.generateContent(prompt)
    const response = geminiResult.response.text()
    const cleaned = response.replace(/```json|```/g, '').trim()
    const json = JSON.parse(cleaned)
    
    return {
      brands: Array.isArray(json) ? json : [],
      products: [],
      confidence: 0.9
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return { brands: [], products: [], confidence: 0 }
  }
}

