import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Update order status
    const supabase = await createClient()
    const { error } = await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_order_id,
        status: "completed",
      })
      .eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error verifying payment:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
