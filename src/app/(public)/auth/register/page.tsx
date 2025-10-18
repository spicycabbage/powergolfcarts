import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new account to start shopping and access exclusive features.'
}

export default function RegisterPage() {
  return <RegisterForm />
}