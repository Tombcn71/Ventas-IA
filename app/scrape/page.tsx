'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Loader, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { SPANISH_CITIES } from '@/lib/scrapers/types'

export default function ScrapePage() {
  const [config, setConfig] = useState({
    city: 'Madrid',
    cuisine: '',
    limit: 20,
  })
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const startScraping = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()
      setJob(data)

      // Poll for status
      const interval = setInterval(async () => {
        const statusResponse = await fetch(`/api/scrape?jobId=${data.jobId}`)
        const statusData = await statusResponse.json()
        setJob(statusData)

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          clearInterval(interval)
          setLoading(false)
        }
      }, 2000)
    } catch (error) {
      console.error('Error starting scrape:', error)
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
              <Link href="/routes" className="text-gray-700 hover:text-primary-600">
                Rutas
              </Link>
              <Link href="/scrape" className="text-primary-600 font-semibold">
                Scraping
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración de Scraping
          </h1>
          <p className="text-gray-600">
            Configura las fuentes de datos para extraer información de restaurantes, bares y cafeterías
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Configuración</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <select
                value={config.city}
                onChange={(e) => setConfig({ ...config, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {SPANISH_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cocina (opcional)
              </label>
              <input
                type="text"
                value={config.cuisine}
                onChange={(e) => setConfig({ ...config, cuisine: e.target.value })}
                placeholder="ej: Italiana, Japonesa, Tapas..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Deja vacío para todos los tipos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Resultados
              </label>
              <input
                type="number"
                value={config.limit}
                onChange={(e) =>
                  setConfig({ ...config, limit: parseInt(e.target.value) })
                }
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Número máximo de prospects a scraper (1-100)
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Fuentes de Datos Automáticas
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              Nuestro sistema extrae datos automáticamente de múltiples fuentes:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Google Places API (info básica y coordenadas)</li>
              <li>✓ TripAdvisor (reviews y menciones de productos)</li>
              <li>✓ Glovo (menús y productos)</li>
              <li>✓ Just Eat España</li>
              <li>✓ El Tenedor</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3 italic">
              El scraping se ejecuta automáticamente en segundo plano. No necesitas hacer nada manualmente.
            </p>
          </div>

          <button
            onClick={startScraping}
            disabled={loading}
            className="mt-6 w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Scraping en progreso...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Iniciar Scraping
              </>
            )}
          </button>
        </div>

        {/* Job Status */}
        {job && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-6">Estado del Job</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Estado:</span>
                <div className="flex items-center gap-2">
                  {job.status === 'running' && (
                    <>
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-blue-600 font-semibold">
                        En progreso
                      </span>
                    </>
                  )}
                  {job.status === 'completed' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        Completado
                      </span>
                    </>
                  )}
                  {job.status === 'failed' && (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold">
                        Fallido
                      </span>
                    </>
                  )}
                </div>
              </div>

              {job.prospectsFound > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Prospects encontrados:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {job.prospectsFound}
                  </span>
                </div>
              )}

              {job.status === 'completed' && (
                <div className="mt-6">
                  <Link
                    href="/prospects"
                    className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-semibold"
                  >
                    Ver Prospects
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Nota Importante
          </h3>
          <p className="text-sm text-yellow-800">
            El scraping puede tardar varios minutos dependiendo del número de
            resultados. Se respetan los rate limits para evitar bloqueos. Para
            uso en producción, considera usar APIs oficiales o servicios de
            scraping profesionales.
          </p>
        </div>
      </main>
    </div>
  )
}

