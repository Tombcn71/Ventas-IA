'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Navigation, MapPin } from 'lucide-react'

export default function CreateRoutePage() {
  const router = useRouter()
  const [prospects, setProspects] = useState<any[]>([])
  const [selectedProspects, setSelectedProspects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [config, setConfig] = useState({
    name: '',
    salesPerson: '',
    plannedDate: new Date().toISOString().split('T')[0],
    city: '',
  })

  useEffect(() => {
    fetchProspects()
  }, [config.city])

  const fetchProspects = async () => {
    try {
      const params = new URLSearchParams()
      if (config.city) params.append('city', config.city)
      params.append('status', 'new')
      
      const response = await fetch(`/api/prospects?${params}`)
      const data = await response.json()
      setProspects(data)
    } catch (error) {
      console.error('Error fetching prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProspect = (id: string) => {
    setSelectedProspects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const createRoute = async () => {
    if (!config.name || !config.salesPerson || selectedProspects.length === 0) {
      alert('Por favor completa todos los campos y selecciona al menos un prospect')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          prospectIds: selectedProspects,
        }),
      })

      if (response.ok) {
        const route = await response.json()
        router.push(`/dashboard/routes/${route.id}`)
      }
    } catch (error) {
      console.error('Error creating route:', error)
      alert('Error al crear la ruta')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/routes"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Rutas
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Crear Nueva Ruta
        </h1>
        <p className="text-gray-600">
          Selecciona prospects y optimiza tu ruta de visitas
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-6">Configuración</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Ruta *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) =>
                    setConfig({ ...config, name: e.target.value })
                  }
                  placeholder="ej: Madrid Centro - Lunes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendedor *
                </label>
                <input
                  type="text"
                  value={config.salesPerson}
                  onChange={(e) =>
                    setConfig({ ...config, salesPerson: e.target.value })
                  }
                  placeholder="Nombre del vendedor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Planificada *
                </label>
                <input
                  type="date"
                  value={config.plannedDate}
                  onChange={(e) =>
                    setConfig({ ...config, plannedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad (filtro)
                </label>
                <select
                  value={config.city}
                  onChange={(e) =>
                    setConfig({ ...config, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="Madrid">Madrid</option>
                  <option value="Barcelona">Barcelona</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Sevilla">Sevilla</option>
                  <option value="Málaga">Málaga</option>
                </select>
              </div>
            </div>

            {/* Selected Prospects Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Prospects Seleccionados
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {selectedProspects.length}
                </span>
              </div>
              {selectedProspects.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedProspects.map((id, index) => {
                    const prospect = prospects.find((p) => p.id === id)
                    if (!prospect) return null
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-600">
                            {index + 1}.
                          </span>
                          <span className="text-gray-900 truncate">
                            {prospect.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleProspect(id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={createRoute}
              disabled={creating || selectedProspects.length === 0}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {creating ? (
                'Creando...'
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  Crear Ruta
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              La ruta será optimizada automáticamente
            </p>
          </div>
        </div>

        {/* Prospects List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-6">
              Prospects Disponibles
              {!loading && ` (${prospects.length})`}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando prospects...</p>
              </div>
            ) : prospects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay prospects disponibles</p>
                <Link
                  href="/dashboard/scrape"
                  className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Iniciar Scraping
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {prospects.map((prospect) => (
                  <div
                    key={prospect.id}
                    onClick={() => toggleProspect(prospect.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedProspects.includes(prospect.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">
                            {prospect.name}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            Score: {prospect.leadScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {prospect.address}, {prospect.city}
                        </div>
                        {Array.isArray(prospect.missingProducts) &&
                          prospect.missingProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {prospect.missingProducts
                                .slice(0, 3)
                                .map((product: any, index: number) => (
                                  <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                                  >
                                    {product.brand || product}
                                  </span>
                                ))}
                            </div>
                          )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedProspects.includes(prospect.id)
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedProspects.includes(prospect.id) && (
                          <Plus className="w-4 h-4 text-white rotate-45" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
