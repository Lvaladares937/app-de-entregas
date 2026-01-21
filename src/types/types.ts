// src/types.ts
export interface Profile {
  id: string;
  user_type: 'customer' | 'store' | 'delivery';
  full_name: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  hiring_delivery: boolean;
  daily_rate: number;
  delivery_rate: number;
  menu_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_id: string | null;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}