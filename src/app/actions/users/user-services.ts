"use client";

import { fetchAPI } from "@/lib/api";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Base endpoints
const USER_ENDPOINT = "/users/signup/";
const USER_DETAIL_ENDPOINT = (id: number) => `/users/signup/${id}/`;

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<User[]> {
  const res = await fetchAPI<User[]>(USER_ENDPOINT, { requiresAuth: true });

  if (!res.success) {
    console.error("Failed to fetch users:", res.error);
    throw new Error(res.error || "Failed to fetch users");
  }

  return res.data || [];
}

/**
 * Create a new user
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> {
  const res = await fetchAPI<User>(USER_ENDPOINT, {
    method: "POST",
    requiresAuth: true,
    body: data,
  });

  if (!res.success) {
    console.error("Failed to create user:", res.error);
    throw new Error(res.error || "Failed to create user");
  }

  return res.data!;
}

/**
 * Update an existing user
 */
export async function updateUser(
  id: number,
  data: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }
): Promise<User> {
  const res = await fetchAPI<User>(USER_DETAIL_ENDPOINT(id), {
    method: "PUT",
    requiresAuth: true,
    body: data,
  });

  if (!res.success) {
    console.error(`Failed to update user ${id}:`, res.error);
    throw new Error(res.error || "Failed to update user");
  }

  return res.data!;
}

/**
 * Delete a user
 */
export async function deleteUser(id: number): Promise<boolean> {
  const res = await fetchAPI<void>(USER_DETAIL_ENDPOINT(id), {
    method: "DELETE",
    requiresAuth: true,
  });

  if (!res.success) {
    console.error(`Failed to delete user ${id}:`, res.error);
    throw new Error(res.error || "Failed to delete user");
  }

  return true;
}
