'use client'

import { useEffect, useState } from 'react'
import { Mail, Check } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/email-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'newsletter'
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsSubscribed(true)
        setEmail('')
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubscribed(false), 5000)
      } else {
        console.error('Subscription error:', data.error)
        // You could show an error message here
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>

          {/* Content */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get exclusive access to new products, special offers, and insider updates.
            Join thousands of happy customers who never miss a deal.
          </p>

          {/* Form */}
          {mounted ? (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto"
              autoComplete="off"
              data-lpignore="true"
              data-lastpass-ignore="true"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                    disabled={isLoading}
                    name="newsletter_email"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          ) : (
            <div className="h-[52px]" aria-hidden="true" />
          )}

          {/* Success Message */}
          {isSubscribed && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <Check className="w-5 h-5 mr-2" />
              Successfully subscribed! Check your email for confirmation.
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">10,000+</span>
                <span className="ml-1">Happy Subscribers</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div>Weekly Deals</div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div>No Spam Ever</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

