"use client"; 

import { useSession } from "next-auth/react";

/**
 * Custom hook to get the current access token from NextAuth session
 * @returns {string | null} 
 */
export function useAccessToken(): string | null {
  const { data: session } = useSession();
  return session?.access ?? null;
}
