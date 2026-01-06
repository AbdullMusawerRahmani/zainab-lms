"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const token=process.env.TOKEN

// Use your .env variable directly
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005/api/v1";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  revalidate?: boolean;
  path?: string;
  hasFile?: boolean;
  headers?: Record<string, string>;
}

// Standard API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requiresAuth = true,
    revalidate = false,
    path = "/",
    headers = {},
    hasFile = false,
    ...restOptions
  } = options;

  let isUnauthorized = false;

  try {
    const requestHeaders: Record<string, string> = { ...headers };

    // If not uploading a file, default Content-Type to JSON
    if (!hasFile && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    }
    if (requiresAuth) {
        const access_token = token;
        requestHeaders["Authorization"] = `Bearer ${access_token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      headers: requestHeaders,
    });

    // Log non-ok responses
    if (!response.ok) {
      await logErrorResponse(response);
    }

    // Handle status-specific cases
    switch (response.status) {
      case 204: // No Content
        return { success: true, data: undefined };
      case 401: // Unauthorized
        isUnauthorized = true;
        return { success: false, error: "Unauthorized" };
      case 400:
      case 403:
      case 404:
      case 405:
      case 409:
      case 422:
      case 429:
      case 500: {
        const errorData = await safeJsonParse(response);
        return {
          success: false,
          error: errorData?.message || errorData?.detail || response.statusText,
        };
      }
    }

    // Parse JSON safely
    const data = await safeJsonParse(response);

    // Trigger revalidation if required
    if (revalidate) {
      revalidatePath(path);
    }

    return { success: true, data };
  } catch (error) {
    console.error("API request failed:", error);
    return { success: false, error: "Connection error" };
  } finally {
    if (isUnauthorized) {
      redirect("/auth/signout");
    }
  }
}

// --- Helpers ---

// Safe JSON parse to avoid crashes
const safeJsonParse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Log errors to console with full info
const logErrorResponse = async (response: Response) => {
  try {
    const text = await response.clone().text();
    console.error("❌ API Error:", {
      status: response.status,
      url: response.url,
      body: text,
    });
  } catch (err) {
    console.error("❌ Failed to log error response:", err);
  }
};
