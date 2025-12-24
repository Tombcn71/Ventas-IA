'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, User, Clock, Navigation, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes')
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-2xl font-bold text-primary-600">
                DashLeads
              </Link>
            </div>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/prospects" className="text-gray-700 hover:text-primary-600">
                Prospects
              </Link>
              <Link href="/routes" className="text-primary-600 font-semibold">
                Rutas
              </Link>
              <Link href="/scrape" className="text-gray-700 hover:text-primary-600">
                Scraping
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rutas de Ventas
            </h1>
            <p className="text-gray-600">
              Planifica y gestiona tus rutas de visitas
            </p>
          </div>
          <Link
            href="/routes/create"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nueva Ruta
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando rutas...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay rutas creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera ruta para empezar a planificar visitas
            </p>
            <Link
              href="/routes/create"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Ruta
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function RouteCard({ route }: { route: any }) {
  const statusColors: any = {
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  }

  const statusLabels: any = {
    planned: 'Planificada',
    in_progress: 'En Progreso',
    completed: 'Completada',
  }

  const completedVisits = route.prospects.filter((p: any) => p.visited).length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{route.name}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[route.status]
              }`}
            >
              {statusLabels[route.status]}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(route.plannedDate)}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {route.salesPerson}
            </div>
            {route.totalDistance && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {route.totalDistance.toFixed(1)} km
              </div>
            )}
            {route.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.round(route.estimatedDuration / 60)}h{' '}
                {route.estimatedDuration % 60}m
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progreso de visitas</span>
          <span className="font-semibold text-gray-900">
            {completedVisits} / {route.prospects.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{
              width: `${(completedVisits / route.prospects.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Prospects Preview */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Paradas ({route.prospects.length}):
        </div>
        <div className="space-y-2">
          {route.prospects.slice(0, 3).map((rp: any) => (
            <div
              key={rp.id}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  rp.visited
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {rp.orderIndex + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {rp.prospect.name}
                </div>
                <div className="text-xs text-gray-600">
                  {rp.prospect.address}
                </div>
              </div>
            </div>
          ))}
          {route.prospects.length > 3 && (
            <div className="text-sm text-gray-500 text-center">
              +{route.prospects.length - 3} paradas más
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/routes/${route.id}`}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-semibold"
        >
          Ver Detalles
        </Link>
        {route.status === 'planned' && (
          <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold">
            Iniciar Ruta
          </button>
        )}
      </div>
    </div>
  )
}


