'use client'

import { useReferralTracking } from '@/hooks/useReferralTracking'
import { createContext, useContext, ReactNode } from 'react'

interface ReferralContextType {
  referralData: {
    referrerId: string
    referrerName: string
    referralCode: string
    trackedAt: string
  } | null
  hasActiveReferral: boolean
  clearReferralData: () => void
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined)

export function ReferralProvider({ children }: { children: ReactNode }) {
  const referralTracking = useReferralTracking()

  return (
    <ReferralContext.Provider value={referralTracking}>
      {children}
    </ReferralContext.Provider>
  )
}

export function useReferral() {
  const context = useContext(ReferralContext)
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider')
  }
  return context
}

