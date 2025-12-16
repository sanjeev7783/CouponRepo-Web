import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, cart, totalPrice, firstName, lastName, contact, address } = body

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount_in_cents: totalPrice,
        first_name: firstName,
        last_name: lastName,
        contact: contact,
        address: address,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      coupon_id: item.coupon?.id || null,
      prashad_id: item.prashad?.id || null,
      quantity: item.quantity,
      price_in_cents: item.coupon?.price_in_cents || item.prashad?.price_in_cents || 0,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
