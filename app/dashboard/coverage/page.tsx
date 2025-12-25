'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Package,
  Target,
  BarChart3,
  Award,
  AlertCircle,
} from 'lucide-react'
import BrandSelector from '../components/BrandSelector'

export default function CoveragePage() {
  const [coverage, setCoverage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState<string>('')
  const [city, setCity] = useState<string>('Barcelona')

  useEffect(() => {
    if (brandId) {
      fetchCoverage()
    }
  }, [brandId, city])

  const fetchCoverage = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ brandId, city })
      
      const response = await fetch(`/api/coverage?${params}`)
      const data = await response.json()
      setCoverage(data)
    } catch (error) {
      console.error('Error fetching coverage:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectionChange = (newBrandId: string, newCity: string, customKeyword?: string) => {
    setBrandId(newBrandId || customKeyword || '')
    setCity(newCity)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cobertura...</p>
        </div>
      </div>
    )
  }

  if (!coverage) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay datos de cobertura
          </h3>
          <p className="text-gray-600">
            Ejecuta la migración y seed para ver datos de demo
          </p>
        </div>
      </div>
    )
  }

  const { overview, cityBreakdown, typeBreakdown, productPerformance, recentChanges } = coverage

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Análisis de Cobertura
        </h1>
        <p className="text-gray-600">
          Presencia de mercado de {coverage?.brand?.name || 'tu marca'}
        </p>
      </div>

      {/* Brand & City Selector */}
      <BrandSelector onSelectionChange={handleSelectionChange} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Target className="w-6 h-6" />}
          title="Penetración de Mercado"
          value={`${overview?.penetrationRate || 0}%`}
          subtitle={`${overview?.coveredVenues || 0} de ${overview?.totalVenues || 0} venues`}
          trend={overview?.penetrationRate >= 50 ? 'up' : 'neutral'}
          color="blue"
        />
        <MetricCard
          icon={<MapPin className="w-6 h-6" />}
          title="Venues con Producto"
          value={overview?.coveredVenues || 0}
          subtitle="Presencia confirmada"
          color="green"
        />
        <MetricCard
          icon={<AlertCircle className="w-6 h-6" />}
          title="Oportunidades"
          value={overview?.uncoveredVenues || 0}
          subtitle="Sin nuestra marca"
          color="orange"
        />
        <MetricCard
          icon={<Package className="w-6 h-6" />}
          title="Productos Activos"
          value={coverage.products?.length || 0}
          subtitle="En seguimiento"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Coverage by City */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Cobertura por Ciudad
          </h2>
          <div className="space-y-4">
            {cityBreakdown?.slice(0, 5).map((city: any) => (
              <div key={city.city}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{city.city}</span>
                  <span className="text-sm text-gray-600">
                    {city.penetrationRate}% • {city.coveredVenues}/{city.totalVenues}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      city.penetrationRate >= 50 ? 'bg-green-500' :
                      city.penetrationRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${city.penetrationRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage by Venue Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Cobertura por Tipo de Venue
          </h2>
          <div className="space-y-4">
            {typeBreakdown?.map((type: any) => (
              <div key={type.venueType}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 capitalize">
                    {type.venueType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {type.penetrationRate}% • {type.coveredVenues}/{type.totalVenues}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${type.penetrationRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Rendimiento por Producto
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productPerformance?.map((product: any) => (
            <div key={product.productName} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1">
                {product.productName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {product.presentIn}
                </span>
                <span className="text-sm text-gray-500">venues</span>
              </div>
              {product.avgPrice && (
                <p className="text-xs text-gray-500 mt-2">
                  Precio promedio: €{product.avgPrice}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Changes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Cambios Recientes (7 días)
        </h2>
        {recentChanges?.length > 0 ? (
          <div className="space-y-2">
            {recentChanges.slice(0, 10).map((change: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {change.isAvailable ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{change.venueName}</p>
                    <p className="text-sm text-gray-600">
                      {change.productName} • {change.city}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  change.isAvailable 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {change.isAvailable ? 'Añadido' : 'Eliminado'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No hay cambios recientes
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ¿Quieres aumentar tu cobertura?
            </h3>
            <p className="text-gray-600">
              Descubre {overview?.uncoveredVenues || 0} oportunidades de venta en tu territorio
            </p>
          </div>
          <Link
            href="/dashboard/opportunities"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Ver Oportunidades
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, title, value, subtitle, trend, color }: any) {
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
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trend === 'up' && (
          <TrendingUp className="w-5 h-5 text-green-600" />
        )}
      </div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  )
}

