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
  coupon: Coupon
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
