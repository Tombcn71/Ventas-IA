import { GooglePlacesScraper } from './google-places'
import { TripAdvisorScraper } from './tripadvisor-scraper'
import { GlovoScraper } from './glovo-scraper'
import { ProductDetector } from './product-detector'
import { ScraperConfig, RestaurantData } from './types'
import { calculateLeadScore } from '../utils'

export class ScraperOrchestrator {
  private googleScraper: GooglePlacesScraper
  private tripAdvisorScraper: TripAdvisorScraper
  private glovoScraper: GlovoScraper
  private productDetector: ProductDetector

  constructor() {
    this.googleScraper = new GooglePlacesScraper()
    this.tripAdvisorScraper = new TripAdvisorScraper()
    this.glovoScraper = new GlovoScraper()
    this.productDetector = new ProductDetector()
  }

  async scrapeAllSources(config: ScraperConfig): Promise<RestaurantData[]> {
    const allResults: RestaurantData[] = []

    console.log(`Iniciando scraping para ${config.city}...`)

    // Scrape Google Places (más confiable para coordenadas y info básica)
    try {
      console.log('Scraping Google Places...')
      const googleResults = await this.googleScraper.scrapeRestaurants(config)
      allResults.push(...googleResults)
      console.log(`✓ Google Places: ${googleResults.length} restaurantes`)
    } catch (error) {
      console.error('Error en Google Places:', error)
    }

    // Scrape TripAdvisor (bueno para reviews y menciones de productos)
    try {
      console.log('Scraping TripAdvisor...')
      const tripAdvisorResults = await this.tripAdvisorScraper.scrapeRestaurants(config)
      allResults.push(...tripAdvisorResults)
      console.log(`✓ TripAdvisor: ${tripAdvisorResults.length} restaurantes`)
    } catch (error) {
      console.error('Error en TripAdvisor:', error)
    }

    // Glovo (opcional - requiere más setup)
    // try {
    //   console.log('Scraping Glovo...')
    //   const glovoResults = await this.glovoScraper.scrapeRestaurants(config)
    //   allResults.push(...glovoResults)
    //   console.log(`✓ Glovo: ${glovoResults.length} restaurantes`)
    // } catch (error) {
    //   console.error('Error en Glovo:', error)
    // }

    // Deduplicar y enriquecer resultados
    const deduplicated = this.deduplicateRestaurants(allResults)
    const enriched = this.enrichWithProductAnalysis(deduplicated)

    console.log(`✓ Total: ${enriched.length} restaurantes únicos`)

    return enriched
  }

  private deduplicateRestaurants(restaurants: RestaurantData[]): RestaurantData[] {
    const seen = new Map<string, RestaurantData>()

    for (const restaurant of restaurants) {
      const key = this.normalizeString(restaurant.name) + this.normalizeString(restaurant.address)
      
      if (!seen.has(key)) {
        seen.set(key, restaurant)
      } else {
        // Merge data if duplicate
        const existing = seen.get(key)!
        seen.set(key, this.mergeRestaurantData(existing, restaurant))
      }
    }

    return Array.from(seen.values())
  }

  private mergeRestaurantData(
    existing: RestaurantData,
    newData: RestaurantData
  ): RestaurantData {
    return {
      ...existing,
      phoneNumber: existing.phoneNumber || newData.phoneNumber,
      website: existing.website || newData.website,
      email: existing.email || newData.email,
      rating: existing.rating || newData.rating,
      reviewCount: existing.reviewCount || newData.reviewCount,
      priceRange: existing.priceRange || newData.priceRange,
      menuItems: [...existing.menuItems, ...newData.menuItems],
    }
  }

  private enrichWithProductAnalysis(restaurants: RestaurantData[]): RestaurantData[] {
    return restaurants.map((restaurant) => {
      const { found, missing } = this.productDetector.detectProducts(restaurant.menuItems)

      const topOpportunities = this.productDetector.getTopOpportunities(
        missing,
        restaurant.businessType,
        restaurant.priceRange
      )

      return {
        ...restaurant,
        currentProducts: found.map((p) => p.brand),
        // Store missing products for later use
      }
    })
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }
}

export * from './types'
export * from './product-detector'



