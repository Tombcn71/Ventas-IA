/**
 * Google Places + Photo OCR Scraper
 * Extracts menu data from restaurant photos using OCR
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''

interface VenueData {
  placeId: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  rating?: number
  priceLevel?: number
  venueType: string
  photoReferences: string[]
  phoneNumber?: string
}

/**
 * Search for restaurants/bars in Barcelona
 */
export async function searchVenuesBarcelona(limit: number = 200): Promise<VenueData[]> {
  const venues: VenueData[] = []
  
  // Barcelona coordinates
  const center = { lat: 41.3851, lng: 2.1734 }
  const radius = 5000 // 5km radius
  
  // Areas to cover Barcelona
  const areas = [
    { lat: 41.3851, lng: 2.1734, name: 'Center' },
    { lat: 41.4036, lng: 2.1744, name: 'Eixample' },
    { lat: 41.3888, lng: 2.1590, name: 'Gothic Quarter' },
    { lat: 41.3947, lng: 2.1929, name: 'Sagrada Familia' },
  ]
  
  for (const area of areas) {
    if (venues.length >= limit) break
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${area.lat},${area.lng}&radius=${radius}&type=restaurant|bar|cafe&key=${GOOGLE_MAPS_API_KEY}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.results) {
        for (const place of data.results) {
          if (venues.length >= limit) break
          
          // Get detailed info including photos
          const details = await getPlaceDetails(place.place_id)
          if (details) {
            venues.push(details)
          }
          
          // Rate limiting
          await sleep(100)
        }
      }
    } catch (error) {
      console.error(`Error searching area ${area.name}:`, error)
    }
  }
  
  return venues.slice(0, limit)
}

/**
 * Get detailed place information including photos
 */
async function getPlaceDetails(placeId: string): Promise<VenueData | null> {
  const fields = 'place_id,name,formatted_address,geometry,rating,price_level,photos,formatted_phone_number,types'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.result) {
      const place = data.result
      
      // Extract photo references
      const photoReferences = place.photos?.slice(0, 3).map((p: any) => p.photo_reference) || []
      
      // Determine venue type
      const types = place.types || []
      let venueType = 'restaurant'
      if (types.includes('bar')) venueType = 'bar'
      else if (types.includes('cafe')) venueType = 'cafe'
      
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        city: 'Barcelona',
        latitude: place.geometry?.location?.lat || 0,
        longitude: place.geometry?.location?.lng || 0,
        rating: place.rating,
        priceLevel: place.price_level,
        venueType,
        photoReferences,
        phoneNumber: place.formatted_phone_number,
      }
    }
  } catch (error) {
    console.error(`Error getting details for ${placeId}:`, error)
  }
  
  return null
}

/**
 * Get photo URL from photo reference
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
  return `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&maxwidth=${maxWidth}&key=${GOOGLE_MAPS_API_KEY}`
}

/**
 * Extract text from menu photo using Google Cloud Vision OCR
 */
export async function extractMenuText(photoReference: string): Promise<string> {
  if (!process.env.GOOGLE_CLOUD_VISION_KEY) {
    console.warn('Google Cloud Vision API key not found, skipping OCR')
    return ''
  }
  
  try {
    const visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY
    })
    
    const photoUrl = getPhotoUrl(photoReference)
    
    // Perform text detection
    const [result] = await visionClient.textDetection(photoUrl)
    const detections = result.textAnnotations
    
    if (detections && detections.length > 0) {
      // First annotation contains full text
      return detections[0].description || ''
    }
  } catch (error) {
    console.error('OCR error:', error)
  }
  
  return ''
}

/**
 * Detect brands/products in menu text
 */
export function detectBrandsInText(menuText: string): Record<string, boolean> {
  const text = menuText.toLowerCase()
  
  // Spanish beer brands
  const brands = {
    heineken: /heineken/i.test(text),
    mahou: /mahou/i.test(text),
    estrella: /estrella\s*(damm)?/i.test(text),
    sanMiguel: /san\s*miguel/i.test(text),
    cruzcampo: /cruzcampo/i.test(text),
    alhambra: /alhambra/i.test(text),
    
    // Soft drinks
    cocaCola: /coca[\s-]*cola|coke/i.test(text),
    pepsi: /pepsi/i.test(text),
    fanta: /fanta/i.test(text),
    sprite: /sprite/i.test(text),
    nestea: /nestea/i.test(text),
    aquarius: /aquarius/i.test(text),
    
    // Water
    evian: /evian/i.test(text),
    vichy: /vichy\s*catalan/i.test(text),
    solares: /solares/i.test(text),
  }
  
  return brands
}

/**
 * Process venue: get photos, OCR, detect brands
 */
export async function processVenueMenu(venue: VenueData): Promise<Record<string, boolean>> {
  const detectedBrands: Record<string, boolean> = {}
  
  // Process up to 3 photos
  for (const photoRef of venue.photoReferences.slice(0, 3)) {
    try {
      const menuText = await extractMenuText(photoRef)
      
      if (menuText) {
        const brands = detectBrandsInText(menuText)
        
        // Merge results (if found in any photo, mark as true)
        Object.keys(brands).forEach(brand => {
          if (brands[brand]) {
            detectedBrands[brand] = true
          }
        })
      }
      
      // Rate limiting
      await sleep(200)
    } catch (error) {
      console.error(`Error processing photo for ${venue.name}:`, error)
    }
  }
  
  return detectedBrands
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}


