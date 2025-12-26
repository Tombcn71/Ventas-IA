'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getLeadIntelligence(reviews: string[], myProducts: string[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `Je bent een sales-expert voor de Spaanse horeca.
Analyseer deze reviews van een restaurant/bar:
---
${reviews.join('\n')}
---

Mijn verkoper verkoopt: ${myProducts.join(', ')}.

ZOEK NAAR GAPS:
- Worden mijn producten NIET genoemd? +40 score
- Worden concurrenten genoemd? +30 score
- Klachten over huidige aanbod? +20 score

Geef JSON:
{
  "match_score": 0-100,
  "competitor_detected": ["merk1"],
  "pain_points": ["klacht1"],
  "perfect_pitch": "Max 20 woorden sales opening"
}

ONLY valid JSON.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return null
  }
}

