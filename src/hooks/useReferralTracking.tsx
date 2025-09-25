'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface ReferralData {
  referrerId: string
  referrerName: string
  referralCode: string
  trackedAt: string
}

export function useReferralTracking() {
  const searchParams = useSearchParams()
  const [referralData, setReferralData] = useState<ReferralData | null>(null)

  useEffect(() => {
    const referralCode = searchParams.get('ref')
    
    if (referralCode) {
      trackReferral(referralCode)
    } else {
      // Check if we have existing referral data in localStorage
      const stored = localStorage.getItem('referralData')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Check if referral data is still valid (within 60 days for better guest user experience)
          const trackedAt = new Date(parsed.trackedAt)
          const now = new Date()
          const daysDiff = (now.getTime() - trackedAt.getTime()) / (1000 * 3600 * 24)
          
          if (daysDiff <= 60) {
            setReferralData(parsed)
          } else {
            // Expired, remove it
            localStorage.removeItem('referralData')
          }
        } catch (error) {
          console.error('Error parsing stored referral data:', error)
          localStorage.removeItem('referralData')
        }
      }
    }
  }, [searchParams])

  const trackReferral = async (referralCode: string) => {
    try {
      const response = await fetch('/api/referrals/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          userAgent: navigator.userAgent,
          ipAddress: null // Will be captured server-side if needed
        })
      })

      if (response.ok) {
        const data = await response.json()
        const referralData: ReferralData = {
          referrerId: data.referrer.id,
          referrerName: data.referrer.name,
          referralCode: data.referrer.code,
          trackedAt: new Date().toISOString()
        }
        
        setReferralData(referralData)
        localStorage.setItem('referralData', JSON.stringify(referralData))
        // Also store in sessionStorage as backup
        sessionStorage.setItem('referralData', JSON.stringify(referralData))
        
        // Remove the ref parameter from URL to clean it up
        const url = new URL(window.location.href)
        url.searchParams.delete('ref')
        window.history.replaceState({}, '', url.toString())
      }
    } catch (error) {
      console.error('Failed to track referral:', error)
    }
  }

  const clearReferralData = () => {
    setReferralData(null)
    localStorage.removeItem('referralData')
    sessionStorage.removeItem('referralData')
  }

  return {
    referralData,
    clearReferralData,
    hasActiveReferral: !!referralData
  }
}
