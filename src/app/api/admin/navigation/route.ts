import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Navigation, { INavigationConfig } from '@/lib/models/Navigation'
import { setNavigationConfig, clearNavigationConfig } from '@/lib/navigationStore'

// GET - Fetch current navigation configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Return stored navigation config only. Do NOT auto-sync with categories.
    const navigationConfig = await Navigation.findOne()

    if (navigationConfig) {
      return NextResponse.json(navigationConfig)
    }

    // If none exists, return a minimal default without persisting
    return NextResponse.json({
      header: {
        logo: { text: 'E-Commerce', href: '/', image: '', useImage: false },
        banner: { text: 'Free shipping on orders over $50! Use code FREESHIP', isActive: true }
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
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
  }
}

// PUT - Update navigation configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const navigationConfig: INavigationConfig = await request.json()
    console.log('📥 Received navigation config for update:', {
      hasHeader: !!navigationConfig.header,
      hasLogo: !!navigationConfig.header?.logo,
      logoFields: navigationConfig.header?.logo ? Object.keys(navigationConfig.header.logo) : [],
      logoUseImage: navigationConfig.header?.logo?.useImage,
      logoImageLength: navigationConfig.header?.logo?.image?.length || 0
    })

    await connectToDatabase()

    // Validate the navigation config structure
    if (!navigationConfig.header || !navigationConfig.header.logo) {
      return NextResponse.json({ error: 'Invalid navigation configuration: missing header or logo' }, { status: 400 })
    }

    // Ensure logo has required fields
    const logoConfig = {
      text: navigationConfig.header.logo.text || 'E-Commerce',
      href: navigationConfig.header.logo.href || '/',
      image: navigationConfig.header.logo.image || '',
      useImage: navigationConfig.header.logo.useImage || false
    }

    // Prepare the update data
    const updateData = {
      header: {
        logo: logoConfig,
        banner: {
          text: navigationConfig.header.banner?.text || 'Free shipping on orders over $50! Use code FREESHIP',
          isActive: navigationConfig.header.banner?.isActive || false
        }
      },
      secondaryNav: navigationConfig.secondaryNav || [],
      primaryNav: navigationConfig.primaryNav || [],
      updatedAt: new Date()
    }

    console.log('💾 Updating with data:', {
      logoText: updateData.header.logo.text,
      logoUseImage: updateData.header.logo.useImage,
      logoImageLength: updateData.header.logo.image.length,
      bannerText: updateData.header.banner.text,
      bannerActive: updateData.header.banner.isActive
    })

    // Update or create navigation config (static; no category syncing)
    const updatedConfig = await Navigation.findOneAndUpdate(
      {},
      updateData,
      { 
        upsert: true, 
        new: true,
        runValidators: false // Disable validators to prevent schema conflicts
      }
    )
    
    console.log('✅ Navigation updated successfully')

    // Refresh in-memory cache immediately
    if (updatedConfig) {
      // Normalize to plain object for the cache
      const plain = updatedConfig.toObject ? updatedConfig.toObject() : updatedConfig
      setNavigationConfig(plain as INavigationConfig)
    } else {
      clearNavigationConfig()
    }

    return NextResponse.json({ 
      message: 'Navigation updated successfully',
      config: updatedConfig 
    })
  } catch (error) {
    console.error('❌ Navigation update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update navigation', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
