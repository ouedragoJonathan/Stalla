import { apiRequest } from "../../core/api";
import type {
  Allocation,
  ApiResponse,
  Debtor,
  Payment,
  Stand,
  SupportSettings,
  Vendor,
} from "../../core/types";

export async function getStalls(): Promise<ApiResponse<Stand[]>> {
  return apiRequest<Stand[]>("/admin/stalls");
}

export async function createStall(payload: {
  code: string;
  zone: string;
  monthly_price: number;
}): Promise<ApiResponse<Stand>> {
  return apiRequest<Stand>("/admin/stalls", "POST", payload);
}

export async function deleteStall(stallId: number): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/admin/stalls/${stallId}`, "DELETE");
}

export async function getVendors(): Promise<ApiResponse<Vendor[]>> {
  return apiRequest<Vendor[]>("/admin/vendors");
}

export async function createVendor(payload: {
  email?: string | null;
  full_name: string;
  phone: string;
  business_type: string;
}): Promise<ApiResponse<Vendor>> {
  return apiRequest<Vendor>("/admin/vendors", "POST", payload);
}

export async function deleteVendor(vendorId: number): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/admin/vendors/${vendorId}`, "DELETE");
}

export async function createAllocation(payload: {
  vendor_id: number;
  stall_id: number;
  start_date: string;
}): Promise<ApiResponse<Allocation>> {
  return apiRequest<Allocation>("/admin/allocations", "POST", payload);
}

export async function createPayment(payload: {
  allocation_id: number;
  amount_paid: number;
  period: string;
}): Promise<ApiResponse<Payment>> {
  return apiRequest<Payment>("/admin/payments", "POST", payload);
}

export async function getDebtors(): Promise<ApiResponse<Debtor[]>> {
  return apiRequest<Debtor[]>("/admin/reports/debtors");
}

export async function getSupportSettings(): Promise<ApiResponse<SupportSettings>> {
  return apiRequest<SupportSettings>("/admin/settings/support");
}

export async function updateSupportSettings(payload: {
  support_phone: string;
}): Promise<ApiResponse<SupportSettings>> {
  return apiRequest<SupportSettings>("/admin/settings/support", "PUT", payload);
}
