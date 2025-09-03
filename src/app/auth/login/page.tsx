import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account to access your dashboard, orders, and wishlist.'
}

export default function LoginPage() {
  return <LoginForm />
}