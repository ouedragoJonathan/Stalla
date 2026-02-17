import type { Key, ReactNode } from "react";

export type Role = "ADMIN" | "VENDOR";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AuthUser {
  id: number;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export interface Stand {
  id: number;
  code: string;
  zone: string;
  monthly_price: number;
  status: "AVAILABLE" | "OCCUPIED";
  active_allocation?: {
    id: number;
    vendor_id: number;
    vendor_name: string | null;
    start_date: string;
    end_date: string | null;
  } | null;
}

export interface Vendor {
  id: number;
  user_id: number;
  email: string | null;
  full_name: string;
  phone: string;
  business_type: string;
  default_password?: string;
  email_delivery?: { ok: boolean; messageId?: string; reason?: string } | null;
}

export interface VendorApplication {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  desired_zone: string;
  budget_min: number;
  budget_max: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}

export interface Allocation {
  id: number;
  vendor_id: number;
  stall_id: number;
  start_date: string;
  end_date: string | null;
}

export interface Payment {
  id: number;
  allocation_id: number;
  amount_paid: number;
  payment_date: string;
  period: string;
  receipt_path?: string | null;
  receipt_url?: string | null;
}

export interface Debtor {
  name: ReactNode;
  id: Key | null | undefined;
  vendor_id: number;
  email: string | null;
  full_name: string;
  phone: string;
  business_type: string;
  total_paid: number;
  total_due: number;
  current_debt: number;
}

export interface SupportSettings {
  support_phone: string | null;
}
