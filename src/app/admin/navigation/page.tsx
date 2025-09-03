import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import NavigationAdminClient from '@/components/admin/NavigationAdminClient'

export default async function NavigationAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  if (session.user?.role !== 'admin') {
    redirect('/account')
  }

  return <NavigationAdminClient session={session} />
}