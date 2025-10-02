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
          {/* Informational links (desktop only); moved to hamburger on mobile */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/about" className="text-gray-700 hover:text-primary-600">About Us</Link>
            <Link href="/faq" className="text-gray-700 hover:text-primary-600">FAQ</Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600">Contact Us</Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/account" className="text-gray-600 hover:text-primary-600">My Account</Link>
                <button onClick={logout} className="text-gray-700 hover:text-primary-600">Logout</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
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
          <Link href="/" className="flex items-center">
            <img 
              src="/power-golf-carts-black-2.jpg" 
              alt="Power Golf Carts" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {/* Golf Clubs Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('clubs')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/categories/golf-clubs"
                className="text-white hover:text-green-400 transition-colors font-medium flex items-center"
              >
                Golf Clubs
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'clubs' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'clubs' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link href="/categories/drivers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Drivers</Link>
                      <Link href="/categories/irons" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Irons</Link>
                      <Link href="/categories/putters" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Putters</Link>
                      <Link href="/categories/wedges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Wedges</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Golf Balls - No Dropdown */}
            <Link href="/categories/golf-balls" className="text-white hover:text-green-400 transition-colors font-medium">Golf Balls</Link>

            {/* Golf Bags - No Dropdown */}
            <Link href="/categories/golf-bags" className="text-white hover:text-green-400 transition-colors font-medium">Golf Bags</Link>

            {/* Accessories Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('accessories')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/categories/accessories"
                className="text-white hover:text-green-400 transition-colors font-medium flex items-center"
              >
                Accessories
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'accessories' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'accessories' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link href="/categories/gloves" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Gloves</Link>
                      <Link href="/categories/tees" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Tees</Link>
                      <Link href="/categories/towels" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">Towels</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Apparel - No Dropdown */}
            <Link href="/categories/apparel" className="text-white hover:text-green-400 transition-colors font-medium">Apparel</Link>

            {/* Bundles Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('bundles')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href="/bundles"
                className="text-white hover:text-green-400 transition-colors font-medium flex items-center"
              >
                Bundles
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    openDropdown === 'bundles' ? 'rotate-180' : ''
                  }`} 
                />
              </Link>
              {openDropdown === 'bundles' && (
                <div className="absolute left-0 top-full z-50">
                  <div className="pt-2 bg-transparent">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[240px]">
                      <Link href="/bundles/starter-set" className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">
                        <span>Starter Set</span>
                        <span className="text-green-600 font-medium">15% off</span>
                      </Link>
                      <Link href="/bundles/complete-set" className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">
                        <span>Complete Set</span>
                        <span className="text-green-600 font-medium">20% off</span>
                      </Link>
                      <Link href="/bundles/ball-pack" className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">
                        <span>Golf Ball Pack</span>
                        <span className="text-green-600 font-medium">10% off</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            {/* Golf Clubs */}
            <div>
              <Link href="/categories/golf-clubs" className="block text-white hover:text-green-400 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Golf Clubs</Link>
              <div className="ml-4 space-y-1">
                <Link href="/categories/drivers" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Drivers</Link>
                <Link href="/categories/irons" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Irons</Link>
                <Link href="/categories/putters" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Putters</Link>
                <Link href="/categories/wedges" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Wedges</Link>
              </div>
            </div>

            {/* Golf Balls & Bags */}
            <Link href="/categories/golf-balls" className="block text-white hover:text-green-400 font-medium" onClick={() => setIsMenuOpen(false)}>Golf Balls</Link>
            <Link href="/categories/golf-bags" className="block text-white hover:text-green-400 font-medium" onClick={() => setIsMenuOpen(false)}>Golf Bags</Link>

            {/* Accessories */}
            <div>
              <Link href="/categories/accessories" className="block text-white hover:text-green-400 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Accessories</Link>
              <div className="ml-4 space-y-1">
                <Link href="/categories/gloves" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Gloves</Link>
                <Link href="/categories/tees" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Tees</Link>
                <Link href="/categories/towels" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Towels</Link>
              </div>
            </div>

            {/* Apparel */}
            <Link href="/categories/apparel" className="block text-white hover:text-green-400 font-medium" onClick={() => setIsMenuOpen(false)}>Apparel</Link>

            {/* Bundles */}
            <div>
              <Link href="/bundles" className="block text-white hover:text-green-400 font-medium mb-2" onClick={() => setIsMenuOpen(false)}>Bundles</Link>
              <div className="ml-4 space-y-1">
                <Link href="/bundles/starter-set" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Starter Set | 15% off</Link>
                <Link href="/bundles/complete-set" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Complete Set | 20% off</Link>
                <Link href="/bundles/ball-pack" className="block text-sm text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Golf Ball Pack | 10% off</Link>
              </div>
            </div>

            {/* Info links under categories for mobile (ordered, large touch targets) */}
            <div className="pt-2 border-t border-gray-700 space-y-1">
              <Link href="/contact" className="block text-white/90 hover:text-white py-3" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
              <Link href="/about" className="block text-white/90 hover:text-white py-3" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              <Link href="/faq" className="block text-white/90 hover:text-white py-3" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
              <Link href="/blog" className="block text-white/90 hover:text-white py-3" onClick={() => setIsMenuOpen(false)}>Blog</Link>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              {user ? (
                <>
                  <Link href="/account" className="block text-white hover:text-primary-600 mb-2" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block text-white hover:text-primary-600">Logout</button>
                </>
              ) : null}
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