import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // For demo purposes, using simple credential check
          // In production, you should validate against your backend
          const email = credentials.email;
          const password = credentials.password;

          // Demo credentials check
          if (email === "admin@zainablms.com" && password === "admin123") {
            return {
              id: "1",
              email: "admin@zainablms.com",
              name: "Admin User",
              role: "admin",
            };
          }

          // You can add more demo users or integrate with your actual auth system
          if (email === "teacher@zainablms.com" && password === "teacher123") {
            return {
              id: "2",
              email: "teacher@zainablms.com",
              name: "Teacher User",
              role: "teacher",
            };
          }

          if (email === "student@zainablms.com" && password === "student123") {
            return {
              id: "3",
              email: "student@zainablms.com",
              name: "Student User",
              role: "student",
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
});
