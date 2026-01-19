'use server';

import { decrypt } from "@/lib/encrypt-decrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getAccessToken() {
  const session = await getSession();
  console.log("session", session);
  if (session && session.access) {
    const accessTokenDecrypted = decrypt(session.access);
    console.log("accessTokenDecrypted", accessTokenDecrypted);
    return accessTokenDecrypted;
  }
  return null;
}

export async function getUser() {
  const session = await getSession();
  return { ...session?.user, roles: session?.roles };
}
