"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/hooks/useAccessToken"; // client hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005/api/v1";

interface FetchOptions extends Omit<RequestInit, 'body'> {
  requiresAuth?: boolean;       // automatically attach token
  token?: string;               // manually provide token (for server actions)
  revalidate?: boolean;         // revalidate path
  path?: string;                // path to revalidate
  hasFile?: boolean;            // send FormData
  headers?: Record<string, string>;
  body?: BodyInit | Record<string, any> | null;
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
    token,
    revalidate = false,
    path = "/",
    headers = {},
    hasFile = false,
    ...restOptions
  } = options;

  let isUnauthorized = false;

  try {
    const requestHeaders: Record<string, string> = { ...headers };

    // Prepare body
    let processedBody = restOptions.body;

    // Convert object to FormData if hasFile
    if (hasFile && processedBody && typeof processedBody === 'object' && !(processedBody instanceof FormData)) {
      const formData = new FormData();
      Object.entries(processedBody).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      processedBody = formData;
    }

    // Convert object to JSON if not FormData
    if (!hasFile && processedBody && typeof processedBody === 'object' && !(processedBody instanceof FormData)) {
      processedBody = JSON.stringify(processedBody);
      if (!requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
      }
    }

    // Attach Authorization header
    let accessToken = token ?? null;

    if (requiresAuth && !accessToken) {
      // Only attempt getAccessToken if running in client
      try {
        accessToken = await getAccessToken();
      } catch {
        console.warn("No access token available for server-side fetch");
      }
    }

    if (accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    // Make the API request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      headers: requestHeaders,
      body: processedBody as BodyInit | null,
    });

    // Handle errors
    if (!response.ok) await logErrorResponse(response);

    switch (response.status) {
      case 204: // No Content
        return { success: true, data: undefined };
      case 401:
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

    const data = await safeJsonParse(response);

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
const safeJsonParse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

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
