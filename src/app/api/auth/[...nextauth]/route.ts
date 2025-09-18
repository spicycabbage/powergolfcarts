import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions as any)

export { handler as GET, handler as POST }