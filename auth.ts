import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const ALLOWED_DOMAINS = ['neonblue.ai', 'suno.com']

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? ''
      const domain = email.split('@')[1]
      return ALLOWED_DOMAINS.includes(domain)
    },
    async session({ session, token }) {
      return session
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = profile.email
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
