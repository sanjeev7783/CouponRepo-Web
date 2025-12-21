import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch orders using email instead of user_id
    const { data: orders, error } = await supabase
      .from("orders")
      .select('*')
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order: any) => {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select('*')
          .eq("order_id", order.id)

        // Fetch item details (coupons and prashads)
        const itemsWithDetails = await Promise.all(
          (orderItems || []).map(async (item: any) => {
            if (item.coupon_id) {
              const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('id', item.coupon_id)
                .single()
              return { ...item, coupons: coupon }
            } else if (item.prashad_id) {
              const { data: prashad } = await supabase
                .from('prashad')
                .select('*')
                .eq('id', item.prashad_id)
                .single()
              return { ...item, prashad: prashad }
            }
            return item
          })
        )

        return {
          ...order,
          order_items: itemsWithDetails
        }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}