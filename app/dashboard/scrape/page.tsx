'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Loader, CheckCircle, XCircle } from 'lucide-react'
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
    setJob({ status: 'processing', prospectsFound: 0 })
    
    try {
      // Call Google Places API directly from browser
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBnCdCIEJnOuMY_MtQGOz2m7SAv849sCeg',
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.priceLevel,places.types'
        },
        body: JSON.stringify({
          textQuery: `${config.cuisine || 'restaurants'} en ${config.city}, España`,
          maxResultCount: Math.min(config.limit || 20, 20),
          languageCode: 'es',
        })
      })

      const data = await response.json()
      
      if (!data.places || data.places.length === 0) {
        setJob({ status: 'completed', prospectsFound: 0, error: 'No restaurants found' })
        setLoading(false)
        return
      }

      // Send results to our API to save in database
      const saveResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: config.city,
          places: data.places 
        }),
      })

      const result = await saveResponse.json()
      setJob({ status: 'completed', prospectsFound: result.saved || data.places.length })
      setLoading(false)
    } catch (error) {
      console.error('Error scraping:', error)
      setJob({ status: 'failed', error: String(error) })
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Configuración de Scraping
          </h1>
          <p className="text-gray-600">
            Extrae datos de restaurantes, bares y cafeterías en España
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Configuración</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <select
                value={config.city}
                onChange={(e) => setConfig({ ...config, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="ej. italiana, japonesa, tapas..."
                value={config.cuisine}
                onChange={(e) => setConfig({ ...config, cuisine: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de resultados
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={config.limit}
                onChange={(e) =>
                  setConfig({ ...config, limit: parseInt(e.target.value) || 20 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Máximo 100 resultados por búsqueda
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={startScraping}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar Scraping
                </>
              )}
            </button>
          </div>
        </div>

        {/* Job Status */}
        {job && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Estado del Job</h2>
              <div className="flex items-center gap-2">
                {job.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {job.status === 'failed' && (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {job.status === 'processing' && (
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {job.status === 'completed' && 'Completado'}
                  {job.status === 'failed' && 'Fallido'}
                  {job.status === 'processing' && 'Procesando'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ciudad</p>
                  <p className="font-semibold">{job.config?.city || config.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prospects Encontrados</p>
                  <p className="font-semibold">{job.prospectsFound || 0}</p>
                </div>
              </div>

              {job.status === 'completed' && (
                <Link
                  href="/dashboard/prospects"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Ver Nuevos Prospects
                </Link>
              )}

              {job.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{job.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Fuentes de Datos
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Google Places API - Información básica de locales</li>
            <li>• TripAdvisor - Reviews y ratings</li>
            <li>• Glovo - Menús y productos disponibles</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
