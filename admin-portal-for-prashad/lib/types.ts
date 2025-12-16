export type MealTime = "breakfast" | "lunch" | "dinner"

export interface Prashad {
  id: string
  name: string
  description: string | null
  meal_time: MealTime
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
