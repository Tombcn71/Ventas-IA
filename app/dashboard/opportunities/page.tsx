'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Phone, Star, Target } from 'lucide-react'

export default function OpportunitiesPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [city, setCity] = useState('Barcelona')
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      searchOpportunities()
    }
  }, [selectedBrand, city])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands/manage')
      const data = await response.json()
      setBrands(data.filter((b: any) => b.active))
      if (data.length > 0) setSelectedBrand(data[0].name)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const searchOpportunities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search/brand?brand=${selectedBrand}&city=${city}&mode=without`)
      const data = await response.json()
      setVenues(data.venues || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Oportunidades de Venta</h1>
          <p className="text-gray-600">
            Venues que NO tienen tu producto - oportunidades de negocio
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto a buscar
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Barcelona">Barcelona</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Buscando oportunidades...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-900">
                🎯 {venues.length} venues sin {selectedBrand} en {city}
              </div>
              <div className="text-sm text-purple-700 mt-1">
                Estas son tus oportunidades de venta
              </div>
            </div>

            <div className="grid gap-4">
              {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {venue.address}
                        </div>
                        {venue.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {venue.phoneNumber}
                          </div>
                        )}
                        {venue.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {venue.rating}
                          </div>
                        )}
                      </div>
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        ❌ Sin {selectedBrand}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">
                          {venue.opportunity_score || Math.round((venue.rating || 0) * 20)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Opportunity Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
