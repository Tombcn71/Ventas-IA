import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d * 10) / 10
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function calculateLeadScore(prospect: {
  rating?: number | null
  reviewCount?: number | null
  missingProducts: any
  lastContactDate?: Date | null
}): number {
  let score = 0

  // Rating score (0-30 points)
  if (prospect.rating) {
    score += prospect.rating * 6
  }

  // Review count score (0-20 points)
  if (prospect.reviewCount) {
    score += Math.min(prospect.reviewCount / 10, 20)
  }

  // Missing products score (0-30 points)
  const missingProducts = Array.isArray(prospect.missingProducts)
    ? prospect.missingProducts
    : []
  score += Math.min(missingProducts.length * 10, 30)

  // Recency score (0-20 points)
  if (prospect.lastContactDate) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(prospect.lastContactDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact > 90) {
      score += 20
    } else if (daysSinceContact > 30) {
      score += 10
    }
  } else {
    score += 20 // Never contacted
  }

  return Math.round(Math.min(score, 100))
}


