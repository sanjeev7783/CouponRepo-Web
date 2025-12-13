"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CartItem } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import { RazorpayCheckout } from "@/components/razorpay-checkout"

interface CheckoutFormProps {
  cart: CartItem[]
  totalPrice: number
  userId: string
  onBack: () => void
  onClose: () => void
}

export function CheckoutForm({ cart, totalPrice, userId, onBack, onClose }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    address: "",
  })
  const [showPayment, setShowPayment] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        cart,
        totalPrice,
        ...formData,
      }),
    })

    if (response.ok) {
      const { orderId } = await response.json()
      setOrderId(orderId)
      setShowPayment(true)
    }
  }

  if (showPayment && orderId) {
    return (
      <RazorpayCheckout
        orderId={orderId}
        totalPrice={totalPrice}
        onSuccess={onClose}
        customerDetails={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          contact: formData.contact,
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Please provide your information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>Total Amount:</span>
                  <span className="text-amber-700">₹{(totalPrice / 100).toFixed(2)}</span>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
