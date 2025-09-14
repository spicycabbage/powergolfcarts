'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import OrderDetails from './OrderDetails'
import AccountDetails from './AccountDetails'
import AddressManagement from './AddressManagement'
import PasswordChange from './PasswordChange'
import LoyaltyPoints from './LoyaltyPoints'

interface AccountDashboardProps {
  session: Session
}

type TabType = 'orders' | 'account' | 'addresses' | 'password' | 'loyalty'

export default function AccountDashboard({ session }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders')

  const tabs = [
    { id: 'orders' as TabType, name: 'Order Details', icon: '📦' },
    { id: 'account' as TabType, name: 'Account Details', icon: '👤' },
    { id: 'addresses' as TabType, name: 'Change Addresses', icon: '📍' },
    { id: 'password' as TabType, name: 'Change Password', icon: '🔐' },
    { id: 'loyalty' as TabType, name: 'Loyalty Points', icon: '⭐' },
  ]

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut({ callbackUrl: '/' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome back, {session.user?.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'orders' && <OrderDetails userId={session.user?.id} />}
            {activeTab === 'account' && <AccountDetails session={session} />}
            {activeTab === 'addresses' && <AddressManagement userId={session.user?.id} />}
            {activeTab === 'password' && <PasswordChange />}
            {activeTab === 'loyalty' && <LoyaltyPoints userId={session.user?.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}






