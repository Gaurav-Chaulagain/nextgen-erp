import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "./lib/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { getDb } = await import("./lib/db");
        const db = await getDb();
        const user = await db.user.findUnique({
          where: { email: String(credentials.email) },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Get request headers and parse user-agent
        const { headers } = await import("next/headers");
        const { parseUserAgent } = await import("./lib/useragent");
        const reqHeaders = await headers();
        const userAgent = reqHeaders.get("user-agent") || "";
        const { browser, device } = parseUserAgent(userAgent);

        // Update user lastLogin and log in AuditLog
        await db.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            module: "AUTH",
            recordId: user.id,
            newValues: {
              email: user.email,
              role: user.role,
              loginAt: new Date().toISOString(),
              browser,
              device,
            },
            ipAddress: "Credentials-Login",
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 5 * 60, // 5 minutes inactivity timeout
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token) {
        const token = message.token as any;
        if (token.id) {
          const { getDb } = await import("./lib/db");
          const db = await getDb();
          const userId = String(token.id);
          const user = await db.user.findUnique({ where: { id: userId } });
          if (user) {
            const lastLoginLog = await db.auditLog.findFirst({
              where: { userId: user.id, action: "LOGIN" },
              orderBy: { createdAt: "desc" },
            });

            let durationStr = "Unknown";
            if (lastLoginLog) {
              const loginTime = new Date(lastLoginLog.createdAt);
              const logoutTime = new Date();
              const diffMs = logoutTime.getTime() - loginTime.getTime();
              const diffMins = Math.round(diffMs / 60000);
              if (diffMins < 60) {
                durationStr = `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
              } else {
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                durationStr = `${hours} hr${hours !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
              }
            }

            // Get request headers and parse user-agent
            const { headers } = await import("next/headers");
            const { parseUserAgent } = await import("./lib/useragent");
            const reqHeaders = await headers();
            const userAgent = reqHeaders.get("user-agent") || "";
            const { browser, device } = parseUserAgent(userAgent);

            await db.auditLog.create({
              data: {
                userId,
                action: "LOGOUT",
                module: "AUTH",
                recordId: userId,
                newValues: {
                  email: user.email,
                  logoutAt: new Date().toISOString(),
                  sessionDuration: durationStr,
                  browser,
                  device,
                },
                ipAddress: "User-Logout",
              },
            });
          }
        }
      }
    }
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
