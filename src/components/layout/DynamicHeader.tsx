'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

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
    }
  }
  secondaryNav: NavigationItem[]
  primaryNav: NavigationItem[]
}

export function DynamicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [config, setConfig] = useState<NavigationConfig | null>(null)
  const { cart } = useCart()
  const { user, logout } = useAuth()

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/navigation')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        throw new Error('Failed to fetch navigation')
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error)
      // Fallback to default navigation
      setConfig({
        header: {
          logo: { text: 'E-Commerce', href: '/' }
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
          { name: 'Home & Garden', href: '/categories/home', isActive: true },
          { name: 'Sports', href: '/categories/sports', isActive: true }
        ]
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  if (!config) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="animate-pulse text-gray-400">Loading navigation...</div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Secondary Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <nav className="hidden md:flex space-x-6">
              {config.secondaryNav.filter(item => item.isActive).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/account"
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center"
                  >
                    <User size={16} className="mr-1" />
                    {user.firstName}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/navigation"
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={config.header.logo.href} className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary-600">{config.header.logo.text}</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {config.primaryNav.filter(item => item.isActive).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search, Cart, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <form onSubmit={handleSearch}>
                    <div className="flex">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors"
                      >
                        <Search size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <nav className="space-y-2">
              {config.primaryNav.filter(item => item.isActive).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-200 pt-4">
              <nav className="space-y-2">
                {config.secondaryNav.filter(item => item.isActive).map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
