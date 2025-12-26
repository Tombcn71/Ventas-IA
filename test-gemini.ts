import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const result = await model.generateContent('Say "hello"')
    console.log('✅ Gemini werkt!', result.response.text())
  } catch (error: any) {
    console.error('❌ Gemini error:', error.message)
  }
}

test()


