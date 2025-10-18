'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { calculateCartTotals } from '@/utils/cartCalculations'
import { useReferral } from '@/components/providers/ReferralProvider'
import CheckoutWithStripe from '@/components/checkout/CheckoutWithStripe'
import StripePaymentForm from '@/components/checkout/StripePaymentForm'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCart()
  const { data: session } = useSession()
  const { referralData } = useReferral()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })
  const [billing, setBilling] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingConfig, setShippingConfig] = useState<{
    methods: Array<{ name: string, price: number, freeThreshold?: number, sortOrder?: number, isActive?: boolean }>
  } | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Load applied coupon from sessionStorage
  useEffect(() => {
    try {
      const savedCoupon = sessionStorage.getItem('checkout_applied_coupon')
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon))
      }
    } catch {}
  }, [])

  const emailOk = /^\S+@\S+\.\S+$/.test(shipping.email)
  const shippingOk = shipping.firstName && shipping.lastName && emailOk && shipping.address1 && shipping.city && shipping.state && shipping.postalCode && shipping.country
  const billingOk = sameAsShipping || (billing.firstName && billing.lastName && billing.address1 && billing.city && billing.state && billing.postalCode && billing.country)
  const requiredOk = shippingOk && billingOk

  // Prefill email ASAP from session or prior checkout state
  useEffect(() => {
    // Session email wins if present
    if (session?.user?.email) {
      setShipping(s => ({ ...s, email: s.email || session.user.email! }))
      return
    }
    // Fallback to saved checkout shipping (if returning to checkout)
    try {
      const saved = sessionStorage.getItem('checkout_shipping')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.email) {
          setShipping(s => ({ ...s, email: s.email || parsed.email }))
        }
      }
    } catch {}
  }, [session])

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setLoading(true)
    setError(null)
    try {
      // Save shipping address as default if needed
      if (session?.user) {
        try {
          const res = await fetch('/api/user/addresses', { cache: 'no-store' })
          if (res.ok) {
            const addresses = await res.json().catch(() => [])
            const shippingAddresses = Array.isArray(addresses) ? addresses.filter((a: any) => a?.type === 'shipping') : []
            const hasShipping = shippingAddresses.length > 0
            const hasDefaultShipping = shippingAddresses.some((a: any) => a?.isDefault)
            if (!hasShipping || (hasShipping && !hasDefaultShipping)) {
              const countryFull = shipping.country === 'CA' ? 'Canada' : (shipping.country === 'US' ? 'United States' : shipping.country)
              await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'shipping',
                  firstName: shipping.firstName,
                  lastName: shipping.lastName,
                  company: '',
                  address1: shipping.address1,
                  address2: shipping.address2,
                  city: shipping.city,
                  state: shipping.state,
                  postalCode: shipping.postalCode,
                  country: countryFull,
                  phone: shipping.phone,
                  isDefault: true,
                })
              })
            }
          }
        } catch {}
      }

      // Prepare billing address
      const billingAddress = sameAsShipping ? {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address1: shipping.address1,
        address2: shipping.address2,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
      } : billing

      // Prepare order items
      const itemsForOrder = cart.items.map((it) => ({
        productId: it.product._id,
        name: it.product.name,
        slug: it.product.slug,
        price: Number(((it as any)?.variant?.price != null ? (it as any).variant.price : it.product.price) || 0),
        quantity: it.quantity,
        variant: it.variant ? { name: it.variant.name, value: it.variant.value, sku: it.variant.sku } : undefined,
      }))

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsForOrder,
          subtotal: displaySubtotal,
          bundleDiscount: displayBundleDiscount,
          couponDiscount,
          appliedCoupon,
          shipping: computedShippingCost,
          total: displayTotal,
          shippingAddress: shipping,
          billingAddress,
          customerEmail: shipping.email,
          referralData,
          stripePaymentIntentId: paymentIntentId,
        })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Clear cart and redirect to confirmation
      try {
        localStorage.removeItem('cart')
        sessionStorage.removeItem('checkout_shipping')
        sessionStorage.removeItem('checkout_selected_shipping')
        sessionStorage.removeItem('checkout_order_summary')
        sessionStorage.removeItem('checkout_items')
        sessionStorage.removeItem('checkout_applied_coupon')
        sessionStorage.removeItem('checkout_referral')
      } catch {}

      router.push(`/checkout/confirmation?order=${orderData.data.id}`)
    } catch (e: any) {
      setError(e?.message || 'Failed to create order')
      setLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const itemCount = cart.items.reduce((sum, it) => sum + it.quantity, 0)

  useEffect(() => {
    // Load dynamic shipping config for cart calculations
    ;(async () => {
      try {
        const res = await fetch('/api/shipping', { cache: 'no-store' })
        const json = await res.json().catch(() => ({} as any))
        const data = json?.data
        const activeMethods = (Array.isArray(data?.methods) ? data.methods : []).filter((m: any) => m?.isActive !== false)
        setShippingConfig({
          methods: activeMethods.map((m: any) => ({
            name: String(m.name || 'Method'),
            price: Number(m.price || 0),
            freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : undefined,
            sortOrder: m.sortOrder != null ? Number(m.sortOrder) : undefined,
            isActive: m.isActive !== false,
          }))
        })
        const defaultMethodPrice = activeMethods.length > 0 ? Number(activeMethods[0].price || 0) : undefined
        ;(globalThis as any).__shipping_config__ = {
          freeShippingThreshold: Number(data?.freeShippingThreshold ?? 50),
          defaultMethodPrice: typeof defaultMethodPrice === 'number' ? defaultMethodPrice : 9.99,
        }
      } catch {}
    })()

    // Auto-apply removed; do not preload from session storage
  }, [])

  // Auto-fill from existing default shipping address and session email
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/user/addresses', { cache: 'no-store' })
        if (!res.ok) return
        const addrs = await res.json()
        const shippingAddr = Array.isArray(addrs)
          ? (addrs.find((a: any) => a.type === 'shipping' && a.isDefault) || addrs.find((a: any) => a.type === 'shipping') || addrs[0])
          : null
        const emailFromSession = session?.user?.email || ''
        setShipping(s => ({
          ...s,
          firstName: shippingAddr?.firstName || s.firstName,
          lastName: shippingAddr?.lastName || s.lastName,
          email: emailFromSession || s.email,
          phone: shippingAddr?.phone || s.phone,
          address1: shippingAddr?.address1 || s.address1,
          address2: shippingAddr?.address2 || s.address2,
          city: shippingAddr?.city || s.city,
          state: shippingAddr?.state || s.state,
          postalCode: shippingAddr?.postalCode || s.postalCode,
          country: shippingAddr?.country ? (shippingAddr.country === 'Canada' ? 'CA' : (shippingAddr.country === 'United States' ? 'US' : shippingAddr.country)) : s.country,
        }))
      } catch {}
    })()
  }, [session])

  const computedShippingCost = useMemo(() => {
    // If cart already selected a shipping method, respect it
    try {
      const saved = sessionStorage.getItem('checkout_selected_shipping')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.price === 'number') return Number(parsed.price)
      }
    } catch {}

    const methods = (shippingConfig?.methods || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.price - b.price)
    if (methods.length === 0) return 0
    // Same cheapest (free first) logic as cart
    let min = Number.POSITIVE_INFINITY
    for (const m of methods) {
      const free = (m as any).freeThreshold != null && cart.subtotal >= Number((m as any).freeThreshold)
      const cost = free ? 0 : Number(m.price || 0)
      if (cost < min) min = cost
    }
    return isFinite(min) ? min : 0
  }, [shippingConfig, cart.subtotal])
  
  // Calculate cart totals including bundle discounts
  const cartCalculations = useMemo(() => calculateCartTotals(cart.items), [cart.items])
  
  // Calculate coupon discount
  const couponDiscount = appliedCoupon?.discount || 0
  const subtotalAfterBundleDiscount = cartCalculations.subtotal - cartCalculations.bundleDiscount
  const discountedSubtotal = subtotalAfterBundleDiscount - couponDiscount
  
  const displaySubtotal = cartCalculations.subtotal
  const displayBundleDiscount = cartCalculations.bundleDiscount
  const displayTax = 0
  const displayTotal = discountedSubtotal + computedShippingCost

  function buildSelectedShippingPayload() {
    const payload = { name: 'Shipping', price: computedShippingCost }
    try { sessionStorage.setItem('checkout_selected_shipping', JSON.stringify(payload)) } catch {}
    return payload
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        {!session?.user && (
          <div className="mb-6 p-4 rounded border border-blue-200 bg-blue-50 text-sm text-blue-900">
            <span className="mr-2">You are currently checking out as a guest.  No loyalty points will be awarded.</span>
            <Link href={`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`} className="underline font-medium">Click here to login.</Link>
          </div>
        )}

        {itemCount === 0 ? (
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-gray-700">Your cart is empty.</p>
            <Link href="/products" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">First name</label>
                    <input
                      type="text"
                      value={shipping.firstName}
                      onChange={(e) => setShipping(s => ({ ...s, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Last name</label>
                    <input
                      type="text"
                      value={shipping.lastName}
                      onChange={(e) => setShipping(s => ({ ...s, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping(s => ({ ...s, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${emailOk ? 'border-gray-300 focus:ring-primary-500' : 'border-red-300 focus:ring-red-500'}`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping(s => ({ ...s, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Address line 1</label>
                    <input
                      type="text"
                      value={shipping.address1}
                      onChange={(e) => setShipping(s => ({ ...s, address1: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Address line 2 (optional)</label>
                    <input
                      type="text"
                      value={shipping.address2}
                      onChange={(e) => setShipping(s => ({ ...s, address2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{shipping.country === 'US' ? 'State' : 'State/Province'}</label>
                    {shipping.country === 'CA' ? (
                      <select
                        value={shipping.state}
                        onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select province</option>
                        <option value="AB">Alberta</option>
                        <option value="BC">British Columbia</option>
                        <option value="MB">Manitoba</option>
                        <option value="NB">New Brunswick</option>
                        <option value="NL">Newfoundland and Labrador</option>
                        <option value="NS">Nova Scotia</option>
                        <option value="NT">Northwest Territories</option>
                        <option value="NU">Nunavut</option>
                        <option value="ON">Ontario</option>
                        <option value="PE">Prince Edward Island</option>
                        <option value="QC">Quebec</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="YT">Yukon</option>
                      </select>
                    ) : shipping.country === 'US' ? (
                      <select
                        value={shipping.state}
                        onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select state</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="DC">District of Columbia</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={shipping.state}
                        onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{shipping.country === 'US' ? 'ZIP code' : 'Postal code'}</label>
                    <input
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping(s => ({ ...s, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                
                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">First name</label>
                      <input
                        type="text"
                        value={billing.firstName}
                        onChange={(e) => setBilling(b => ({ ...b, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Last name</label>
                      <input
                        type="text"
                        value={billing.lastName}
                        onChange={(e) => setBilling(b => ({ ...b, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Address line 1</label>
                      <input
                        type="text"
                        value={billing.address1}
                        onChange={(e) => setBilling(b => ({ ...b, address1: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Address line 2 (optional)</label>
                      <input
                        type="text"
                        value={billing.address2}
                        onChange={(e) => setBilling(b => ({ ...b, address2: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={billing.city}
                        onChange={(e) => setBilling(b => ({ ...b, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{billing.country === 'US' ? 'State' : 'State/Province'}</label>
                      {billing.country === 'CA' ? (
                        <select
                          value={billing.state}
                          onChange={(e) => setBilling(b => ({ ...b, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select province</option>
                          <option value="AB">Alberta</option>
                          <option value="BC">British Columbia</option>
                          <option value="MB">Manitoba</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NU">Nunavut</option>
                          <option value="ON">Ontario</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="QC">Quebec</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="YT">Yukon</option>
                        </select>
                      ) : billing.country === 'US' ? (
                        <select
                          value={billing.state}
                          onChange={(e) => setBilling(b => ({ ...b, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select state</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="DC">District of Columbia</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="IN">Indiana</option>
                          <option value="IA">Iowa</option>
                          <option value="KS">Kansas</option>
                          <option value="KY">Kentucky</option>
                          <option value="LA">Louisiana</option>
                          <option value="ME">Maine</option>
                          <option value="MD">Maryland</option>
                          <option value="MA">Massachusetts</option>
                          <option value="MI">Michigan</option>
                          <option value="MN">Minnesota</option>
                          <option value="MS">Mississippi</option>
                          <option value="MO">Missouri</option>
                          <option value="MT">Montana</option>
                          <option value="NE">Nebraska</option>
                          <option value="NV">Nevada</option>
                          <option value="NH">New Hampshire</option>
                          <option value="NJ">New Jersey</option>
                          <option value="NM">New Mexico</option>
                          <option value="NY">New York</option>
                          <option value="NC">North Carolina</option>
                          <option value="ND">North Dakota</option>
                          <option value="OH">Ohio</option>
                          <option value="OK">Oklahoma</option>
                          <option value="OR">Oregon</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="RI">Rhode Island</option>
                          <option value="SC">South Carolina</option>
                          <option value="SD">South Dakota</option>
                          <option value="TN">Tennessee</option>
                          <option value="TX">Texas</option>
                          <option value="UT">Utah</option>
                          <option value="VT">Vermont</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="WV">West Virginia</option>
                          <option value="WI">Wisconsin</option>
                          <option value="WY">Wyoming</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={billing.state}
                          onChange={(e) => setBilling(b => ({ ...b, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{billing.country === 'US' ? 'ZIP code' : 'Postal code'}</label>
                      <input
                        type="text"
                        value={billing.postalCode}
                        onChange={(e) => setBilling(b => ({ ...b, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Country</label>
                      <select
                        value={billing.country}
                        onChange={(e) => setBilling(b => ({ ...b, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h3>

                {/* Shipping selection removed; cost carried over from cart logic */}

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal <span className="text-gray-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span></span>
                    <span className="text-gray-900">${displaySubtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Show bundle discount */}
                  {displayBundleDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Bundle Discount</span>
                      <span className="text-green-600">-${displayBundleDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Show applied coupon discount */}
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Coupon Discount ({appliedCoupon.code})</span>
                      <span className="text-green-600">-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">{computedShippingCost === 0 ? 'Free' : `$${computedShippingCost.toFixed(2)}`}</span>
                  </div>
                  {/* Tax is calculated at Stripe Checkout based on destination */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sales tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

                <div className="mt-6 space-y-3">
                  {requiredOk ? (
                    <CheckoutWithStripe amount={displayTotal}>
                      <StripePaymentForm
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </CheckoutWithStripe>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                      title="Please fill all required fields"
                    >
                      Please fill all required fields
                    </button>
                  )}

                  <Link
                    href="/cart"
                    className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


