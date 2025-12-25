'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Target,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import BrandSelector from '../components/BrandSelector'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState<string>('')
  const [city, setCity] = useState<string>('Barcelona')
  const [minScore, setMinScore] = useState<string>('')

  useEffect(() => {
    if (brandId) {
      fetchOpportunities()
    }
  }, [brandId, city, minScore])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ brandId, city })
      if (minScore) params.append('minScore', minScore)
      
      const response = await fetch(`/api/opportunities?${params}`)
      const data = await response.json()
      setOpportunities(data.opportunities || [])
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectionChange = (newBrandId: string, newCity: string, customKeyword?: string) => {
    setBrandId(customKeyword || newBrandId)
    setCity(newCity)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando oportunidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Oportunidades de Venta
        </h1>
        <p className="text-gray-600">
          Venues sin tu marca pero con alto potencial de venta
        </p>
      </div>

      {/* Brand & City Selector */}
      <BrandSelector onSelectionChange={handleSelectionChange} />

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Total Oportunidades"
            value={summary.totalOpportunities}
            color="blue"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Alto Valor"
            value={summary.highValueOpportunities}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Con Competidores"
            value={summary.withCompetitors}
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Ingresos Potenciales"
            value={`€${summary.estimatedMonthlyRevenue.toLocaleString()}`}
            subtitle="/mes"
            color="purple"
          />
        </div>
      )}

      {/* Additional Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Cualquier score</option>
            <option value="100">Score &gt; 100 (Alto)</option>
            <option value="60">Score &gt; 60 (Medio)</option>
            <option value="30">Score &gt; 30 (Bajo)</option>
          </select>

          <div className="text-right flex items-center justify-end">
            <span className="text-sm text-gray-600">
              Mostrando {opportunities.length} oportunidades
            </span>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay oportunidades
          </h3>
          <p className="text-gray-600 mb-6">
            Ajusta los filtros o ejecuta un nuevo scraping
          </p>
          <Link
            href="/dashboard/scrape"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar Scraping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const priorityColors: any = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const priorityLabels: any = {
    high: 'Alta Prioridad',
    medium: 'Prioridad Media',
    low: 'Baja Prioridad',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {opportunity.name}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              priorityColors[opportunity.priority]
            }`}>
              {priorityLabels[opportunity.priority]}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Score: {opportunity.opportunityScore}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {opportunity.address}, {opportunity.city}
            </span>
            {opportunity.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {opportunity.rating.toFixed(1)}
              </span>
            )}
            <span className="capitalize">{opportunity.venueType}</span>
            {opportunity.priceLevel && (
              <span>{'€'.repeat(opportunity.priceLevel)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Visitor Info */}
        {opportunity.estimatedWeeklyVisitors > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Visitantes/semana</div>
            <div className="text-lg font-bold text-blue-900">
              {opportunity.estimatedWeeklyVisitors.toLocaleString()}
            </div>
          </div>
        )}

        {/* Competitors */}
        {opportunity.competitorProducts && opportunity.competitorProducts.length > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Competidores</div>
            <div className="text-lg font-bold text-orange-900">
              {opportunity.competitorProducts.length} marcas
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {opportunity.competitorProducts.slice(0, 2).map((c: any) => c.name).join(', ')}
            </div>
          </div>
        )}

        {/* Platforms */}
        {opportunity.platforms && Object.values(opportunity.platforms).some((v: any) => v === true) && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Plataformas</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(opportunity.platforms).map(([platform, active]: [string, any]) => 
                active && (
                  <span key={platform} className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">
                    {platform}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex gap-2">
        <Link
          href={`/dashboard/routes/create?venueId=${opportunity.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Añadir a Ruta <ArrowRight className="w-4 h-4" />
        </Link>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          Ver Detalles
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
      {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
    </div>
  )
}

