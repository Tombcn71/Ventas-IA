'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Users,
  Target,
  Activity,
  MapPin,
  Calendar,
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
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
              <Link href="/dashboard" className="text-primary-600 font-semibold">
                Dashboard
              </Link>
              <Link href="/prospects" className="text-gray-700 hover:text-primary-600">
                Prospects
              </Link>
              <Link href="/routes" className="text-gray-700 hover:text-primary-600">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Resumen de tu actividad de ventas y leads
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Total Prospects"
            value={stats?.overview?.totalProspects || 0}
            subtitle={`${stats?.overview?.newProspects || 0} nuevos`}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Alta Prioridad"
            value={stats?.overview?.highPriorityProspects || 0}
            subtitle="Requieren atención"
            color="red"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Clientes"
            value={stats?.overview?.customers || 0}
            subtitle={`${Math.round(stats?.overview?.conversionRate || 0)}% conversión`}
            color="green"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Visitas Exitosas"
            value={stats?.overview?.successfulVisits || 0}
            subtitle={`de ${stats?.overview?.totalVisits || 0} totales`}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Cities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-600" />
              Ciudades Principales
            </h2>
            {stats?.topCities && stats.topCities.length > 0 ? (
              <div className="space-y-3">
                {stats.topCities.map((city: any) => (
                  <div
                    key={city.city}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {city.city}
                        </div>
                        <div className="text-sm text-gray-600">
                          {city.count} prospects
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/prospects?city=${city.city}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-semibold"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No hay datos disponibles
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-600" />
              Actividad Reciente
            </h2>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivities.slice(0, 8).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="pb-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.prospect?.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {activity.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link
            href="/prospects?status=new&minScore=60"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition"
          >
            <Target className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Top Leads</h3>
            <p className="text-blue-100">
              Ver prospects con mayor potencial
            </p>
          </Link>

          <Link
            href="/routes/create"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition"
          >
            <MapPin className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Nueva Ruta</h3>
            <p className="text-green-100">Planifica tus visitas de hoy</p>
          </Link>

          <Link
            href="/scrape"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition"
          >
            <Activity className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Scraping</h3>
            <p className="text-purple-100">Buscar nuevos prospects</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  )
}


