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
      // Search for restaurants in the city
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`
      const response = await axios.get(searchUrl, {
        params: {
          query: `${config.cuisine || 'restaurants'} en ${config.city}, España`,
          key: this.apiKey,
          language: 'es',
          type: 'restaurant',
        },
      })

      const places = response.data.results.slice(0, config.limit || 20)

      for (const place of places) {
        // Get detailed information
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`
        const detailsResponse = await axios.get(detailsUrl, {
          params: {
            place_id: place.place_id,
            fields:
              'name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,price_level,types',
            key: this.apiKey,
            language: 'es',
          },
        })

        const details = detailsResponse.data.result

        const restaurantData: RestaurantData = {
          name: details.name,
          address: details.formatted_address,
          city: config.city,
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          phoneNumber: details.formatted_phone_number,
          website: details.website,
          businessType: this.determineBusinessType(details.types),
          rating: details.rating,
          reviewCount: details.user_ratings_total,
          priceRange: this.convertPriceLevel(details.price_level),
          currentProducts: [],
          menuItems: [],
          source: 'google_places',
          sourceUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
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

  private convertPriceLevel(level?: number): string {
    if (!level) return '€€'
    return '€'.repeat(level)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}



