'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/SearchBar'

export function SimpleHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { cart } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Add hysteresis to prevent flickering
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        if (currentScrollY > 120) setIsScrolled(true)
      } else {
        // Scrolling up
        if (currentScrollY < 80) setIsScrolled(false)
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className={`bg-black sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      {/* Announcement Bar */}
      <div className={`bg-primary-600 text-white text-center text-sm transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'py-2'}`}>
        <p>Free shipping for orders over $175</p>
      </div>
      
      {/* Secondary Navigation */}
      <div className={`bg-gray-50 border-b border-gray-200 text-sm transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <nav className="hidden md:flex space-x-6">
            <Link href="/about" className="text-gray-700 hover:text-primary-600">About Us</Link>
            <Link href="/faq" className="text-gray-700 hover:text-primary-600">FAQ</Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600">Contact Us</Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/account" className="text-gray-600 hover:text-primary-600">My Account</Link>
                <button onClick={logout} className="text-gray-700 hover:text-primary-600">Logout</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">Sign In</Link>
                <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-yellow-500">
            Godbud.cc
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {/* Flowers Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('flowers')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/categories/flowers"
                className="text-white hover:text-primary-600 transition-colors font-medium flex items-center"
              >
                Flowers
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'flowers' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'flowers' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link href="/categories/indica" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Indica</Link>
                      <Link href="/categories/sativa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Sativa</Link>
                      <Link href="/categories/hybrid" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Hybrid</Link>
                      <Link href="/categories/aaa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">AAA</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Concentrates Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('concentrates')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/categories/concentrates"
                className="text-white hover:text-primary-600 transition-colors font-medium flex items-center"
              >
                Concentrates
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'concentrates' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'concentrates' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link href="/categories/shatters" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Shatters</Link>
                      <Link href="/categories/diamonds" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Diamonds</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edibles Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('edibles')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/categories/edibles"
                className="text-white hover:text-primary-600 transition-colors font-medium flex items-center"
              >
                Edibles
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'edibles' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'edibles' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link href="/categories/gummies" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Gummies</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hash - No Dropdown */}
            <Link href="/categories/hash" className="text-white hover:text-primary-600 transition-colors font-medium">Hash</Link>

            {/* CBD - No Dropdown */}
            <Link href="/categories/cbd" className="text-white hover:text-primary-600 transition-colors font-medium">CBD</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-white hover:text-primary-600"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 text-white hover:text-primary-600"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">
                {cartItemCount === 0 ? 'Shopping cart is empty' : `${cartItemCount} items in cart`}
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-primary-600"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-700">
          <div className="px-4 py-4 space-y-4">
            {/* Flowers */}
            <div>
              <Link href="/categories/flowers" className="block text-white hover:text-primary-600 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Flowers</Link>
              <div className="ml-4 space-y-1">
                <Link href="/categories/indica" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Indica</Link>
                <Link href="/categories/sativa" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Sativa</Link>
                <Link href="/categories/hybrid" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Hybrid</Link>
                <Link href="/categories/aaa" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>AAA</Link>
              </div>
            </div>

            {/* Concentrates */}
            <div>
              <Link href="/categories/concentrates" className="block text-white hover:text-primary-600 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Concentrates</Link>
              <div className="ml-4 space-y-1">
                <Link href="/categories/shatters" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Shatters</Link>
                <Link href="/categories/diamonds" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Diamonds</Link>
              </div>
            </div>

            {/* Edibles */}
            <div>
              <Link href="/categories/edibles" className="block text-white hover:text-primary-600 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Edibles</Link>
              <div className="ml-4 space-y-1">
                <Link href="/categories/gummies" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Gummies</Link>
              </div>
            </div>

            {/* Hash & CBD */}
            <Link href="/categories/hash" className="block text-white hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>Hash</Link>
            <Link href="/categories/cbd" className="block text-white hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>CBD</Link>
            
            <div className="border-t border-gray-700 pt-4">
              {user ? (
                <>
                  <Link href="/account" className="block text-white hover:text-primary-600 mb-2" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block text-white hover:text-primary-600">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block text-white hover:text-primary-600 mb-2" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link href="/auth/register" className="block text-white hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </>
              )}
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