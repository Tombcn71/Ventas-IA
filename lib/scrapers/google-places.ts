import axios from 'axios'
import { ScraperConfig, RestaurantData } from './types'

export class GooglePlacesScraper {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || ''
  }

  async scrapeRestaurants(config: ScraperConfig): Promise<RestaurantData[]> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured, skipping Google Places scraping')
      return []
    }

    const results: RestaurantData[] = []

    try {
      // New Places API (Text Search)
      const searchUrl = `https://places.googleapis.com/v1/places:searchText`
      const response = await axios.post(searchUrl, {
        textQuery: `${config.cuisine || 'restaurants'} en ${config.city}, España`,
        maxResultCount: Math.min(config.limit || 20, 20),
        languageCode: 'es',
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.priceLevel,places.types'
        }
      })

      const places = response.data.places || []

      for (const place of places) {
        const details = place

        const restaurantData: RestaurantData = {
          name: details.displayName?.text || details.displayName,
          address: details.formattedAddress,
          city: config.city,
          latitude: details.location?.latitude || 0,
          longitude: details.location?.longitude || 0,
          phoneNumber: details.internationalPhoneNumber,
          website: details.websiteUri,
          businessType: this.determineBusinessType(details.types || []),
          rating: details.rating,
          reviewCount: details.userRatingCount,
          priceRange: this.convertPriceLevel(details.priceLevel),
          currentProducts: [],
          menuItems: [],
          source: 'google_places',
          sourceUrl: `https://www.google.com/maps/place/?q=place_id:${details.id}`,
        }

        results.push(restaurantData)

        // Respect rate limits
        await this.delay(config.delayMs || 1000)
      }
    } catch (error) {
      console.error('Error scraping Google Places:', error)
    }

    return results
  }

  private determineBusinessType(types: string[]): string {
    if (types.includes('bar')) return 'bar'
    if (types.includes('cafe')) return 'cafe'
    if (types.includes('restaurant')) return 'restaurant'
    if (types.includes('night_club')) return 'bar'
    return 'restaurant'
  }

  private convertPriceLevel(level?: string | number): string {
    if (!level) return '€€'
    if (typeof level === 'string') {
      const priceMap: Record<string, string> = {
        'PRICE_LEVEL_FREE': '€',
        'PRICE_LEVEL_INEXPENSIVE': '€',
        'PRICE_LEVEL_MODERATE': '€€',
        'PRICE_LEVEL_EXPENSIVE': '€€€',
        'PRICE_LEVEL_VERY_EXPENSIVE': '€€€€'
      }
      return priceMap[level] || '€€'
    }
    return '€'.repeat(level)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}



