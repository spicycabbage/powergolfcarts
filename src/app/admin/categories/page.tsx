'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen
} from 'lucide-react'
import SeoFields from '@/components/seo/SeoFields'
import { BackButton } from '@/components/admin/BackButton'
import Button from '@/components/ui/Button'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: string
  children: string[]
  isActive: boolean
  featuredOnHomepage?: boolean
  homepageOrder?: number
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

export default function CategoriesAdmin() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parent: '',
    isActive: true,
    featuredOnHomepage: false,
    homepageOrder: 0,
    seo: {
      title: '',
      description: '',
      keywords: [] as string[]
    }
  })

  const slugExists = formData.slug.trim() !== '' && categories.some((cat) => {
    // exclude current when editing
    return cat.slug === formData.slug.trim().toLowerCase() && (!editingCategory || cat._id !== editingCategory._id)
  })

  const makeUniqueSlug = () => {
    const base = (formData.slug.trim().toLowerCase() || generateSlug(formData.name)).replace(/^-+|-+$/g, '')
    let i = 2
    let candidate = `${base}-${i}`
    while (categories.some((cat) => cat.slug === candidate && (!editingCategory || cat._id !== editingCategory._id))) {
      i += 1
      candidate = `${base}-${i}`
    }
    setFormData({ ...formData, slug: candidate })
  }

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
      return
    }

    if (user?.role === 'admin') {
      fetchCategories()
    }
  }, [user?.role, isLoading]) // Only depend on user.role, not the entire user object

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        parent: typeof (category as any).parent === 'object' && (category as any).parent?._id
          ? String((category as any).parent._id)
          : (typeof (category as any).parent === 'string' ? String((category as any).parent) : ''),
        isActive: category.isActive,
        featuredOnHomepage: category.featuredOnHomepage || false,
        homepageOrder: category.homepageOrder || 0,
        seo: {
          title: category.seo.title,
          description: category.seo.description,
          keywords: category.seo.keywords
        }
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parent: '',
        isActive: true,
        featuredOnHomepage: false,
        homepageOrder: 0,
        seo: {
          title: '',
          description: '',
          keywords: []
        }
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: (formData.description || '').trim(),
        image: (formData.image || '').trim(),
        parent: formData.parent && formData.parent !== '' ? formData.parent : undefined,
        isActive: formData.isActive,
        featuredOnHomepage: formData.featuredOnHomepage,
        homepageOrder: formData.homepageOrder,
        seo: {
          title: (formData.seo.title || '').trim() || formData.name.trim(),
          description: (formData.seo.description || '').trim() || `Shop ${formData.name.trim()} products`,
          keywords: Array.isArray(formData.seo.keywords) ? formData.seo.keywords : [],
        },
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const saved = await response.json()
        await fetchCategories()
        // Ensure parent is expanded so the new child is visible immediately
        if (saved?.parent) {
          setExpandedCategories(prev => new Set(prev).add(typeof saved.parent === 'string' ? saved.parent : String(saved.parent?._id || saved.parent)))
        }
        closeModal()
        alert('Category saved')
      } else {
        let message = 'Failed to save category'
        try {
          const err = await response.json()
          message = err?.error || err?.details || message
        } catch {
          const text = await response.text()
          if (text) message = text
        }
        alert(message)
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')  // Remove leading and trailing hyphens
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
      seo: {
        ...formData.seo,
        title: name,
        description: `Shop ${name} products`
      }
    })
  }

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent)
  }

  const getChildCategories = (parentId: string) => {
    return categories.filter((cat: any) => {
      const p = cat.parent
      if (!p) return false
      if (typeof p === 'string') return p === parentId
      if (typeof p === 'object') return String(p._id || p) === parentId
      return false
    })
  }

  const renderCategoryTree = () => {
    const parentCategories = getParentCategories()

    return parentCategories.map(category => {
      const children = getChildCategories(category._id)
      const isExpanded = expandedCategories.has(category._id)

      return (
        <div key={category._id} className="border border-gray-200 rounded-lg mb-4">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <FolderOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <Folder className="w-5 h-5 text-blue-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">/{category.slug}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => openModal(category)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center clickable"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center clickable"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Below-row expand toggle (like Navigation Management) */}
          {children.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => toggleExpanded(category._id)}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center clickable"
                  aria-label={isExpanded ? 'Collapse subcategories' : 'Show subcategories'}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Hide subcategories' : 'Show subcategories'}
                </button>
              </div>
              {/* Child categories */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-2">
                    {children.map(child => (
                      <div key={child._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 pl-6">
                          <Folder className="w-4 h-4 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{child.name}</h4>
                            <p className="text-sm text-gray-500">/{child.slug}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            child.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {child.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => openModal(child)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center clickable"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(child._id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center clickable"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    })
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Folder className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Category Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <BackButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => openModal()}
            icon={Plus}
            variant="primary"
          >
            Add Category
          </Button>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first category</p>
            <Button
              onClick={() => openModal()}
              icon={Plus}
              variant="primary"
              className="mx-auto"
            >
              Add Category
            </Button>
          </div>
        ) : (
          <div>
            {renderCategoryTree()}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className={`w-full px-3 py-2 border ${slugExists ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'} rounded-lg`}
                    aria-invalid={slugExists}
                    required
                  />
                  {slugExists && (
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-red-600">Slug already exists. Choose another.</p>
                      <button
                        type="button"
                        onClick={makeUniqueSlug}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Make unique
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">No Parent (Top Level)</option>
                  {getParentCategories().map(category => (
                    <option key={category._id} value={typeof (category as any)._id === 'string' ? (category as any)._id : String((category as any)._id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {formData.image ? (
                  <div>
                    <div className="mb-3">
                      <img
                        src={formData.image}
                        alt="Category preview"
                        className="h-24 w-24 object-cover rounded border border-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                              alert('Please select an image file')
                              return
                            }
                            if (file.size > 4 * 1024 * 1024) {
                              alert('Image must be less than 4MB')
                              return
                            }
                            const form = new FormData()
                            form.append('file', file)
                            try {
                              const res = await fetch('/api/admin/categories/upload', {
                                method: 'POST',
                                body: form,
                                credentials: 'include',
                              })
                              if (!res.ok) {
                                const text = await res.text()
                                console.error('Upload failed:', text)
                                alert('Upload failed')
                                return
                              }
                              const data = await res.json()
                              setFormData({ ...formData, image: data.url })
                            } catch (err) {
                              console.error('Upload error:', err)
                              alert('Upload error')
                            }
                          }}
                        />
                        Replace Image
                      </label>
                      <Button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                              alert('Please select an image file')
                              return
                            }
                            if (file.size > 4 * 1024 * 1024) {
                              alert('Image must be less than 4MB')
                              return
                            }
                            const form = new FormData()
                            form.append('file', file)
                            try {
                              const res = await fetch('/api/admin/categories/upload', {
                                method: 'POST',
                                body: form,
                                credentials: 'include',
                              })
                              if (!res.ok) {
                                const text = await res.text()
                                console.error('Upload failed:', text)
                                alert('Upload failed')
                                return
                              }
                              const data = await res.json()
                              setFormData({ ...formData, image: data.url })
                            } catch (err) {
                              console.error('Upload error:', err)
                              alert('Upload error')
                            }
                          }}
                        />
                        Upload Image
                      </label>
                      <span className="text-sm text-gray-500">or</span>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Paste image URL (optional)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG or JPG up to 4MB. Shown on category cards.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (visible in navigation)
                </label>
              </div>

              {/* Homepage Featured Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Homepage Display</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="featuredOnHomepage"
                    checked={formData.featuredOnHomepage}
                    onChange={(e) => setFormData({ ...formData, featuredOnHomepage: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featuredOnHomepage" className="ml-2 block text-sm text-gray-700">
                    Featured on Homepage (show in homepage category grid)
                  </label>
                </div>

                {formData.featuredOnHomepage && (
                  <div>
                    <label htmlFor="homepageOrder" className="block text-sm font-medium text-gray-700 mb-2">
                      Homepage Order
                    </label>
                    <input
                      type="number"
                      id="homepageOrder"
                      value={formData.homepageOrder}
                      onChange={(e) => setFormData({ ...formData, homepageOrder: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 = first position)</p>
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                <SeoFields
                  seo={formData.seo as any}
                  onChange={(seo) => setFormData({ ...formData, seo })}
                  keyphraseLabel="Focus Keyphrase"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  icon={Save}
                  variant="primary"
                  loading={isSaving}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


