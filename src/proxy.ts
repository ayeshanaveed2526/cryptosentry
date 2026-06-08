import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Ensure we match protected routes and redirect unauthenticated users
  matcher: [
    "/dashboard/:path*",
    "/watchlist/:path*",
    "/alerts/:path*",
  ],
};
