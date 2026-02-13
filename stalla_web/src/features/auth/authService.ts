import { apiRequest } from "../../core/api";
import { saveSession } from "../../core/storage";
import type { ApiResponse, AuthPayload } from "../../core/types";

export async function registerAdmin(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>("/auth/register-admin", "POST", payload);
  if (response.success) saveSession(response.data.token, response.data.user);
  return response;
}

export async function login(payload: {
  identifier: string;
  password: string;
}): Promise<ApiResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>("/auth/login", "POST", payload);
  if (response.success) saveSession(response.data.token, response.data.user);
  return response;
}
