import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CouponList } from "@/components/coupon-list"

export default async function CouponsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("available", true)
    .order("category", { ascending: true })

  const { data: prashads } = await supabase
    .from("prashad")
    .select("*")
    .eq("is_available", true)
    .order("meal_time", { ascending: true })
    .order("name", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <CouponList coupons={coupons || []} prashads={prashads || []} user={data.user} />
    </div>
  )
}
