import { BASE_URL } from "@/constants/apiConfig";
import { DecodedToken } from "@/types/next-auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { AuthOptions, User } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: "POST",
      body: JSON.stringify({ refresh: token.refresh }),
      headers: { "Content-Type": "application/json" },
    });
    const refreshedToken = await response.json();

    if (response.status !== 200) throw refreshedToken;

    const { exp } = jwtDecode(refreshedToken.access);

    return {
      ...token,
      access: refreshedToken.access,
      refresh: refreshedToken.refresh || token.refresh,
      exp,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export const authOptions: AuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Cargo",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {
          label: "Username",
          type: "username",
          placeholder: "username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${BASE_URL}/token/`, credentials, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          const token = response.data;

          if (response.status !== 200) throw token;

          const { username, email, id, exp, is_superuser, is_staff, name } = jwtDecode<DecodedToken>(token.access);

          return {
            access: token.access,
            refresh: token.refresh,
            exp,
            user: {
              id,
              name,
              username,
              email,
              is_staff,
              is_superuser,
            },
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl)
        ? Promise.resolve(url)
        : Promise.resolve(baseUrl);
    },
    async jwt({ token, account, user }) {
      // initial signin
      if (account && user) {
        return user as JWT;
      }

      // Check if token has expired
      const nowSec = Math.floor(Date.now() / 1000);
      if (token.exp && token.exp - nowSec <= 0) {
        // Token expired, try to refresh
        if (token.refresh) {
          return await refreshAccessToken(token);
        } else {
          // No refresh token, force logout
          return {
            ...token,
            error: "TokenExpiredError",
          };
        }
      }

      // Return previous token if still valid
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as User;
      session.access = token.access;
      session.refresh = token.refresh;
      session.exp = token.exp;
      session.error = token.error;

      return session;
    },
  },
  // events: {
  //   async signOut() {
  //     await removeCookies();
  //   },
  // },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
  },
  pages: {
    signIn: "/auth/signin", //  NextAuth uses this page instead of default
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
