"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Script from "next/script"
import { getRazorpayKeyId } from "@/app/actions/razorpay-config"

interface RazorpayCheckoutProps {
  orderId: string
  totalPrice: number
  onSuccess: () => void
  customerDetails: {
    firstName: string
    lastName: string
    contact: string
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayCheckout({ orderId, totalPrice, onSuccess, customerDetails }: RazorpayCheckoutProps) {
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null)
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch Razorpay key from server
        const keyId = await getRazorpayKeyId()
        setRazorpayKeyId(keyId)

        // Create order
        const response = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, totalPrice }),
        })
        const data = await response.json()
        setRazorpayOrderId(data.razorpayOrderId)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error initializing payment:", error)
        setIsLoading(false)
      }
    }

    initialize()
  }, [orderId, totalPrice])

  const handlePayment = async () => {
    if (!razorpayOrderId || !razorpayKeyId || !window.Razorpay) return

    const options = {
      key: razorpayKeyId,
      amount: totalPrice,
      currency: "INR",
      name: "Temple Coupons",
      description: `Order #${orderId.slice(0, 8)}`,
      order_id: razorpayOrderId,
      prefill: {
        name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        contact: customerDetails.contact,
      },
      theme: {
        color: "#D97706",
      },
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            }),
          })

          if (verifyResponse.ok) {
            window.location.href = `/confirmation?orderId=${orderId}`
          } else {
            alert("Payment verification failed. Please contact support.")
          }
        } catch (error) {
          console.error("[v0] Error verifying payment:", error)
          alert("Payment verification failed. Please contact support.")
        }
      },
      modal: {
        ondismiss: () => {
          console.log("[v0] Payment cancelled by user")
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  useEffect(() => {
    if (razorpayLoaded && !isLoading && razorpayOrderId && razorpayKeyId) {
      // Auto-open payment modal when ready
      handlePayment()
    }
  }, [razorpayLoaded, isLoading, razorpayOrderId, razorpayKeyId])

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("[v0] Failed to load Razorpay SDK")
          setIsLoading(false)
        }}
      />

      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4">
          <div className="bg-card border rounded-lg p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-amber-900">Complete Payment</h1>
            {isLoading ? (
              <p className="text-muted-foreground">Preparing payment gateway...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Amount: ₹{(totalPrice / 100).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Secure payment powered by Razorpay</p>
                </div>
                {razorpayLoaded && razorpayOrderId && razorpayKeyId && (
                  <Button onClick={handlePayment} className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
                    Pay Now
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
