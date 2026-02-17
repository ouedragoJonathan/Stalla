import { API_BASE_URL } from "./constants";
import { clearSession, getToken } from "./storage";
import type { ApiResponse } from "./types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const rawText = await response.text();
    const data = rawText ? (JSON.parse(rawText) as ApiResponse<T>) : null;

    if (response.status === 401) {
      clearSession();
    }

    if (data) return data;

    return {
      success: false,
      message: "Réponse serveur invalide.",
    };
  } catch {
    return {
      success: false,
      message: "Impossible de joindre le serveur. Vérifie que le backend est démarré et que CORS est actif.",
    };
  }
}
