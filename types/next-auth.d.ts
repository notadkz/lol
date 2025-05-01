import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      balance?: number;
      accountType?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    accessToken?: string;
    isAdmin?: boolean;
    balance?: number;
    accountType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId?: string;
    email?: string;
    error?: string;
  }
}
