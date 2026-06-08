import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isProtectedRoute = ["/dashboard", "/watchlist", "/alerts"].some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Automatically redirects unauthenticated users to pages.signIn ("/login")
      }
      
      return true;
    },
  },
  providers: [], // Overridden with specific providers in auth.ts
} satisfies NextAuthConfig;
