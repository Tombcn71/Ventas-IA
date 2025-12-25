'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, Search } from 'lucide-react'

interface Brand {
  id: string
  name: string
  category: string
}

interface BrandSelectorProps {
  onSelectionChange: (brandId: string, city: string, customKeyword?: string) => void
}

export default function BrandSelector({ onSelectionChange }: BrandSelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('Barcelona')
  const [customKeyword, setCustomKeyword] = useState<string>('')
  const [useCustomSearch, setUseCustomSearch] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrands(data)
      
      // Auto-select first brand
      if (data.length > 0 && !useCustomSearch) {
        setSelectedBrand(data[0].id)
        onSelectionChange(data[0].id, selectedCity)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId)
    setUseCustomSearch(false)
    onSelectionChange(brandId, selectedCity)
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (useCustomSearch) {
      onSelectionChange('', city, customKeyword)
    } else {
      onSelectionChange(selectedBrand, city)
    }
  }

  const handleCustomKeywordSearch = () => {
    if (customKeyword.trim()) {
      setUseCustomSearch(true)
      setSelectedBrand('')
      onSelectionChange('', selectedCity, customKeyword)
    }
  }

  const handleClearCustomSearch = () => {
    setCustomKeyword('')
    setUseCustomSearch(false)
    if (brands.length > 0) {
      setSelectedBrand(brands[0].id)
      onSelectionChange(brands[0].id, selectedCity)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 mb-6">
        <div className="w-64 h-12 bg-gray-200 animate-pulse rounded-lg" />
        <div className="w-48 h-12 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4">
        {/* Brand Selector */}
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Seleccionar Producto/Marca
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={useCustomSearch}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.category})
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Ciudad
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="Barcelona">Barcelona</option>
            <option value="Madrid">Madrid (Próximamente)</option>
            <option value="Valencia">Valencia (Próximamente)</option>
            <option value="Sevilla">Sevilla (Próximamente)</option>
          </select>
        </div>
      </div>

      {/* Custom Keyword Search */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-purple-600" />
          <label className="text-sm font-medium text-gray-900">
            O buscar cualquier palabra en menús
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomKeywordSearch()}
            placeholder='ej: "croquetas", "paella", "pulpo"'
            className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {useCustomSearch ? (
            <button
              onClick={handleClearCustomSearch}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Limpiar
            </button>
          ) : (
            <button
              onClick={handleCustomKeywordSearch}
              disabled={!customKeyword.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          )}
        </div>
        {useCustomSearch && (
          <div className="mt-2 text-sm text-purple-700">
            Buscando: <span className="font-semibold">{customKeyword}</span> en {selectedCity}
          </div>
        )}
      </div>
    </div>
  )
}

