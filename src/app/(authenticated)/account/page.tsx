import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import AccountDashboard from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your account, orders, and preferences'
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  // Redirect admins to admin dashboard
  if (session.user?.role === 'admin') {
    redirect('/admin')
  }

  return <AccountDashboard session={session} />
}