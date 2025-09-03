'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    setIsLoading(true)
    
    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error('Login failed after registration')
      }

      // Redirect to account page
      router.push('/account')
      
      return { success: true }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error('Invalid credentials')
      }

      // Redirect to account page (it will redirect admins to /admin automatically)
      router.push('/account')
      
      return { success: true }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Parse the user name to get firstName
  const user = session?.user ? {
    _id: session.user.id || '',
    email: session.user.email || '',
    firstName: session.user.name?.split(' ')[0] || '',
    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
    avatar: session.user.image || undefined,
    role: (session.user as any).role || 'user',
    addresses: [],
    orders: [],
    wishlist: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } : null

  return {
    user,
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: !!session,
    register,
    login,
    logout
  }
}