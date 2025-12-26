'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minScore: 0,
    maxScore: 100,
    priceLevel: '',
  })

  useEffect(() => {
    fetchProspects()
  }, [filters])

  const fetchProspects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.minScore) params.append('minScore', filters.minScore)

      const response = await fetch(`/api/prospects?${params}`)
      const data = await response.json()
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data)
        setProspects([])
        return
      }
      
      // Filter by search locally
      let filtered = data
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = data.filter((p: any) =>
          p && p.name && p.address &&
          (p.name.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower))
        )
      }
      
      setProspects(filtered || [])
    } catch (error) {
      console.error('Error fetching prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProspects = prospects.filter(p => {
    if (p.leadScore < filters.minScore || p.leadScore > filters.maxScore) return false
    if (filters.city && p.city !== filters.city) return false
    if (filters.priceLevel && p.price_level !== parseInt(filters.priceLevel)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return p.name?.toLowerCase().includes(search) || p.address?.toLowerCase().includes(search)
    }
    return true
  })

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-6">Filtros</h2>
        
        {/* AI Score Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Prospect Score</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.minScore}
              onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value) || 0})}
              className="w-20 px-2 py-1 border rounded"
              placeholder="0"
            />
            <span>-</span>
            <input
              type="number"
              value={filters.maxScore}
              onChange={(e) => setFilters({...filters, maxScore: parseInt(e.target.value) || 100})}
              className="w-20 px-2 py-1 border rounded"
              placeholder="100"
            />
          </div>
        </div>

        {/* Price Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Nivel de Precio</label>
          <select
            value={filters.priceLevel}
            onChange={(e) => setFilters({...filters, priceLevel: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Todos</option>
            <option value="1">$ Económico</option>
            <option value="2">$$ Moderado</option>
            <option value="3">$$$ Caro</option>
          </select>
        </div>

        {/* City */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Ciudad</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Todas</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Madrid">Madrid</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Buscar</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Nombre o dirección..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Dashboard</h1>
          <p className="text-gray-600">
            {filteredProspects.length} oportunidades encontradas
          </p>
        </div>

        {/* Filters - keeping for compatibility but hidden */}
        <div className="hidden">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o dirección..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las ciudades</option>
              <option value="Madrid">Madrid</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Valencia">Valencia</option>
              <option value="Sevilla">Sevilla</option>
              <option value="Málaga">Málaga</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="new">Nuevo</option>
              <option value="contacted">Contactado</option>
              <option value="interested">Interesado</option>
              <option value="customer">Cliente</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
            <select
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Cualquier score</option>
              <option value="80">Score &gt; 80</option>
              <option value="60">Score &gt; 60</option>
              <option value="40">Score &gt; 40</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando prospects...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No se encontraron prospects</p>
            <Link
              href="/dashboard/scrape"
              className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Iniciar Scraping
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {prospects.length} prospect(s)
            </div>
            <div className="grid gap-4">
              {prospects.map((prospect) => (
                <ProspectCard key={prospect.id} prospect={prospect} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProspectCard({ prospect }: { prospect: any }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [menuResults, setMenuResults] = useState<any>(null)
  
  const statusColors: any = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    interested: 'bg-green-100 text-green-800',
    not_interested: 'bg-gray-100 text-gray-800',
    customer: 'bg-purple-100 text-purple-800',
  }

  const priorityColors: any = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }

  const missingProducts = Array.isArray(prospect.missingProducts)
    ? prospect.missingProducts
    : []
  
  const analyzeMenu = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: prospect.id })
      })
      const data = await response.json()
      setMenuResults(data)
    } catch (error) {
      console.error('Error analyzing menu:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{prospect.name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                statusColors[prospect.status]
              }`}
            >
              {prospect.status}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                priorityColors[prospect.priority]
              }`}
            >
              {prospect.priority}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {prospect.address}, {prospect.city}
            </div>
            {prospect.phoneNumber && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {prospect.phoneNumber}
              </div>
            )}
            {prospect.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {prospect.rating} ({prospect.reviewCount} reviews)
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              {prospect.businessType}
            </span>
            {prospect.cuisine && (
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {prospect.cuisine}
              </span>
            )}
            {prospect.priceRange && (
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {prospect.priceRange}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">
              {prospect.leadScore}
            </span>
          </div>
          <div className="text-xs text-gray-500">Lead Score</div>
        </div>
      </div>

      {missingProducts.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <div className="font-semibold text-green-900 mb-2 text-sm">
            🎯 Oportunidades ({missingProducts.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {missingProducts.slice(0, 5).map((product: any, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-green-200"
              >
                {product.brand || product}
              </span>
            ))}
            {missingProducts.length > 5 && (
              <span className="px-3 py-1 text-sm text-gray-600">
                +{missingProducts.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {prospect.sourceUrl && (
            <a
              href={prospect.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
            >
              Fuente <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <Link
          href={`/dashboard/prospects/${prospect.id}`}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-1 text-sm"
        >
          Ver Detalles <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

