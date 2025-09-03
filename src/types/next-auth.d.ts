import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    image?: string | null
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: string
    } & DefaultSession['user']
  }
}


