'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, ChevronRight } from 'lucide-react'

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao']

export default function OpportunitiesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState('Madrid')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/brands/manage')
      const data = await response.json()
      setProducts(data.filter((p: any) => p.active))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const toggleProduct = (productName: string) => {
    setSelectedProducts(prev => 
      prev.includes(productName) 
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    )
  }

  const searchMatches = async () => {
    if (selectedProducts.length === 0) {
      alert('Selecciona al menos un producto')
      return
    }
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        city: selectedCity,
        products: selectedProducts.join(',')
      })
      const response = await fetch(`/api/opportunities/search?${params}`)
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Oportunidades de Venta</h1>
        <p className="text-gray-600">
          Encuentra venues que NO venden tus productos
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Products Multi-Select */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tus Productos ({selectedProducts.length} seleccionados)
            </label>
            <div className="flex flex-wrap gap-2">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedProducts.includes(product.name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchMatches}
          disabled={selectedProducts.length === 0 || loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition"
        >
          {loading ? 'Buscando...' : '🔍 Buscar Leads'}
        </button>
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">
              ✅ {leads.length} oportunidades encontradas
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Venues en {selectedCity} sin {selectedProducts.join(', ')}
            </div>
          </div>

          <div className="space-y-3">
            {leads.map((lead) => (
              <OpportunityCard key={lead.id} lead={lead} missingProducts={selectedProducts} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OpportunityCard({ lead, missingProducts }: { lead: any, missingProducts: string[] }) {
  const score = lead.match_score || lead.leadScore || 0
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'
  const scoreBorder = score >= 80 ? 'border-emerald-500' : score >= 60 ? 'border-blue-500' : 'border-amber-500'
  
  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition p-5 flex gap-4">
      {/* Circular Score */}
      <div className="flex-shrink-0">
        <div className={`relative w-20 h-20 rounded-full border-4 ${scoreBorder} flex items-center justify-center bg-white`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-xs text-gray-500">Match</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{lead.name}</h3>
            
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              {lead.address}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {lead.rating && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {lead.rating}
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {lead.price_level ? '€'.repeat(lead.price_level) : '€€'}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                ❌ Sin: {missingProducts.join(', ')}
              </span>
            </div>

            {/* Potential Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">Opportunity Score</span>
                <span>{score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{width: `${Math.min(score, 100)}%`}}
                ></div>
              </div>
            </div>

            {/* AI Perfect Pitch */}
            {lead.perfectPitch && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-xs font-semibold text-blue-900 mb-1">🎯 Perfect Pitch</div>
                <div className="text-sm text-blue-800 italic">"{lead.perfectPitch}"</div>
              </div>
            )}
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1">
            Contactar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
