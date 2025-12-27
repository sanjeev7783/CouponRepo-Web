"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    submit: "",
  })
  const [showPayment, setShowPayment] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.authenticated && user.email !== 'guest@temple.com') {
        const email = user.email || ''
        const nameParts = email.split('@')[0].split('.')

        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts[1] || ''
        }))
      }
    }
  }, [])

  const validateForm = () => {
    const newErrors = { firstName: "", lastName: "", contact: "", submit: "" }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.length < 1) {
      newErrors.firstName = "First name must be at least 1 character"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters and spaces"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.length < 1) {
      newErrors.lastName = "Last name must be at least 1 character"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name can only contain letters and spaces"
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required"
    } else if (!/^[0-9]{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be exactly 10 digits"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Clear previous submit errors
    setErrors(prev => ({ ...prev, submit: "" }))

    try {
      const requestData = {
        userId,
        cart,
        totalPrice,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contact: formData.contact,
        address: "", // Provide empty address since we removed the field
      }

      console.log('Sending request data:', requestData)

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const { orderId } = await response.json()
        window.location.href = `/confirmation?orderId=${orderId}`
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        setErrors(prev => ({ ...prev, submit: error.error || "Failed to create order. Please try again." }))
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors(prev => ({ ...prev, submit: "Network error. Please check your connection and try again." }))
    }
  }

  if (showPayment && orderId) {
    // This block is now unused since we skip payment
    return null
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setFormData({ ...formData, firstName: value })
                    }}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setFormData({ ...formData, lastName: value })
                    }}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.contact}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setFormData({ ...formData, contact: value })
                  }}
                  className={errors.contact ? "border-red-500" : ""}
                />
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
              </div>


              <div className="border-t pt-4 mt-6">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>Total Amount:</span>
                  <span className="text-amber-700">₹{(totalPrice / 100).toFixed(2)}</span>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
                  Place Order
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
