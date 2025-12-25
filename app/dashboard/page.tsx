'use client'

import Link from 'next/link'
import {
  Target,
  Activity,
  MapPin,
  ArrowRight,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Resumen de tu actividad de ventas
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/prospects?status=new&minScore=60"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition"
          >
            <Target className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold mb-1 text-gray-900">Top Leads</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ver prospects con mayor potencial
            </p>
            <div className="flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
              Ver leads <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/dashboard/routes/create"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition"
          >
            <MapPin className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="text-lg font-bold mb-1 text-gray-900">Nueva Ruta</h3>
            <p className="text-sm text-gray-600 mb-3">
              Planifica tus visitas de hoy
            </p>
            <div className="flex items-center text-sm text-green-600 font-medium group-hover:gap-2 transition-all">
              Crear ruta <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/dashboard/scrape"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition"
          >
            <Activity className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-bold mb-1 text-gray-900">Scraping</h3>
            <p className="text-sm text-gray-600 mb-3">
              Buscar nuevos prospects
            </p>
            <div className="flex items-center text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
              Iniciar <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
