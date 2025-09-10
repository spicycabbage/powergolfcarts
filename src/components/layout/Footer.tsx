'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const footerLinks = {
    shop: [
      { name: 'Shop All', href: '/categories' },
      { name: 'Flowers', href: '/categories/flowers' },
      { name: 'Concentrates', href: '/categories/concentrates' },
      { name: 'Hash', href: '/categories/hash' },
      { name: 'Edibles', href: '/categories/edibles' },
      { name: 'CBD', href: '/categories/cbd' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-conditions' }
    ]
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'YouTube', href: '#', icon: Youtube }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold text-white">E-Commerce</h2>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Your one-stop shop for quality products. We offer fast shipping,
              great customer service, and a wide variety of products to choose from.
            </p>

            {/* Newsletter Signup (client-only to avoid hydration mismatches from extensions) */}
            {mounted && (
              <div className="mb-6" suppressHydrationWarning>
                <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
                <form
                  className="flex flex-col sm:flex-row gap-2"
                  autoComplete="off"
                  data-lpignore="true"
                  data-lastpass-ignore="true"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    name="newsletter_email"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            )}

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Godbud.cc. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">We accept:</span>
                <div className="flex items-center space-x-2">
                  {/* Payment method icons would go here */}
                  <div className="w-8 h-5 bg-gray-600 rounded"></div>
                  <div className="w-8 h-5 bg-gray-600 rounded"></div>
                  <div className="w-8 h-5 bg-gray-600 rounded"></div>
                  <div className="w-8 h-5 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

