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
  return apiRequest<AuthPayload>("/auth/register-admin", "POST", payload);
}

export async function forgotPassword(payload: {
  email: string;
}): Promise<ApiResponse<null>> {
  return apiRequest<null>("/auth/forgot-password", "POST", payload);
}

export async function resetPassword(payload: {
  token: string;
  new_password: string;
}): Promise<ApiResponse<null>> {
  return apiRequest<null>("/auth/reset-password", "POST", payload);
}
