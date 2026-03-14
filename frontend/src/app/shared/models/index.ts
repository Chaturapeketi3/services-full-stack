export enum RoleEnum {
  CUSTOMER = 'ROLE_CUSTOMER',
  EXPERT = 'ROLE_EXPERT',
  ADMIN = 'ROLE_ADMIN'
}

export enum BookingStatusEnum {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  email: string;
  role: RoleEnum;
  is_active: boolean;
  customer_profile?: any;
  expert_profile?: any;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  expert_id: string;
  service_id: string;
  address_id: string;
  status: BookingStatusEnum;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  expert_earning?: number;
  total_amount: number;
  idempotency_key: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
