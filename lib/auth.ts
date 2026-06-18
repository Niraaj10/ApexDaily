import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";

const SESSION_TTL = 24 * 60 * 60; // 1 day in seconds

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: SESSION_TTL,
    updateAge: 0, // Strict 24h expiration
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // On initial login, track in Redis
        await redis.set(`active_session:${user.id}`, "true", { ex: SESSION_TTL });
      }
      return token;
    },
    async session({ session, token }) {
      // Check Redis to see if session is still valid/not revoked
      const isActive = await redis.get(`active_session:${token.id}`);
      
      if (!isActive && token.id) {
        return {} as any; 
      }

      if (session.user) (session.user as any).id = token.id;
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      // Clean up Redis on explicit logout
      if (token?.id) {
        await redis.del(`active_session:${token.id}`);
      }
    }
  }
};