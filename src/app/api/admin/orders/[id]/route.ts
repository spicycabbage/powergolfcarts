import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import { sendEmail } from '@/lib/email'
import { buildOrderCompleteEmail } from '@/lib/emailTemplates'
import Order from '@/lib/models/Order'
import Product from '@/lib/models/Product'
import User from '@/lib/models/User'
import LoyaltyConfig from '@/lib/models/LoyaltyConfig'

// Helper function to deduct inventory when order is completed
async function deductInventory(orderItems: any[]) {
  console.log('📦 Deducting inventory for order completion...')
  
  for (const it of orderItems) {
    try {
      const product: any = await Product.findById(it.product)
      if (!product) {
        console.log(`⚠️ Product not found for ID: ${it.product}`)
        continue
      }
      const qty = Number(it.quantity || 0)
      if (qty <= 0) continue

      console.log(`📦 Processing inventory for: ${product.name}, Qty: ${qty}`)

      if (Array.isArray(product.variants) && product.variants.length > 0 && it.variant) {
        const v = it.variant || {}
        let idx = -1
        if (v._id) idx = product.variants.findIndex((pv: any) => String(pv?._id) === String(v._id))
        if (idx < 0 && v.sku) idx = product.variants.findIndex((pv: any) => String(pv?.sku || '').toLowerCase() === String(v.sku).toLowerCase())
        if (idx < 0 && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
        if (idx < 0 && v.name && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.name || '').trim().toLowerCase() === String(v.name).trim().toLowerCase() && String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
        
        if (idx >= 0) {
          const cur = Number(product.variants[idx].inventory || 0)
          const newInventory = Math.max(0, cur - qty)
          console.log(`✅ Found variant at index ${idx}, SKU: ${product.variants[idx].sku}, Current: ${cur}, New: ${newInventory}`)
          product.variants[idx].inventory = newInventory
          product.markModified('variants')
        } else {
          console.log(`❌ No matching variant found for:`, v)
        }
      } else {
        console.log(`📦 Using product-level inventory`)
        if (!product.inventory) {
          product.inventory = { quantity: 0, lowStockThreshold: 5, sku: '', trackInventory: true } as any
        }
        if (product.inventory.trackInventory !== false) {
          const cur = Number(product.inventory.quantity || 0)
          const newInventory = Math.max(0, cur - qty)
          console.log(`✅ Product inventory - Current: ${cur}, New: ${newInventory}`)
          product.inventory.quantity = newInventory
        }
      }
      await product.save()
    } catch (error) {
      console.error(`❌ Error deducting inventory for item:`, error)
    }
  }
}

// Helper function to restore inventory when order is cancelled/pending
async function restoreInventory(orderItems: any[]) {
  console.log('🔄 Restoring inventory for order cancellation/pending...')
  
  for (const it of orderItems) {
    try {
      const product: any = await Product.findById(it.product)
      if (!product) continue
      const qty = Number(it.quantity || 0)
      if (qty <= 0) continue

      if (Array.isArray(product.variants) && product.variants.length > 0 && it.variant) {
        const v = it.variant || {}
        let idx = -1
        if (v._id) idx = product.variants.findIndex((pv: any) => String(pv?._id) === String(v._id))
        if (idx < 0 && v.sku) idx = product.variants.findIndex((pv: any) => String(pv?.sku || '').toLowerCase() === String(v.sku).toLowerCase())
        if (idx < 0 && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
        if (idx < 0 && v.name && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.name || '').trim().toLowerCase() === String(v.name).trim().toLowerCase() && String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
        
        if (idx >= 0) {
          const cur = Number(product.variants[idx].inventory || 0)
          const newInventory = cur + qty
          console.log(`✅ Restoring variant inventory - SKU: ${product.variants[idx].sku}, Current: ${cur}, New: ${newInventory}`)
          product.variants[idx].inventory = newInventory
          product.markModified('variants')
        }
      } else {
        if (!product.inventory) {
          product.inventory = { quantity: 0, lowStockThreshold: 5, sku: '', trackInventory: true } as any
        }
        if (product.inventory.trackInventory !== false) {
          const cur = Number(product.inventory.quantity || 0)
          const newInventory = cur + qty
          console.log(`✅ Restoring product inventory - Current: ${cur}, New: ${newInventory}`)
          product.inventory.quantity = newInventory
        }
      }
      await product.save()
    } catch (error) {
      console.error(`❌ Error restoring inventory for item:`, error)
    }
  }
}

// Helper function to remove loyalty points when order is cancelled/pending
async function removeLoyaltyPoints(order: any) {
  try {
    if (order.loyaltyPointsAwarded && order.loyaltyPoints && order.user) {
      const user = await User.findById(order.user)
      if (user) {
        const pointsToRemove = Number(order.loyaltyPoints || 0)
        const currentPoints = Number(user.loyaltyPoints || 0)
        const newPoints = Math.max(0, currentPoints - pointsToRemove)
        user.loyaltyPoints = newPoints
        await user.save()
        
        // Reset order loyalty tracking
        order.loyaltyPointsAwarded = false
        order.loyaltyPoints = 0
      }
    }
    
    // Also revert any referral points
    const Referral = (await import('../../../../../models/Referral')).default
    const referrals = await Referral.find({ order: order._id, status: 'awarded' })
    
    for (const referral of referrals) {
      const referrerUser = await User.findById(referral.referrer)
      if (referrerUser) {
        const pointsToRemove = Number(referral.loyaltyPointsAwarded || 0)
        const currentPoints = Number(referrerUser.loyaltyPoints || 0)
        const newPoints = Math.max(0, currentPoints - pointsToRemove)
        referrerUser.loyaltyPoints = newPoints
        await referrerUser.save()
        
        // Mark referral as cancelled
        referral.status = 'cancelled'
        await referral.save()
        
        // Also update referral relationship stats if this was from a permanent relationship
        if (referral.metadata?.source === 'permanent_relationship' || referral.metadata?.source === 'permanent_relationship_manual_fix') {
          try {
            const ReferralRelationship = (await import('../../../../../models/ReferralRelationship')).default
            await ReferralRelationship.updateOne(
              { referrer: referral.referrer, referred: referral.referred },
              { 
                $inc: { 
                  totalOrders: -1,
                  totalPointsAwarded: -pointsToRemove,
                  totalOrderValue: -(referral.orderTotal || 0)
                }
              }
            )
          } catch (relationshipError) {
            console.error('❌ Error updating relationship stats:', relationshipError)
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error removing loyalty points:', error)
  }
}

// Unified function to handle all referral processing for order completion
async function processOrderReferrals(order: any) {
  console.log(`🔄 Processing referrals for order completion... Order #${order.invoiceNumber}`)
  
  try {
    const Referral = (await import('../../../../../models/Referral')).default
    const ReferralRelationship = (await import('../../../../../models/ReferralRelationship')).default
    const ReferralSettings = (await import('../../../../../models/ReferralSettings')).default
    
    // Check if referral records already exist for this order
    const existingReferrals = await Referral.find({ order: order._id })
    
    if (existingReferrals.length > 0) {
      // Scenario 1: Reactivate existing cancelled referrals
      console.log(`🔍 Found ${existingReferrals.length} existing referral records`)
      
      const cancelledReferrals = existingReferrals.filter(ref => ref.status === 'cancelled')
      console.log(`🔄 Reactivating ${cancelledReferrals.length} cancelled referrals`)
      
      for (const referral of cancelledReferrals) {
        const referrerUser = await User.findById(referral.referrer)
        if (referrerUser) {
          const pointsToAward = Number(referral.loyaltyPointsAwarded || 0)
          
          // Award points back to referrer
          referrerUser.loyaltyPoints = (referrerUser.loyaltyPoints || 0) + pointsToAward
          await referrerUser.save()
          
          // Reactivate referral record
          referral.status = 'awarded'
          referral.awardedAt = new Date()
          await referral.save()
          
          console.log(`✅ Reactivated referral: awarded ${pointsToAward} points to user ${referrerUser.email}`)
          
          // Update relationship stats
          if (referral.metadata?.source === 'permanent_relationship' || referral.metadata?.source === 'permanent_relationship_manual_fix') {
            try {
              await ReferralRelationship.updateOne(
                { referrer: referral.referrer, referred: referral.referred },
                { 
                  $inc: { 
                    totalOrders: 1,
                    totalPointsAwarded: pointsToAward,
                    totalOrderValue: (referral.orderTotal || 0)
                  }
                }
              )
              console.log(`✅ Updated relationship stats for reactivation`)
            } catch (relationshipError) {
              console.error('❌ Error updating relationship stats:', relationshipError)
            }
          }
        }
      }
    } else {
      // Scenario 2: Create new referrals for first-time completion
      console.log(`🆕 No existing referrals found - checking for permanent relationships`)
      
      const relationship = await ReferralRelationship.findActiveRelationship(order.user)
      
      if (relationship) {
        console.log(`✅ Found permanent relationship: ${relationship.referralCode}`)
        const settings = await ReferralSettings.getCurrentSettings()
        
        if (settings.isActive) {
          // Calculate points for this order
          const base = Number(order.subtotal || 0)
          const bundleDiscount = Number(order.bundleDiscount || 0)
          const actualAmountSpent = Math.max(0, base - bundleDiscount)
          
          if (actualAmountSpent >= settings.minimumOrderAmount) {
            const loyaltyPointsAwarded = Math.min(
              Math.floor(actualAmountSpent * settings.pointsPerDollarSpent),
              settings.maxPointsPerReferral || Infinity
            )
            
            if (loyaltyPointsAwarded > 0) {
              // Award points to referrer
              const referrer = await User.findById(relationship.referrer._id)
              if (referrer) {
                referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + loyaltyPointsAwarded
                await referrer.save()
                
                // Update relationship stats
                await relationship.updateStats(actualAmountSpent, loyaltyPointsAwarded)
                
                // Create referral record
                await Referral.create({
                  referrer: relationship.referrer._id,
                  referred: order.user,
                  referralCode: relationship.referralCode,
                  referredEmail: relationship.referredEmail,
                  order: order._id,
                  orderTotal: actualAmountSpent,
                  loyaltyPointsAwarded,
                  pointsPerDollarSpent: settings.pointsPerDollarSpent,
                  status: 'awarded',
                  referralUsedAt: new Date(),
                  awardedAt: new Date(),
                  metadata: {
                    source: 'permanent_relationship',
                    relationshipId: relationship._id
                  }
                })
                
                console.log(`✅ Created new permanent referral: ${relationship.referralCode} earned ${loyaltyPointsAwarded} points for order #${order.invoiceNumber}`)
              }
            }
          }
        }
      } else {
        console.log(`ℹ️ No permanent relationship found for user ${order.user}`)
      }
    }
  } catch (error) {
    console.error('❌ Error processing referrals:', error)
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const order = await Order.findById(id)
      .populate({ path: 'items.product', select: 'name slug price images variants inventory' })
      .populate({ path: 'user', select: 'email firstName lastName' })
      .lean()

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (e) {
    console.error('Admin get order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await request.json()
    const nextStatus = body?.status != null ? String(body.status).toLowerCase() : undefined
    const allowed = ['pending','cancelled','completed','processing','shipped','delivered','refunded']
    if (nextStatus && !allowed.includes(nextStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }
    const order: any = await Order.findById(id)
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    const oldStatus = order.status
    
    // Handle status changes with inventory and loyalty point management
    if (nextStatus && nextStatus !== oldStatus) {
      console.log(`📋 Order status change: ${oldStatus} → ${nextStatus}`)
      
      // Case 1: Going TO "completed" FROM "pending" or "cancelled"
      if (nextStatus === 'completed' && (oldStatus === 'pending' || oldStatus === 'cancelled')) {
        console.log('✅ Order being completed - deducting inventory')
        await deductInventory(order.items || [])
        
        // Process referrals for order completion (handles both new and reactivated referrals)
        try {
          await processOrderReferrals(order)
        } catch (referralError) {
          console.error('❌ Error in referral processing:', referralError)
        }
      }
      
      // Case 2: Going FROM "completed" TO "pending" or "cancelled" 
      if (oldStatus === 'completed' && (nextStatus === 'pending' || nextStatus === 'cancelled')) {
        console.log('🔄 Order being uncompleted - restoring inventory and removing loyalty points')
        await restoreInventory(order.items || [])
        await removeLoyaltyPoints(order)
      }
      
      // Case 3: Going TO "cancelled" FROM "pending" (no inventory to restore since it was never deducted)
      if (nextStatus === 'cancelled' && oldStatus === 'pending') {
        console.log('❌ Order cancelled from pending - removing loyalty points if awarded')
        await removeLoyaltyPoints(order)
      }
      
      order.status = nextStatus
    }

    // Backwards compatible single tracking fields
    if (typeof body?.trackingNumber === 'string') order.trackingNumber = body.trackingNumber
    if (typeof body?.trackingCarrier === 'string') order.trackingCarrier = body.trackingCarrier

    // Add tracking entry (supports multiple)
    const add = body?.addTracking
    if (add && typeof add?.carrier === 'string' && typeof add?.number === 'string') {
      const carrier = String(add.carrier).trim()
      const number = String(add.number).trim()
      if (carrier && number) {
        if (!Array.isArray((order as any).tracking)) (order as any).tracking = []
        const exists = (order as any).tracking.some((t: any) => String(t.carrier).toLowerCase() === carrier.toLowerCase() && String(t.number) === number)
        if (!exists) {
          ;(order as any).tracking.push({ carrier, number, createdAt: new Date() })
        }
        // also set the flat fields to the latest for compatibility
        order.trackingCarrier = carrier
        order.trackingNumber = number
      }
    }

    // Delete tracking entry
    const del = body?.deleteTracking
    if (del && (typeof del?.carrier === 'string' || typeof del?.number === 'string')) {
      const carrier = typeof del?.carrier === 'string' ? String(del.carrier) : undefined
      const number = typeof del?.number === 'string' ? String(del.number) : undefined
      if (Array.isArray((order as any).tracking) && (carrier || number)) {
        (order as any).tracking = (order as any).tracking.filter((t: any) => {
          const carrierMatch = carrier ? String(t.carrier).toLowerCase() === carrier.toLowerCase() : true
          const numberMatch = number ? String(t.number) === number : true
          return !(carrierMatch && numberMatch)
        })
      }
      // if no tracking entries remain, clear flat fields; or if we removed the active one
      const hasAny = Array.isArray((order as any).tracking) && (order as any).tracking.length > 0
      if (!hasAny) {
        order.trackingCarrier = undefined as any
        order.trackingNumber = undefined as any
      } else if (carrier && order.trackingCarrier && order.trackingCarrier.toLowerCase() === carrier.toLowerCase() && (!number || number === order.trackingNumber)) {
        const first = (order as any).tracking[0]
        order.trackingCarrier = first?.carrier
        order.trackingNumber = first?.number
      }
    }
    await order.save()

    // If status changed to completed, send email and award loyalty points (first time only)
    if (nextStatus === 'completed' && oldStatus !== 'completed') {
      try {
        // Re-load with details for email
        const fresh: any = await Order.findById(id)
          .populate({ path: 'user', select: 'email firstName lastName' })
          .populate({ path: 'items.product', select: 'name' })
          .lean()

        const to = String(fresh?.user?.email || fresh?.contactEmail || fresh?.shippingAddress?.email || '')
        if (to) {
          const firstName = String(fresh?.user?.firstName || '').trim() || 'Customer'
          const invoice = fresh?.invoiceNumber ?? fresh?._id
          const trackings: Array<{ carrier: string; number: string }> = Array.isArray(fresh?.tracking) && fresh.tracking.length > 0
            ? fresh.tracking.map((t: any) => ({ carrier: String(t?.carrier || ''), number: String(t?.number || '') }))
            : (fresh?.trackingCarrier && fresh?.trackingNumber ? [{ carrier: String(fresh.trackingCarrier), number: String(fresh.trackingNumber) }] : [])

          const trackingLinks = trackings.map(t => {
            const lc = t.carrier.toLowerCase()
            const nice = lc === 'canadapost' ? 'Canada Post' : (lc === 'purolator' ? 'Purolator' : t.carrier)
            const url = lc === 'canadapost'
              ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(t.number)}`
              : (lc === 'purolator' ? `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(t.number)}` : '')
            const text = url ? `<a href="${url}">${t.number}</a>` : t.number
            return `<div>${nice} ${text}</div>`
          }).join('') || '<div>No tracking available yet.</div>'

          const itemsHtml = (Array.isArray(fresh?.items) ? fresh.items : []).map((it: any) => {
            const name = it?.product?.name || it?.name || 'Item'
            const variant = it?.variant?.value ? ` (${it.variant.value})` : ''
            const qty = Number(it?.quantity || 0)
            const total = Number(it?.total || 0)
            return `<li>${name}${variant} x ${qty} — $${total.toFixed(2)}</li>`
          }).join('')

          const ship = fresh?.shippingAddress || {}
          const addressHtml = `
            <div>${ship.firstName || ''} ${ship.lastName || ''}</div>
            <div>${ship.address1 || ''}${ship.address2 ? ', ' + ship.address2 : ''}</div>
            <div>${ship.city || ''}, ${ship.state || ''} ${ship.postalCode || ''}</div>
            <div>${ship.country || ''}</div>
          `

          const html = buildOrderCompleteEmail({ ...fresh, tracking: trackings.map(t => ({ carrier: t.carrier, number: t.number })) })
          sendEmail(to, `Your Order #${invoice} is Complete`, html).catch(err => console.error('sendEmail error:', err))
        }
        // Award loyalty points
        try {
          const doc: any = await Order.findById(id)
          if (doc && !doc.loyaltyPointsAwarded) {
            const cfg = await LoyaltyConfig.findOne().lean()
            const rate = Number((cfg as any)?.pointsPerDollar ?? 1)
            const base = Number(doc.subtotal || 0)
            const bundleDiscount = Number(doc.bundleDiscount || 0)
            const couponDiscount = Number(doc?.coupon?.discount || 0)
            const spend = Math.max(0, base - bundleDiscount - couponDiscount)
            const points = Math.floor(spend * Number(rate))
            if (points > 0 && doc.user) {
              const user = await User.findById(doc.user)
              if (user) {
                user.loyaltyPoints = Math.max(0, Number(user.loyaltyPoints || 0) + points) as any
                await user.save()
                doc.loyaltyPoints = points as any
              } else {
                doc.loyaltyPoints = 0 as any
              }
            } else {
              doc.loyaltyPoints = 0 as any
            }
            doc.loyaltyPointsAwarded = true as any
            await doc.save()
          }
        } catch (e) {
          console.error('Loyalty award error:', e)
        }

        // Award referral points - check both pending referrals AND permanent relationships
        try {
          const Referral = (await import('../../../../../models/Referral')).default
          const ReferralRelationship = (await import('../../../../../models/ReferralRelationship')).default
          const ReferralSettings = (await import('../../../../../models/ReferralSettings')).default
          const User = (await import('@/lib/models/User')).default
          
          // First, process any pending one-time referrals (for backward compatibility)
          const pendingReferrals = await Referral.find({ 
            order: id, 
            status: 'pending' 
          })
          
          for (const referral of pendingReferrals) {
            await referral.awardLoyaltyPoints()
            console.log(`✅ One-time referral points awarded: ${referral.referralCode} earned ${referral.loyaltyPointsAwarded} points`)
          }
        } catch (e) {
          console.error('Referral award error:', e)
        }
      } catch (err) {
        console.error('Complete order email error:', err)
      }
    }

    // If status changed to cancelled, notify customer
    if (nextStatus === 'cancelled' && oldStatus !== 'cancelled') {
      try {
        const fresh: any = await Order.findById(id)
          .populate({ path: 'user', select: 'email firstName lastName' })
          .lean()
        const to = String(fresh?.user?.email || fresh?.contactEmail || fresh?.shippingAddress?.email || '')
        if (to) {
          const invoice = fresh?.invoiceNumber ?? fresh?._id
          const html = `
            <div>
              <h2>Order Cancelled</h2>
              <p>Your order <strong>#${invoice}</strong> has been cancelled.</p>
              <p>We have not received a payment for this order so we assume it's no longer wanted. If you still wish to keep this order, please respond to this email. Thanks.</p>
              <div style="margin-top:16px;color:#6b7280;font-size:12px;">
                Thank you for shopping at <a href="https://www.godbud.cc">www.godbud.cc</a><br/>
                Member of the Canada Kush network.
              </div>
            </div>
          `
          await sendEmail(to, `Order #${invoice} Cancelled`, html)
        }
      } catch (err) {
        console.error('Cancel order email error:', err)
      }
    }

    const result = order.toObject ? (order as any).toObject() : order
    return NextResponse.json({ success: true, data: {
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingCarrier: order.trackingCarrier,
      tracking: (result && result.tracking) || []
    } })
  } catch (e: any) {
    console.error('Admin update order error:', e)
    return NextResponse.json({ success: false, error: process.env.NODE_ENV !== 'production' ? (e?.message || 'Failed to update order') : 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    await Order.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin delete order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 })
  }
}


