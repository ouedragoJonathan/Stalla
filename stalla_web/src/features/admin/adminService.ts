import { apiRequest } from "../../core/api";
import type { Allocation, ApiResponse, Debtor, Payment, Stand, Vendor } from "../../core/types";

export const adminService = {
  listStands: (): Promise<ApiResponse<Stand[]>> => apiRequest<Stand[]>("/admin/stalls"),
  createStand: (payload: { code: string; zone: string; monthly_price: number }): Promise<ApiResponse<Stand>> =>
    apiRequest<Stand>("/admin/stalls", "POST", payload),

  listVendors: (): Promise<ApiResponse<Vendor[]>> => apiRequest<Vendor[]>("/admin/vendors"),
  createVendor: (payload: {
    full_name: string;
    phone: string;
    business_type: string;
    email?: string;
  }): Promise<ApiResponse<Vendor & { default_password: string }>> =>
    apiRequest<Vendor & { default_password: string }>("/admin/vendors", "POST", payload),

  createAllocation: (payload: {
    vendor_id: number;
    stall_id: number;
    start_date: string;
  }): Promise<ApiResponse<Allocation>> => apiRequest<Allocation>("/admin/allocations", "POST", payload),

  createPayment: (payload: {
    allocation_id: number;
    amount_paid: number;
    period: string;
  }): Promise<ApiResponse<Payment>> => apiRequest<Payment>("/admin/payments", "POST", payload),

  listDebtors: (): Promise<ApiResponse<Debtor[]>> => apiRequest<Debtor[]>("/admin/reports/debtors"),
};
