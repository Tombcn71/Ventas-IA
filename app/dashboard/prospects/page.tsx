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


        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando leads...</p>
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No se encontraron leads</p>
            <Link
              href="/dashboard/scrape"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Scrape Nuevos Leads
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProspects.map((prospect) => (
              <DashmoteCard key={prospect.id} lead={prospect} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DashmoteCard({ lead }: { lead: any }) {
  // Check if venue is open now
  const isOpenNow = () => {
    // Simplified - can be enhanced with opening_hours data
    const hour = new Date().getHours()
    return hour >= 10 && hour < 23
  }
  
  const openStatus = isOpenNow()
  
  const score = lead.leadScore || 0
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'
  const scoreBorder = score >= 80 ? 'border-emerald-500' : score >= 60 ? 'border-blue-500' : 'border-amber-500'
  
  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition p-5 flex gap-4">
      {/* Left: Circular Score */}
      <div className="flex-shrink-0">
        <div className={`relative w-20 h-20 rounded-full border-4 ${scoreBorder} flex items-center justify-center bg-white`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Header with name and status */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                openStatus ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {openStatus ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            
            {/* Address */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              {lead.address}
            </div>

            {/* Type Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {lead.businessType === 'restaurant' ? 'Eating Place' : 'Drinking Place'}
              </span>
              {lead.rating && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {lead.rating}
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {lead.price_level ? '€'.repeat(lead.price_level) : '€€'}
              </span>
            </div>

            {/* Potential Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">Potential</span>
                <span>{score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all ${
                    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{width: `${Math.min(score, 100)}%`}}
                ></div>
              </div>
            </div>
          </div>

          <Link
            href={`/dashboard/prospects/${lead.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1"
          >
            Ver <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

