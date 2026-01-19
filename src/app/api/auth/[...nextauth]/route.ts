import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Django",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://127.0.0.1:8005/api/token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        if (data.access) {
            return {
              id: data.user?.id ?? 0,
              access: data.access,
              refresh: data.refresh,
              exp: data.exp, // if you decode it later
              user: data.user ?? null,
            };
          }
          

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.access = (user as any).access;
        token.refresh = (user as any).refresh;
        token.exp = (user as any).exp;
        token.user = (user as any).user;
      }
  
      return token;
    },
  

    async session({ session, token }) {
        session.access = token.access as string;
        session.refresh = token.refresh as string;
        session.exp = token.exp as number;
        session.user = token.user as any;
      
        return session;
      },
      
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
