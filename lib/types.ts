export interface Coupon {
  id: string
  name: string
  description: string
  price_in_cents: number
  image_url: string | null
  category: string | null
  available: boolean
  created_at: string
}

export interface CartItem {
  coupon?: Coupon
  prashad?: Prashad
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  total_amount_in_cents: number
  razorpay_payment_id: string | null
  razorpay_order_id: string | null
  status: string
  first_name: string
  last_name: string
  contact: string
  address: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  coupon_id: string
  quantity: number
  price_in_cents: number
  created_at: string
}

export type MealTime = "breakfast" | "lunch" | "dinner"

export interface Prashad {
  id: string
  name: string
  description: string | null
  meal_time: MealTime
  image_url: string | null
  price_in_cents: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
