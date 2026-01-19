import { getRefreshToken, setTokens, removeTokens } from "@/utils/session-token-accessor";

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch("http://127.0.0.1:8005/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      removeTokens();
      return false;
    }

    const data = await response.json();
    if (data.access) {
      setTokens(data.access, refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    removeTokens();
    return false;
  }
}
