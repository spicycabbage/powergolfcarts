'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/SearchBar'

type NavigationItem = {
  name: string
  href: string
  categoryId?: string
  isActive?: boolean
  children?: NavigationItem[]
}

type NavigationConfig = {
  header: {
    logo: { text: string; href: string; image?: string; useImage: boolean }
    banner?: { text: string; isActive: boolean }
  }
  secondaryNav: NavigationItem[]
  primaryNav: NavigationItem[]
}

export function Header({ initialNavigation }: { initialNavigation?: NavigationConfig }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Prevent hydration mismatch for auth state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize from server-provided navigation when available
  const [logo, setLogo] = useState<{ text: string; href: string; image?: string; useImage: boolean }>(
    initialNavigation?.header?.logo || { text: 'E-Commerce', href: '/', image: '', useImage: false }
  )
  const [secondaryNav, setSecondaryNav] = useState<Array<{ name: string; href: string; isActive?: boolean }>>(
    Array.isArray(initialNavigation?.secondaryNav)
      ? initialNavigation!.secondaryNav
      : [
          { name: 'About Us', href: '/about' },
          { name: 'FAQ', href: '/faq' },
          { name: 'Blog', href: '/blog' },
          { name: 'Contact Us', href: '/contact' }
        ]
  )
  const [primaryNav, setPrimaryNav] = useState<Array<{ name: string; href: string; isActive?: boolean }>>(
    Array.isArray(initialNavigation?.primaryNav) ? initialNavigation!.primaryNav : []
  )

  useEffect(() => {
    if (initialNavigation) return
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/navigation')
        if (res.ok) {
          const data = await res.json()
          const hdr = data?.header?.logo
          if (isMounted && hdr) {
            setLogo({
              text: hdr.text || 'E-Commerce',
              href: hdr.href || '/',
              image: hdr.image || '',
              useImage: !!hdr.useImage,
            })
          }
          if (isMounted) {
            setSecondaryNav(Array.isArray(data?.secondaryNav) ? data.secondaryNav : [])
            setPrimaryNav(Array.isArray(data?.primaryNav) ? data.primaryNav : [])
          }
        }
      } catch (_) {
        // keep existing defaults
      }
    })()
    return () => {
      isMounted = false
    }
  }, [initialNavigation])

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" itemScope itemType="https://schema.org/WebSite">
      {/* Secondary Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <nav className="hidden md:flex space-x-6">
              {secondaryNav.filter(l => l.isActive !== false).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {mounted ? (
                !isLoading && user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link
                      href="/account"
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center"
                    >
                      <User size={16} className="mr-1" />
                      {user.firstName}
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  isLoading ? (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link
                        href="/auth/login"
                        className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
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
                  )
                )
              ) : (
                // Placeholder during hydration to prevent layout shift
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-4 bg-transparent"></div>
                  <div className="w-12 h-4 bg-transparent"></div>
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
          <Link href={logo.href || '/'} className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
            {logo.useImage && logo.image ? (
              <img src={logo.image} alt={logo.text || 'Logo'} className="h-8 max-w-48 object-contain" />
            ) : (
              <div className="text-2xl font-bold text-primary-600">{logo.text || 'E-Commerce'}</div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {primaryNav
              .filter(l => l.isActive !== false)
              .map((link, i) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setOpenIndex(i)}
                  onMouseLeave={() => setOpenIndex(prev => (prev === i ? null : prev))}
                >
                  <Link
                    href={link.href}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center"
                  >
                    {link.name}
                    {Array.isArray((link as any).children) && (link as any).children.length > 0 && (
                      <ChevronDown 
                        size={16} 
                        className={`ml-1 transition-transform duration-200 ${
                          openIndex === i ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </Link>
                  {Array.isArray((link as any).children) && (link as any).children.length > 0 && (
                    <div className={`absolute left-0 top-full z-50 ${openIndex === i ? '' : 'hidden'}`}>
                      <div className="pt-2 bg-transparent">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                          {(link as any).children.map((child: any) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </nav>

          {/* Search, Cart, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={handleSearchToggle}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

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
              {primaryNav
                .filter(l => l.isActive !== false)
                .map((link) => (
                  <div key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                      {Array.isArray((link as any).children) && (link as any).children.length > 0 && (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </Link>
                    {Array.isArray((link as any).children) && (link as any).children.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {(link as any).children.map((child: any) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </nav>

            <div className="border-t border-gray-200 pt-4">
              <nav className="space-y-2">
                {secondaryNav.filter(l => l.isActive !== false).map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile User Account Options - Only show when user is logged in */}
                {mounted && !isLoading && user && (
                  <>
                    <Link
                      href="/account"
                      className="block text-gray-600 hover:text-primary-600 transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      {user.firstName}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar Modal */}
      <SearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  )
}



