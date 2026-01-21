export type UserType = 'customer' | 'store' | 'delivery';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  user_type: UserType;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  logo_url?: string;
  is_active: boolean;
  menu_link_token?: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  delivery_id?: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string;
  status: 'assigned' | 'picked_up' | 'completed';
  pickup_time?: string;
  delivery_time?: string;
  earnings: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
