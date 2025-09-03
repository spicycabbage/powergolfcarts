import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Navigation from '@/lib/models/Navigation'

// Public navigation endpoint (no auth required)
export async function GET() {
  try {
    await connectToDatabase()

    // Get stored navigation config
    const navigationConfig = await Navigation.findOne()

    if (navigationConfig) {
      return NextResponse.json(navigationConfig)
    }

    // Return minimal navigation if none exists (no primary nav by default)
    return NextResponse.json({
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
      primaryNav: []
    })
  } catch (error) {
    console.error('Navigation fetch error:', error)
    
    // Return minimal navigation on error (no primary nav by default)
    return NextResponse.json({
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
      primaryNav: []
    })
  }
}
