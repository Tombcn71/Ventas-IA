import { TRACKED_PRODUCTS, ProductMatch, MenuItemData } from './types'

export class ProductDetector {
  /**
   * Analyzes menu items and detects which products are present
   */
  detectProducts(menuItems: MenuItemData[]): {
    found: ProductMatch[]
    missing: ProductMatch[]
  } {
    const menuText = menuItems
      .map((item) => `${item.name} ${item.description || ''}`.toLowerCase())
      .join(' ')

    const allProducts: ProductMatch[] = []

    // Check each category
    Object.entries(TRACKED_PRODUCTS).forEach(([category, products]) => {
      products.forEach((product) => {
        const found = product.keywords.some((keyword) =>
          menuText.includes(keyword.toLowerCase())
        )

        allProducts.push({
          product: product.brand,
          brand: product.brand,
          category,
          found,
          confidence: found ? this.calculateConfidence(menuText, product.keywords) : 0,
        })
      })
    })

    return {
      found: allProducts.filter((p) => p.found),
      missing: allProducts.filter((p) => !p.found),
    }
  }

  /**
   * Calculate confidence score based on keyword matches
   */
  private calculateConfidence(text: string, keywords: readonly string[]): number {
    const matches = keywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    ).length

    return Math.min((matches / keywords.length) * 100, 100)
  }

  /**
   * Prioritize missing products based on business rules
   */
  prioritizeMissingProducts(missing: ProductMatch[]): ProductMatch[] {
    // Priority order: beer > soft drinks > wine > spirits
    const priorityMap: Record<string, number> = {
      beer: 4,
      soft_drinks: 3,
      wine: 2,
      spirits: 1,
    }

    return missing.sort((a, b) => {
      const priorityDiff = (priorityMap[b.category] || 0) - (priorityMap[a.category] || 0)
      if (priorityDiff !== 0) return priorityDiff

      // If same priority, sort by brand name
      return a.brand.localeCompare(b.brand)
    })
  }

  /**
   * Get top opportunities (missing products with high potential)
   */
  getTopOpportunities(
    missing: ProductMatch[],
    businessType: string,
    priceRange?: string
  ): ProductMatch[] {
    let filtered = missing

    // Filter based on business type
    if (businessType === 'bar' || businessType === 'cafe') {
      // Bars and cafes: focus on beer and soft drinks
      filtered = filtered.filter(
        (p) => p.category === 'beer' || p.category === 'soft_drinks' || p.category === 'spirits'
      )
    } else if (businessType === 'restaurant') {
      // Restaurants: all categories
      filtered = filtered
    }

    // Filter based on price range
    if (priceRange === '€' || priceRange === '€€') {
      // Lower price ranges: focus on mainstream brands
      const mainstreamBrands = [
        'Heineken',
        'Coca-Cola',
        'San Miguel',
        'Mahou',
        'Estrella Damm',
      ]
      filtered = filtered.filter((p) => mainstreamBrands.includes(p.brand))
    }

    return this.prioritizeMissingProducts(filtered).slice(0, 5)
  }
}

export const productDetector = new ProductDetector()

