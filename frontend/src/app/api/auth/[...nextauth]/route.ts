import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return {
              id: data.user.id,
              ...data
            };
          }
          return null;
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user, trigger }) {
      if (trigger === "update" && token.backendAccessToken) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
            headers: {
              "Authorization": `Bearer ${token.backendAccessToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            token.backendUser = data.user;
          }
        } catch (error) {
          console.error("Failed to update user session:", error);
        }
      }

      // Credentials login
      if (user && (user as any).access_token) {
        token.backendAccessToken = (user as any).access_token;
        token.backendUser = (user as any).user;
      }

      // Initial sign in: Exchange Google id_token for backend JWT
      if (account && account.id_token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate with backend");
          }

          const data = await response.json();
          // Store backend token and user data in NextAuth's encrypted JWT
          token.backendAccessToken = data.access_token;
          token.backendUser = data.user;
        } catch (error) {
          console.error("Backend auth error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Surface the backend token and user on the session object
      if (token.backendAccessToken) {
        (session as any).accessToken = token.backendAccessToken;
        (session as any).user = token.backendUser;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
