'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { SearchBar } from '@/components/SearchBar'

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { cart } = useCart()

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        if (currentScrollY > 120) setIsScrolled(true)
      } else {
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
        <p>Free shipping within USA</p>
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
            <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">Sign In</Link>
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-primary-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Power Golf Carts</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <div className="relative group">
              <Link href="/categories" className="text-white hover:text-primary-400 transition-colors inline-flex items-center">
                Shop
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <Link href="/brands" className="text-white hover:text-primary-400 transition-colors">Brands</Link>
            <Link href="/bundles" className="text-white hover:text-primary-400 transition-colors">Deals</Link>
            <Link href="/learn" className="text-white hover:text-primary-400 transition-colors">Learn</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-primary-400 transition-colors"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
            
            <Link href="/cart" className="relative text-white hover:text-primary-400 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-700 bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/about" className="block px-3 py-2 text-white hover:text-primary-400">About Us</Link>
            <Link href="/faq" className="block px-3 py-2 text-white hover:text-primary-400">FAQ</Link>
            <Link href="/blog" className="block px-3 py-2 text-white hover:text-primary-400">Blog</Link>
            <Link href="/contact" className="block px-3 py-2 text-white hover:text-primary-400">Contact Us</Link>
            <Link href="/categories" className="block px-3 py-2 text-white hover:text-primary-400">Shop</Link>
            <Link href="/brands" className="block px-3 py-2 text-white hover:text-primary-400">Brands</Link>
            <Link href="/bundles" className="block px-3 py-2 text-white hover:text-primary-400">Deals</Link>
            <Link href="/learn" className="block px-3 py-2 text-white hover:text-primary-400">Learn</Link>
          </div>
        </div>
      )}
    </header>
  )
}

