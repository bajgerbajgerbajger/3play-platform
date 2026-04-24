import { compare } from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { ensureAdminUser } from './adminBootstrap';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await ensureAdminUser(db);

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // The custom authorize() function returns role; AdapterUser won't have it
        // so we use a type-safe check rather than `as any`
        token.role = (user as { role?: string }).role;
        token.avatar = user.image ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Extend the session.user object with our custom fields
        const u = session.user as typeof session.user & {
          id?: string;
          role?: string;
          avatar?: string;
        };
        u.id = token.id as string | undefined;
        u.role = token.role as string | undefined;
        u.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};
