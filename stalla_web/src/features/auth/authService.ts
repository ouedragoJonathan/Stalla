import { apiRequest } from "../../core/api";
import type { ApiResponse, AuthPayload } from "../../core/types";
import { saveSession } from "../../core/storage";

export async function login(payload: {
  identifier: string;
  password: string;
}): Promise<ApiResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>("/auth/login", "POST", payload);
  if (response.success) {
    saveSession(response.data.token, response.data.user);
  }
  return response;
}

export async function registerAdmin(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>("/auth/register-admin", "POST", payload);
  if (response.success) {
    saveSession(response.data.token, response.data.user);
  }
  return response;
}
