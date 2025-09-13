import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'
import Product from '@/lib/models/Product'

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { code, cartItems } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, error: 'Cart items are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Validate coupon
    const validation = await Coupon.validateCoupon(
      code,
      session?.user?.id || '',
      cartItems
    )

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    const coupon = validation.coupon

    // Calculate applicable amount based on coupon restrictions
    let applicableAmount = 0
    const cartSubtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    // Check minimum order amount
    if (coupon.minimumOrderAmount && cartSubtotal < coupon.minimumOrderAmount) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of $${coupon.minimumOrderAmount.toFixed(2)} required`
      }, { status: 400 })
    }

    // If no restrictions, apply to entire cart
    if ((!coupon.applicableCategories || coupon.applicableCategories.length === 0) &&
        (!coupon.applicableProducts || coupon.applicableProducts.length === 0)) {
      applicableAmount = cartSubtotal
    } else {
      // Calculate applicable amount based on restrictions
      for (const item of cartItems) {
        let itemApplicable = false

        // Check if product is specifically included
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          itemApplicable = coupon.applicableProducts.some((pid: any) => 
            String(pid) === String(item.product._id || item.product)
          )
        }

        // Check if product is in applicable categories
        if (!itemApplicable && coupon.applicableCategories && coupon.applicableCategories.length > 0) {
          const product = await Product.findById(item.product._id || item.product)
            .populate('categories')
            .lean()
          
          if (product) {
            const productCategories = [product.category, ...(product.categories || [])]
            itemApplicable = coupon.applicableCategories.some((catId: any) =>
              productCategories.some((pCat: any) => String(pCat) === String(catId))
            )
          }
        }

        // Check if product is excluded
        if (itemApplicable) {
          // Check excluded products
          if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
            const isExcluded = coupon.excludedProducts.some((pid: any) =>
              String(pid) === String(item.product._id || item.product)
            )
            if (isExcluded) itemApplicable = false
          }

          // Check excluded categories
          if (itemApplicable && coupon.excludedCategories && coupon.excludedCategories.length > 0) {
            const product = await Product.findById(item.product._id || item.product)
              .populate('categories')
              .lean()
            
            if (product) {
              const productCategories = [product.category, ...(product.categories || [])]
              const isExcluded = coupon.excludedCategories.some((catId: any) =>
                productCategories.some((pCat: any) => String(pCat) === String(catId))
              )
              if (isExcluded) itemApplicable = false
            }
          }
        }

        if (itemApplicable) {
          applicableAmount += item.price * item.quantity
        }
      }
    }

    if (applicableAmount === 0) {
      return NextResponse.json({
        success: false,
        error: 'This coupon is not applicable to any items in your cart'
      }, { status: 400 })
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartSubtotal, applicableAmount)

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        discount,
        applicableAmount,
        minimumOrderAmount: coupon.minimumOrderAmount
      }
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
