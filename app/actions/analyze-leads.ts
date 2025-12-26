'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getLeadIntelligence(reviews: string[], myProducts: string[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Je bent een sales-expert voor de Spaanse horeca.
Analyseer de volgende reviews van een restaurant/bar:
---
${reviews.join('\n')}
---
Mijn verkoper verkoopt deze producten: ${myProducts.join(', ')}.

Geef een JSON antwoord met:
1. "match_score": 0-100 gebaseerd op hoe goed mijn producten passen bij hun tekortkomingen.
2. "competitor_detected": Welke andere merken worden genoemd?
3. "pain_points": Waar klagen klanten over (prijs, kwaliteit, aanbod)?
4. "perfect_pitch": Een openingszin van max 20 woorden die de verkoper kan gebruiken.

Return ONLY valid JSON.`

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

