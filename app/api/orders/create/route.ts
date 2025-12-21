import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { userId, cart, totalPrice, firstName, lastName, contact, address } = body
    
    console.log('Extracted values:', { userId, cart, totalPrice, firstName, lastName, contact, address })

    // Basic validation - accept email as userId since that's what we're using
    if (!userId || !cart || !totalPrice) {
      console.log('Validation failed:', { userId: !!userId, cart: !!cart, totalPrice: !!totalPrice })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use regular client
    const supabase = await createClient()
    
    // Create order using email instead of user_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: userId, // Store email directly
        total_amount_in_cents: totalPrice,
        first_name: firstName,
        last_name: lastName,
        contact: contact,
        address: address,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }

    // Create order items
    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      coupon_id: item.coupon?.id || null,
      prashad_id: item.prashad?.id || null,
      item_type: item.coupon ? 'coupon' : 'prashad',
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
