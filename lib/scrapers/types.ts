export interface ScraperConfig {
  city: string
  cuisine?: string
  limit?: number
  delayMs?: number
}

export interface RestaurantData {
  name: string
  address: string
  city: string
  postalCode?: string
  latitude: number
  longitude: number
  phoneNumber?: string
  website?: string
  email?: string
  businessType: string
  cuisine?: string
  priceRange?: string
  rating?: number
  reviewCount?: number
  currentProducts: string[]
  menuItems: MenuItemData[]
  source: string
  sourceUrl: string
}

export interface MenuItemData {
  name: string
  description?: string
  price?: number
  category?: string
}

export interface ProductMatch {
  product: string
  brand: string
  category: string
  found: boolean
  confidence: number
}

// Spaanse steden voor targeting
export const SPANISH_CITIES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Zaragoza',
  'Málaga',
  'Murcia',
  'Palma',
  'Las Palmas',
  'Bilbao',
  'Alicante',
  'Córdoba',
  'Valladolid',
  'Vigo',
  'Gijón',
  'Granada',
  'Pamplona',
  'San Sebastián',
] as const

// Producten om te tracken (aangepast voor Spaanse markt)
export const TRACKED_PRODUCTS = {
  beer: [
    { brand: 'Heineken', keywords: ['heineken'] },
    { brand: 'Estrella Damm', keywords: ['estrella damm', 'estrella'] },
    { brand: 'Mahou', keywords: ['mahou'] },
    { brand: 'San Miguel', keywords: ['san miguel'] },
    { brand: 'Cruzcampo', keywords: ['cruzcampo', 'cruz campo'] },
    { brand: 'Amstel', keywords: ['amstel'] },
    { brand: 'Corona', keywords: ['corona'] },
    { brand: 'Alhambra', keywords: ['alhambra'] },
  ],
  soft_drinks: [
    { brand: 'Coca-Cola', keywords: ['coca cola', 'coca-cola', 'cocacola'] },
    { brand: 'Pepsi', keywords: ['pepsi'] },
    { brand: 'Fanta', keywords: ['fanta'] },
    { brand: 'Aquarius', keywords: ['aquarius'] },
    { brand: 'Nestea', keywords: ['nestea'] },
    { brand: 'Red Bull', keywords: ['red bull', 'redbull'] },
  ],
  wine: [
    { brand: 'Rioja', keywords: ['rioja'] },
    { brand: 'Ribera del Duero', keywords: ['ribera del duero', 'ribera'] },
    { brand: 'Albariño', keywords: ['albariño', 'albarino'] },
    { brand: 'Verdejo', keywords: ['verdejo'] },
    { brand: 'Cava', keywords: ['cava'] },
  ],
  spirits: [
    { brand: 'Absolut', keywords: ['absolut'] },
    { brand: 'Jägermeister', keywords: ['jägermeister', 'jagermeister'] },
    { brand: 'Licor 43', keywords: ['licor 43', 'cuarenta y tres'] },
    { brand: 'Baileys', keywords: ['baileys'] },
  ],
} as const



