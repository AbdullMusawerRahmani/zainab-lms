import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    access: string;
    refresh: string;
    exp: number;
    error?: string;
    user: {
      id: number;
      username: string;
      name: string;
      email: string;
      is_staff: boolean;
      is_superuser: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access: string;
    refresh: string;
    exp: number;
    error?: string;
    user: {
      id: number;
      username: string;
      name: string;
      email: string;
      is_staff: boolean;
      is_superuser: boolean;
    };
  }
}

export interface DecodedToken {
  id: number;
  username: string;
  email: string;
  name: string;
  exp: number;
  is_staff: boolean;
  is_superuser: boolean;
}
