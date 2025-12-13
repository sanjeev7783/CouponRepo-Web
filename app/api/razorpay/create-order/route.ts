import { razorpay } from "@/lib/razorpay"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, totalPrice } = await request.json()

    const razorpayOrder = await razorpay.orders.create({
      amount: totalPrice, // Amount in paise
      currency: "INR",
      receipt: orderId,
      notes: {
        orderId,
      },
      ...(process.env.RAZORPAY_CHECKOUT_CONFIG_ID && {
        checkout_config_id: process.env.RAZORPAY_CHECKOUT_CONFIG_ID,
      }),
    })

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    })
  } catch (error) {
    console.error("[v0] Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
