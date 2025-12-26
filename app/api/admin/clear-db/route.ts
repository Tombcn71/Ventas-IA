import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST() {
  try {
    await sql`DELETE FROM product_availability`
    await sql`DELETE FROM venues`
    await sql`DELETE FROM "ScrapingJob"`
    
    return NextResponse.json({ message: 'Database cleared', success: true })
  } catch (error) {
    console.error('Error clearing database:', error)
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 })
  }
}

