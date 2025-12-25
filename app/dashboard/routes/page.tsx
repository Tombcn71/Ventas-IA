'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Navigation, Plus, Check } from 'lucide-react'
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Rutas de Ventas
          </h1>
          <p className="text-gray-600">
            Planifica y gestiona tus rutas de visitas
          </p>
        </div>
        <Link
          href="/dashboard/routes/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva Ruta
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando rutas...</p>
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay rutas creadas
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera ruta para empezar a planificar visitas
          </p>
          <Link
            href="/dashboard/routes/create"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Primera Ruta
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {route.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(route.date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {route.stops?.length || 0} paradas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.round((route.distance || 0) / 1000)} km
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[route.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[route.status] || route.status}
        </span>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Paradas:</h4>
          <div className="space-y-2">
            {route.stops.slice(0, 3).map((stop: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span>{stop.prospect?.name || 'Unknown'}</span>
                {stop.completed && <Check className="w-4 h-4 text-green-600" />}
              </div>
            ))}
            {route.stops.length > 3 && (
              <div className="text-sm text-gray-500 ml-8">
                +{route.stops.length - 3} más...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/dashboard/routes/${route.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Ver Ruta
        </Link>
      </div>
    </div>
  )
}
