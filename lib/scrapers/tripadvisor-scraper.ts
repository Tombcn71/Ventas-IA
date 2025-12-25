import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScraperConfig, RestaurantData, MenuItemData } from './types'

/**
 * TripAdvisor scraper para restaurantes españoles
 * Extrae información de restaurantes, reviews y menciones de productos
 */
export class TripAdvisorScraper {
  private baseUrl = 'https://www.tripadvisor.es'
  private userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  async scrapeRestaurants(config: ScraperConfig): Promise<RestaurantData[]> {
    const results: RestaurantData[] = []

    try {
      const locationId = await this.getLocationId(config.city)
      if (!locationId) {
        console.error(`No se encontró ID de ubicación para ${config.city}`)
        return results
      }

      // Buscar restaurantes en la ciudad
      const searchUrl = `${this.baseUrl}/Restaurants-${locationId}-${config.city}.html`
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'es-ES,es;q=0.9',
        },
      })

      const $ = cheerio.load(response.data)
      
      // Extraer listado de restaurantes
      const restaurantLinks: string[] = []
      $('a[href*="/Restaurant_Review"]').each((_, element) => {
        const href = $(element).attr('href')
        if (href && !restaurantLinks.includes(href)) {
          restaurantLinks.push(href)
        }
      })

      // Limitar resultados
      const linksToScrape = restaurantLinks.slice(0, config.limit || 20)

      for (const link of linksToScrape) {
        try {
          const restaurantData = await this.scrapeRestaurantDetails(link, config.city)
          if (restaurantData) {
            results.push(restaurantData)
          }
          
          // Respetar rate limits
          await this.delay(config.delayMs || 2000)
        } catch (error) {
          console.error(`Error scraping restaurant ${link}:`, error)
        }
      }

    } catch (error) {
      console.error('Error scraping TripAdvisor:', error)
    }

    return results
  }

  private async scrapeRestaurantDetails(
    path: string,
    city: string
  ): Promise<RestaurantData | null> {
    try {
      const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'es-ES,es;q=0.9',
        },
      })

      const $ = cheerio.load(response.data)

      // Extraer información básica
      const name = $('h1[data-test-target="top-info-header"]').text().trim()
      if (!name) return null

      const address = $('a[href*="maps.google.com"]').text().trim()
      const phoneNumber = $('a[href^="tel:"]').text().trim()
      
      // Rating
      const ratingText = $('svg[aria-label*="de 5 burbujas"]')
        .parent()
        .attr('aria-label') || ''
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s+de\s+5/)
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined

      // Número de reviews
      const reviewText = $('a[href*="#REVIEWS"]').first().text().trim()
      const reviewMatch = reviewText.match(/(\d+[\d\.]*)/)
      const reviewCount = reviewMatch
        ? parseInt(reviewMatch[1].replace('.', ''))
        : undefined

      // Price range
      const priceRange = $('.fNYMN').text().trim() || '€€'

      // Tipo de cocina
      const cuisine = $('.DsyBj').text().trim().split(',')[0]

      // Tipo de negocio
      const businessType = this.determineBusinessType(cuisine, name)

      // Extraer menciones de productos de reviews
      const menuItems = await this.extractMenuItemsFromReviews($)

      // Intentar obtener coordenadas
      const mapLink = $('a[href*="maps.google.com"]').attr('href')
      const coords = this.extractCoordinates(mapLink)

      const restaurantData: RestaurantData = {
        name,
        address,
        city,
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
        phoneNumber: phoneNumber || undefined,
        businessType,
        cuisine,
        priceRange,
        rating,
        reviewCount,
        currentProducts: [],
        menuItems,
        source: 'tripadvisor',
        sourceUrl: url,
      }

      return restaurantData
    } catch (error) {
      console.error('Error extracting restaurant details:', error)
      return null
    }
  }

  private async extractMenuItemsFromReviews($: cheerio.CheerioAPI): Promise<MenuItemData[]> {
    const menuItems: MenuItemData[] = []
    const seenItems = new Set<string>()

    // Extraer de reviews
    $('.partial_entry').each((_, element) => {
      const reviewText = $(element).text().toLowerCase()
      
      // Buscar menciones de bebidas comunes
      const beveragePatterns = [
        /cerveza\s+(\w+)/g,
        /vino\s+(\w+)/g,
        /copa\s+de\s+(\w+)/g,
        /refresco/g,
        /coca\s*cola/g,
        /pepsi/g,
      ]

      beveragePatterns.forEach((pattern) => {
        const matches = reviewText.matchAll(pattern)
        for (const match of matches) {
          const item = match[0]
          if (!seenItems.has(item)) {
            seenItems.add(item)
            menuItems.push({
              name: item,
              category: 'bebidas',
            })
          }
        }
      })
    })

    return menuItems
  }

  private determineBusinessType(cuisine: string, name: string): string {
    const lowerCuisine = cuisine.toLowerCase()
    const lowerName = name.toLowerCase()

    if (lowerName.includes('bar') || lowerCuisine.includes('bar')) return 'bar'
    if (lowerName.includes('cafetería') || lowerCuisine.includes('café')) return 'cafe'
    return 'restaurant'
  }

  private extractCoordinates(mapLink?: string): { lat: number; lng: number } | null {
    if (!mapLink) return null

    const match = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      }
    }

    const queryMatch = mapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (queryMatch) {
      return {
        lat: parseFloat(queryMatch[1]),
        lng: parseFloat(queryMatch[2]),
      }
    }

    return null
  }

  private async getLocationId(city: string): Promise<string | null> {
    // IDs conocidos de ciudades españolas en TripAdvisor
    const cityIds: Record<string, string> = {
      Madrid: 'g187514',
      Barcelona: 'g187497',
      Valencia: 'g187529',
      Sevilla: 'g187443',
      Málaga: 'g187438',
      Bilbao: 'g187449',
      Zaragoza: 'g187448',
      Granada: 'g187441',
    }

    return cityIds[city] || null
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}



