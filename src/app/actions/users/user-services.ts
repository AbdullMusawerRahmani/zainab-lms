"use server";

import { fetchAPI } from "@/lib/api";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/dashboard/user";

const USER_ENDPOINT = "/student/api/v1/users/";

// --- Fetch all users ---
export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetchAPI<User[]>(USER_ENDPOINT, { method: "GET" });

  console.log("fetchUsers response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch users");

  return res.data || [];
};

// --- Fetch single user by ID ---
export const fetchUserById = async (id: string): Promise<User> => {
  const res = await fetchAPI<User>(`${USER_ENDPOINT}${id}/`, { method: "GET" });

  console.log("fetchUserById response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch user");

  return res.data!;
};

// --- Create new user ---
export const createUser = async (user: CreateUserRequest): Promise<User> => {
  const res = await fetchAPI<User>(USER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  console.log("createUser response:", res);

  if (!res.success) throw new Error(res.error || "Failed to create user");

  return res.data!;
};

// --- Update user completely (PUT) ---
export const updateUser = async (id: string, user: UpdateUserRequest): Promise<User> => {
  const res = await fetchAPI<User>(`${USER_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  console.log("updateUser response:", res);

  if (!res.success) throw new Error(res.error || "Failed to update user");

  return res.data!;
};

// --- Partial update (PATCH) ---
export const patchUser = async (id: string, user: Partial<UpdateUserRequest>): Promise<User> => {
  const res = await fetchAPI<User>(`${USER_ENDPOINT}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  console.log("patchUser response:", res);

  if (!res.success) throw new Error(res.error || "Failed to patch user");

  return res.data!;
};

// --- Delete user ---
export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${USER_ENDPOINT}${id}/`, { method: "DELETE" });

  console.log("deleteUser response:", res);

  if (!res.success) throw new Error(res.error || "Failed to delete user");
};

// --- Assign roles to user ---
export const assignUserRole = async (userId: string, roles: string[]): Promise<User> => {
  const res = await fetchAPI<User>(`${USER_ENDPOINT}${userId}/assign-role/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });

  console.log("assignUserRole response:", res);

  if (!res.success) throw new Error(res.error || "Failed to assign role");

  return res.data!;
};

// --- Remove roles from user ---
export const removeUserRole = async (userId: string, roles: string[]): Promise<User> => {
  const res = await fetchAPI<User>(`${USER_ENDPOINT}${userId}/remove-role/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });

  console.log("removeUserRole response:", res);

  if (!res.success) throw new Error(res.error || "Failed to remove role");

  return res.data!;
};
