import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'
import Navigation, { INavigationConfig } from '@/lib/models/Navigation'

// GET - Fetch current navigation configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get stored navigation config
    let navigationConfig = await Navigation.findOne()

    if (!navigationConfig) {
      // Create default navigation config if none exists
      const categories = await Category.find({ isActive: true, parent: null })
        .populate('children')
        .sort({ name: 1 })

      navigationConfig = new Navigation({
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
          ...categories.map(category => ({
            name: category.name,
            href: `/categories/${category.slug}`,
            categoryId: category._id.toString(),
            isActive: category.isActive,
            children: category.children?.map((child: any) => ({
              name: child.name,
              href: `/categories/${child.slug}`,
              categoryId: child._id.toString(),
              isActive: child.isActive
            })) || []
          }))
        ]
      })

      await navigationConfig.save()
    } else {
      // Update primary navigation with latest categories
      const categories = await Category.find({ isActive: true, parent: null })
        .populate('children')
        .sort({ name: 1 })

      // Keep existing primary nav items, but sync with categories
      const categoryNavItems = categories.map(category => ({
        name: category.name,
        href: `/categories/${category.slug}`,
        categoryId: category._id.toString(),
        isActive: category.isActive,
        children: category.children?.map((child: any) => ({
          name: child.name,
          href: `/categories/${child.slug}`,
          categoryId: child._id.toString(),
          isActive: child.isActive
        })) || []
      }))

      // Update primary nav while preserving non-category items
      navigationConfig.primaryNav = [
        ...navigationConfig.primaryNav.filter(item => !item.categoryId),
        ...categoryNavItems
      ]
    }

    return NextResponse.json(navigationConfig)
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

    // Update or create navigation config
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

    // Update categories based on primary navigation changes
    try {
      for (const navItem of navigationConfig.primaryNav) {
        if (navItem.categoryId) {
          await Category.findByIdAndUpdate(navItem.categoryId, {
            name: navItem.name,
            isActive: navItem.isActive
          })

          // Update children if they exist
          if (navItem.children) {
            for (const child of navItem.children) {
              if (child.categoryId) {
                await Category.findByIdAndUpdate(child.categoryId, {
                  name: child.name,
                  isActive: child.isActive
                })
              }
            }
          }
        }
      }
    } catch (categoryError) {
      console.warn('⚠️ Category update failed:', categoryError)
      // Don't fail the whole request if category updates fail
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
