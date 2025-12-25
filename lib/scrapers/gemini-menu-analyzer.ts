import { GoogleGenerativeAI } from '@google/generative-ai'

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
    // Step 1: OCR with Vision AI
    const menuText = await extractTextWithVision(photoUrl)
    
    if (!menuText || menuText.length < 10) {
      return { brands: [], products: [], confidence: 0 }
    }
    
    // Step 2: Analyze text with Gemini (cheap!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const prompt = `This is text extracted from a menu/bar photo:

"${menuText}"

Which of these brands do you see mentioned: ${brandsToLookFor.join(', ')}?

Return ONLY a JSON array: ["brand1", "brand2"]
Only brands clearly mentioned in the text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const json = JSON.parse(response.replace(/```json|```|\[|\]/g, '').trim().split(',').map(s => s.trim().replace(/"/g, '')))
    
    return {
      brands: Array.isArray(json) ? json.filter(Boolean) : [],
      products: [],
      confidence: 0.8
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return { brands: [], products: [], confidence: 0 }
  }
}

async function extractTextWithVision(photoUrl: string): Promise<string> {
  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: photoUrl } },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      })
    })
    
    const data = await response.json()
    const text = data.responses?.[0]?.textAnnotations?.[0]?.description || ''
    
    return text
  } catch (error) {
    console.error('Vision AI error:', error)
    return ''
  }
}

