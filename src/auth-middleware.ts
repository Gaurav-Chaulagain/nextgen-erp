import NextAuth from "next-auth";
import type { Role } from "./lib/constants";

export const { auth } = NextAuth({
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.role = (user as any).role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        (session.user as any).role = token.role as Role;
      }
      return session;
    },
  },
});
