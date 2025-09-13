'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, ChevronDown, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/SearchBar'

interface NavItem {
  name: string
  href: string
  children?: NavItem[]
}

export function SimpleHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Throttled scroll handler for better performance
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  // Hardcoded navigation structure
  const secondaryNav = [
    { name: 'About Us', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' }
  ]

  const primaryNav = [
    { 
      name: 'Flowers', 
      href: '/categories/flowers',
      children: [
        { name: 'Indica', href: '/categories/indica' },
        { name: 'Sativa', href: '/categories/sativa' },
        { name: 'Hybrid', href: '/categories/hybrid' },
        { name: 'AAA', href: '/categories/aaa'}
      ]
    },
    { 
      name: 'Concentrates', 
      href: '/categories/concentrates',
      children: [
        { name: 'Shatter', href: '/categories/shatter' },
        { name: 'Wax', href: '/categories/wax' },
        { name: 'Live Resin', href: '/categories/live-resin' }
      ]
    },
    { 
      name: 'Edibles', 
      href: '/categories/edibles',
      children: [
        { name: 'Gummies', href: '/categories/gummies' }
      ]
    },
    { name: 'Hash', href: '/categories/hash' },
    { name: 'CBD', href: '/categories/cbd' }
      ]

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Announcement Bar - Smooth height transition */}
      <div 
        className={`bg-primary-600 text-white text-center text-sm overflow-hidden transition-all duration-500 ease-in-out ${
          isScrolled ? 'max-h-0 py-0' : 'max-h-12 py-2'
        }`}
      >
        <p className={`transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
          Free shipping for orders over $175
        </p>
      </div>
      
      {/* Secondary Nav - Smooth height transition */}
      <div 
        className={`bg-gray-50 border-b text-sm overflow-hidden transition-all duration-500 ease-in-out ${
          isScrolled ? 'max-h-0 py-0' : 'max-h-16 py-2'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 flex justify-between items-center transition-all duration-500 ease-in-out ${
          isScrolled ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'
        }`}>
          <div className="hidden md:flex space-x-4">
            {secondaryNav.map((link) => (
              <Link key={link.name} href={link.href} className="text-gray-600 hover:text-gray-900">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            {mounted && !isLoading && user ? (
              <>
                <Link href="/account" className="text-gray-600 hover:text-gray-900">My Account</Link>
                <button onClick={logout} className="text-gray-600 hover:text-gray-900">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link href="/auth/register" className="text-gray-600 hover:text-gray-900">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Always visible when header is sticky */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="text-2xl font-bold text-primary-600">Godbud.cc</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {primaryNav.map((link, i) => (
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
                  {link.children && link.children.length > 0 && (
                    <ChevronDown 
                      size={16} 
                      className={`ml-1 transition-transform duration-200 ${
                        openIndex === i ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </Link>
                {link.children && link.children.length > 0 && (
                  <div className={`absolute left-0 top-full z-50 ${openIndex === i ? '' : 'hidden'}`}>
                    <div className="pt-2 bg-transparent">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                        {link.children.map((child) => (
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

          {/* Search, Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="text-gray-700 hover:text-primary-600"
            aria-label="Open search"
          >
            <Search className="w-6 h-6" />
          </button>
            
            <Link href="/cart" className="relative" aria-label={`Shopping cart with ${cartItemCount} items`}>
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <button 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Inside sticky container */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="px-4 py-2 space-y-2">
              {primaryNav.map((link) => (
                <div key={link.name}>
                  <Link href={link.href} className="block py-2 text-gray-700 font-medium">
                    {link.name}
                  </Link>
                  {link.children && link.children.map((child) => (
                    <Link key={child.name} href={child.href} className="block py-1 pl-4 text-gray-600 text-sm">
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="border-t pt-2 md:hidden">
                {secondaryNav.map((link) => (
                  <Link key={link.name} href={link.href} className="block py-2 text-gray-700">
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Search Modal */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
