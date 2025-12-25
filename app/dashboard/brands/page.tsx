'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react'

interface Brand {
  id: string
  name: string
  category: string
  keywords: string[]
  active: boolean
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Beer',
    keywords: '',
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands/manage')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/brands/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        }),
      })

      if (response.ok) {
        await fetchBrands()
        setShowAddForm(false)
        setFormData({ name: '', category: 'Beer', keywords: '' })
      }
    } catch (error) {
      console.error('Error adding brand:', error)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Brand>) => {
    try {
      const response = await fetch(`/api/brands/manage/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchBrands()
        setEditingId(null)
      }
    } catch (error) {
      console.error('Error updating brand:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const response = await fetch(`/api/brands/manage/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBrands()
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Gestión de Productos y Marcas
          </h1>
          <p className="text-gray-600">
            Añade y gestiona los productos que quieres trackear en venues
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          Añadir Producto
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nuevo Producto</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Croquetas, Heineken, Paella"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Beer">Cerveza</option>
                <option value="Soft Drink">Refresco</option>
                <option value="Spirit">Licor</option>
                <option value="Wine">Vino</option>
                <option value="Food">Comida</option>
                <option value="Dish">Plato</option>
                <option value="Snack">Aperitivo</option>
                <option value="Other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (separadas por comas)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="ej: croqueta, croquetas, croquettes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.name || !formData.keywords}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="space-y-4">
        {brands.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-600 mb-6">
              Añade tu primer producto para empezar a trackear
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              Añadir Producto
            </button>
          </div>
        ) : (
          brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              isEditing={editingId === brand.id}
              onEdit={() => setEditingId(brand.id)}
              onSave={(updates) => handleUpdate(brand.id, updates)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDelete(brand.id)}
              onToggleActive={() => handleUpdate(brand.id, { active: !brand.active })}
            />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Productos</div>
          <div className="text-3xl font-bold text-gray-900">{brands.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Activos</div>
          <div className="text-3xl font-bold text-green-600">
            {brands.filter(b => b.active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Cervezas</div>
          <div className="text-3xl font-bold text-amber-600">
            {brands.filter(b => b.category === 'Beer').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Comida</div>
          <div className="text-3xl font-bold text-orange-600">
            {brands.filter(b => ['Food', 'Dish', 'Snack'].includes(b.category)).length}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandCard({
  brand,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleActive,
}: {
  brand: Brand
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<Brand>) => void
  onCancel: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const [editData, setEditData] = useState({
    name: brand.name,
    category: brand.category,
    keywords: brand.keywords.join(', '),
  })

  const categoryColors: any = {
    Beer: 'bg-amber-100 text-amber-800',
    'Soft Drink': 'bg-blue-100 text-blue-800',
    Spirit: 'bg-purple-100 text-purple-800',
    Wine: 'bg-red-100 text-red-800',
    Food: 'bg-orange-100 text-orange-800',
    Dish: 'bg-green-100 text-green-800',
    Snack: 'bg-yellow-100 text-yellow-800',
    Other: 'bg-gray-100 text-gray-800',
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="Beer">Cerveza</option>
            <option value="Soft Drink">Refresco</option>
            <option value="Spirit">Licor</option>
            <option value="Wine">Vino</option>
            <option value="Food">Comida</option>
            <option value="Dish">Plato</option>
            <option value="Snack">Aperitivo</option>
            <option value="Other">Otro</option>
          </select>
          <input
            type="text"
            value={editData.keywords}
            onChange={(e) => setEditData({ ...editData, keywords: e.target.value })}
            placeholder="keywords separadas por comas"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                name: editData.name,
                category: editData.category,
                keywords: editData.keywords.split(',').map(k => k.trim()).filter(k => k),
              })
            }
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${!brand.active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{brand.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[brand.category] || categoryColors.Other}`}>
              {brand.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${brand.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {brand.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {brand.keywords.map((keyword, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleActive}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              brand.active
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {brand.active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}


