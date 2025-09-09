'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  Menu
} from 'lucide-react'
import BackToAdmin from '@/components/admin/BackToAdmin'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  categoryId?: string
  isActive: boolean
  children?: NavigationItem[]
}

interface NavigationConfig {
  header: {
    logo: {
      text: string
      href: string
      image?: string
      useImage: boolean
    }
    banner: {
      text: string
      isActive: boolean
    }
  }
  secondaryNav: NavigationItem[]
  primaryNav: NavigationItem[]
}

interface NavigationAdminClientProps {
  session: Session
}

export default function NavigationAdminClient({ session }: NavigationAdminClientProps) {
  const router = useRouter()
  const [config, setConfig] = useState<NavigationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'header' | 'secondary' | 'primary'>('header')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      // Use the public API but this is now in a secure admin-only component
      const response = await fetch('/api/navigation')
      
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        console.log('✅ Navigation loaded successfully')
      } else {
        console.error('Failed to fetch navigation:', response.status, response.statusText)
        // Create default config if API fails
        setConfig({
          header: {
            logo: {
              text: 'E-Commerce',
              href: '/',
              image: '',
              useImage: false
            },
            banner: {
              text: 'Free shipping on orders over $50! Use code FREESHIP',
              isActive: true
            }
          },
          secondaryNav: [
            { name: 'About Us', href: '/about', isActive: true },
            { name: 'FAQ', href: '/faq', isActive: true },
            { name: 'Blog', href: '/blog', isActive: true },
            { name: 'Contact Us', href: '/contact', isActive: true }
          ],
          primaryNav: [
            { name: 'Shop All', href: '/categories', isActive: true },
            { name: 'Electronics', href: '/categories/electronics', isActive: true },
            { name: 'Clothing', href: '/categories/clothing', isActive: true },
            { name: 'Home & Garden', href: '/categories/home-garden', isActive: true },
            { name: 'Sports', href: '/categories/sports', isActive: true }
          ]
        })
        console.log('⚠️ Using default navigation config')
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error)
      // Fallback to default config
      setConfig({
        header: {
          logo: {
            text: 'E-Commerce',
            href: '/',
            image: '',
            useImage: false
          },
          banner: {
            text: 'Free shipping on orders over $50! Use code FREESHIP',
            isActive: true
          }
        },
        secondaryNav: [
          { name: 'About Us', href: '/about', isActive: true },
          { name: 'FAQ', href: '/faq', isActive: true },
          { name: 'Blog', href: '/blog', isActive: true },
          { name: 'Contact Us', href: '/contact', isActive: true }
        ],
        primaryNav: [
          { name: 'Shop All', href: '/categories', isActive: true },
          { name: 'Electronics', href: '/categories/electronics', isActive: true },
          { name: 'Clothing', href: '/categories/clothing', isActive: true },
          { name: 'Home & Garden', href: '/categories/home-garden', isActive: true },
          { name: 'Sports', href: '/categories/sports', isActive: true }
        ]
      })
      console.log('🔄 Using fallback navigation config')
    } finally {
      setLoading(false)
    }
  }

  const saveNavigation = async () => {
    if (!config) return

    if (uploadingLogo) {
      alert('Please wait for the logo upload to finish before saving.')
      return
    }

    // Validate image logo requirement
    if (config.header.logo.useImage && !config.header.logo.image) {
      alert('Please upload a logo image before saving (or switch to Text Logo).')
      return
    }

    setSaving(true)
    try {
      console.log('🔄 Saving navigation config:', config)
      console.log('🧪 Payload logo.useImage:', config.header.logo.useImage, 'logo.image length:', (config.header.logo.image || '').length)
      
      const response = await fetch('/api/admin/navigation', {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Save successful:', result)
        alert('Navigation updated successfully!')
        // Refresh the navigation data
        fetchNavigation()
      } else {
        const errorText = await response.text()
        console.error('❌ Save failed:', response.status, errorText)
        alert(`Failed to update navigation: ${response.status}\n${errorText}`)
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      alert('Network error: Failed to save navigation')
    } finally {
      setSaving(false)
    }
  }

  const updateHeaderLogo = (field: 'text' | 'href' | 'image' | 'useImage', value: string | boolean) => {
    setConfig(prev => {
      if (!prev) return prev as any
      return {
        ...prev,
        header: {
          ...prev.header,
          logo: {
            ...prev.header.logo,
            [field]: value
          }
        }
      }
    })
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type)

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        body: form,
        credentials: 'include'
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('❌ Upload API failed:', res.status, text)
        alert(`Upload failed: ${res.status}`)
        return
      }

      const data = await res.json()
      const url: string = data.url
      console.log('✅ Upload success, url:', url)

      // Single functional update to avoid stale state overwriting
      setConfig(prev => {
        if (!prev) return prev as any
        return {
          ...prev,
          header: {
            ...prev.header,
            logo: {
              ...prev.header.logo,
              image: url,
              useImage: true,
            },
          },
        }
      })

      alert('Logo uploaded! Click Save Changes to apply.')
    } catch (e) {
      console.error('❌ Upload error:', e)
      alert('Upload failed')
    } finally {
      setUploadingLogo(false)
    }
  }

  const updateHeaderBanner = (field: 'text' | 'isActive', value: string | boolean) => {
    if (!config) return
    setConfig({
      ...config,
      header: {
        ...config.header,
        banner: {
          ...config.header.banner,
          [field]: value
        }
      }
    })
  }

  const updateSecondaryNav = (index: number, field: keyof NavigationItem, value: any) => {
    if (!config) return
    const newSecondaryNav = [...config.secondaryNav]
    newSecondaryNav[index] = { ...newSecondaryNav[index], [field]: value }
    setConfig({ ...config, secondaryNav: newSecondaryNav })
  }

  const updatePrimaryNav = (index: number, field: keyof NavigationItem, value: any) => {
    if (!config) return
    const newPrimaryNav = [...config.primaryNav]
    newPrimaryNav[index] = { ...newPrimaryNav[index], [field]: value }
    setConfig({ ...config, primaryNav: newPrimaryNav })
  }

  const movePrimaryNavItem = (index: number, delta: number) => {
    if (!config) return
    const newIndex = index + delta
    if (newIndex < 0 || newIndex >= config.primaryNav.length) return
    const newPrimaryNav = [...config.primaryNav]
    ;[newPrimaryNav[index], newPrimaryNav[newIndex]] = [newPrimaryNav[newIndex], newPrimaryNav[index]]
    setConfig({ ...config, primaryNav: newPrimaryNav })
  }

  const removePrimaryNavItem = (index: number) => {
    if (!config) return
    const newPrimaryNav = config.primaryNav.filter((_, i) => i !== index)
    setConfig({ ...config, primaryNav: newPrimaryNav })
  }

  const clearPrimaryNav = () => {
    if (!config) return
    if (!confirm('Remove all primary navigation items?')) return
    setConfig({ ...config, primaryNav: [] })
  }

  const replacePrimaryNavWithCategories = async () => {
    if (!config) return
    if (!confirm('Replace primary navigation with top-level categories (and their children)?')) return
    try {
      const res = await fetch('/api/categories?active=true&limit=1000', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch categories')
      const json = await res.json()
      const categories: any[] = Array.isArray(json.data) ? json.data : []

      // Fetch full tree for top-level categories
      // For now, categories API returns flat; we'll build top-level by missing parent
      // Admin GET uses populated parent; here we only have lean
      const topLevel = categories.filter((c: any) => !c.parent)
      const byParent: Record<string, any[]> = {}
      for (const c of categories) {
        const p = (c.parent && typeof c.parent === 'string') ? c.parent : ''
        if (!p) continue
        byParent[p] = byParent[p] || []
        byParent[p].push(c)
      }

      const newPrimary = topLevel.map((cat: any) => ({
        name: cat.name,
        href: `/categories/${cat.slug}`,
        isActive: true,
        children: (byParent[String(cat._id)] || []).map(child => ({
          name: child.name,
          href: `/categories/${cat.slug}/${child.slug}`,
          isActive: true,
        }))
      }))

      setConfig({ ...config, primaryNav: newPrimary })
    } catch (e) {
      alert('Failed to build navigation from categories')
    }
  }

  const addSecondaryNavItem = () => {
    if (!config) return
    setConfig({
      ...config,
      secondaryNav: [
        ...config.secondaryNav,
        { name: 'New Item', href: '/', isActive: true }
      ]
    })
  }

  const removeSecondaryNavItem = (index: number) => {
    if (!config) return
    const newSecondaryNav = config.secondaryNav.filter((_, i) => i !== index)
    setConfig({ ...config, secondaryNav: newSecondaryNav })
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading navigation management...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load navigation configuration</p>
          <button 
            onClick={fetchNavigation}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
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
              <Settings className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Navigation Management</h1>
            </div>
            <BackToAdmin label="Back to Admin" href="/admin" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="flex items-center justify-end mb-2">
          <button
            type="button"
            onClick={saveNavigation}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'header', label: 'Header & Banner', icon: Menu },
                { key: 'secondary', label: 'Secondary Navigation', icon: Menu },
                { key: 'primary', label: 'Primary Navigation', icon: Menu }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Header Tab */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            {/* Logo Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Logo Configuration</h2>
              
              <div className="space-y-6">
                {/* Logo Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Logo Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="logoType"
                        checked={!config.header.logo.useImage}
                        onChange={() => updateHeaderLogo('useImage', false)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Text Logo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="logoType"
                        checked={config.header.logo.useImage}
                        onChange={() => updateHeaderLogo('useImage', true)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Image Logo</span>
                    </label>
                  </div>
                </div>

                {/* Text Logo Configuration */}
                {!config.header.logo.useImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Text
                    </label>
                    <input
                      type="text"
                      value={config.header.logo.text}
                      onChange={(e) => updateHeaderLogo('text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="E-Commerce"
                    />
                  </div>
                )}

                {/* Image Logo Configuration */}
                {config.header.logo.useImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Image
                    </label>
                    
                    {/* Current Logo Preview */}
                    {config.header.logo.image && (
                      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                        <img 
                          src={config.header.logo.image} 
                          alt="Current logo" 
                          className="h-12 max-w-48 object-contain"
                        />
                      </div>
                    )}

                    {/* Upload Interface */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      
                      {config.header.logo.image && (
                        <button
                          onClick={() => {
                            updateHeaderLogo('image', '')
                            updateHeaderLogo('useImage', false)
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: PNG or JPG, max 2MB, transparent background preferred
                    </p>
                  </div>
                )}
                
                {/* Logo Link (for both types) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Link (where logo clicks go)
                  </label>
                  <input
                    type="text"
                    value={config.header.logo.href}
                    onChange={(e) => updateHeaderLogo('href', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="/"
                  />
                </div>

                {/* Logo Preview */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex items-center">
                    {config.header.logo.useImage && config.header.logo.image ? (
                      <img 
                        src={config.header.logo.image} 
                        alt="Logo preview" 
                        className="h-8 max-w-32 object-contain"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary-600">
                        {config.header.logo.text || 'E-Commerce'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Header Banner</h2>
              <p className="text-sm text-gray-600 mb-4">
                This banner appears at the very top of your site (above the header)
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Message
                  </label>
                  <input
                    type="text"
                    value={config.header.banner.text}
                    onChange={(e) => updateHeaderBanner('text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Free shipping on orders over $50! Use code FREESHIP"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={config.header.banner.isActive}
                    onChange={(e) => updateHeaderBanner('isActive', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="banner-active" className="ml-2 block text-sm text-gray-700">
                    Show banner on site
                  </label>
                </div>
              </div>

              {/* Preview */}
              {config.header.banner.isActive && config.header.banner.text && (
                <div className="mt-4 p-3 bg-primary-600 text-white text-center text-sm rounded-lg">
                  <strong>Preview:</strong> {config.header.banner.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secondary Navigation Tab */}
        {activeTab === 'secondary' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Secondary Navigation</h2>
              <button
                onClick={addSecondaryNavItem}
                className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {config.secondaryNav.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateSecondaryNav(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Item name"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateSecondaryNav(index, 'href', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Link URL"
                    />
                  </div>
                  <button
                    onClick={() => updateSecondaryNav(index, 'isActive', !item.isActive)}
                    className={`p-2 rounded-lg ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeSecondaryNavItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Navigation Tab */}
        {activeTab === 'primary' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Primary Navigation (Categories)</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={replacePrimaryNavWithCategories}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Replace with Categories
                </button>
                <button
                  type="button"
                  onClick={clearPrimaryNav}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/categories')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Categories
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {config.primaryNav.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4 p-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updatePrimaryNav(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Category name"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => updatePrimaryNav(index, 'href', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Link URL"
                      />
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => movePrimaryNavItem(index, -1)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePrimaryNavItem(index, 1)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => updatePrimaryNav(index, 'isActive', !item.isActive)}
                      className={`p-2 rounded-lg ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePrimaryNavItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Below-row expand toggle and Subcategories */}
                  {item.children && item.children.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(index)}
                          className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                          aria-label={expandedItems.has(index) ? 'Collapse subcategories' : 'Expand subcategories'}
                          aria-expanded={expandedItems.has(index)}
                        >
                          {expandedItems.has(index) ? (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" /> Hide subcategories
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4 mr-2" /> Show subcategories
                            </>
                          )}
                        </button>
                      </div>
                      {expandedItems.has(index) && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Subcategories</h4>
                          <div className="space-y-2">
                            {item.children.map((child, childIndex) => (
                              <div key={childIndex} className="flex items-center space-x-4 pl-6">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={child.name}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    placeholder="Subcategory name"
                                    readOnly
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={child.href}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    placeholder="Link URL"
                                    readOnly
                                  />
                                </div>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!config) return
                                      const newPrimary = [...config.primaryNav]
                                      const children = [...(newPrimary[index].children || [])]
                                      if (childIndex - 1 < 0) return
                                      ;[children[childIndex - 1], children[childIndex]] = [children[childIndex], children[childIndex - 1]]
                                      newPrimary[index] = { ...newPrimary[index], children }
                                      setConfig({ ...config, primaryNav: newPrimary })
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                                    aria-label="Move child up"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!config) return
                                      const newPrimary = [...config.primaryNav]
                                      const children = [...(newPrimary[index].children || [])]
                                      if (childIndex + 1 >= children.length) return
                                      ;[children[childIndex + 1], children[childIndex]] = [children[childIndex], children[childIndex + 1]]
                                      newPrimary[index] = { ...newPrimary[index], children }
                                      setConfig({ ...config, primaryNav: newPrimary })
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                                    aria-label="Move child down"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  child.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {child.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
