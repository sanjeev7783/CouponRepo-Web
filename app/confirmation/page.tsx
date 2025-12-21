"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface User {
  email: string
  authenticated: boolean
}

export default function ConfirmationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    console.log('Confirmation page loaded, orderId:', orderId)
    const checkAuthAndFetchOrder = async () => {
      // Check custom authentication
      const userData = localStorage.getItem('user')
      console.log('User data from localStorage:', userData)
      if (!userData) {
        console.log('No user data, redirecting to login')
        router.push('/auth/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      console.log('Parsed user:', parsedUser)
      setUser(parsedUser)

      if (!orderId) {
        console.log('No orderId, redirecting to coupons')
        router.push('/coupons')
        return
      }

      // Fetch order details
      try {
        console.log('Fetching order details for:', orderId)
        const supabase = createClient()
        
        // First, fetch the order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select('*')
          .eq("id", orderId)
          .eq("user_email", parsedUser.email)
          .single()

        console.log('Order fetch result:', { orderData, error: orderError })
        
        if (!orderData) {
          console.log('No order found, redirecting to coupons')
          router.push('/coupons')
          return
        }

        // Then fetch order items
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select('*')
          .eq("order_id", orderId)

        console.log('Order items fetch result:', { orderItems, error: itemsError })

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

        // Combine order with items
        const completeOrder = {
          ...orderData,
          order_items: itemsWithDetails
        }

        console.log('Complete order:', completeOrder)
        setOrder(completeOrder)
      } catch (error) {
        console.error('Error fetching order:', error)
        router.push('/coupons')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchOrder()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading your confirmation...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-amber-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-amber-900">Booking Confirmed!</CardTitle>
          <CardDescription className="text-lg">Thank you for your order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-amber-900 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Order ID:</span> {order.id.slice(0, 8)}
              </p>
              <p>
                <span className="font-medium">Name:</span> {order.first_name} {order.last_name}
              </p>
              <p>
                <span className="font-medium">Contact:</span> {order.contact}
              </p>
              <p>
                <span className="font-medium">Address:</span> {order.address}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-amber-900 mb-3">Items Purchased</h3>
            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.coupons?.name || item.prashad?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{((item.price_in_cents * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-amber-700">₹{(order.total_amount_in_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly with your coupon details.
            </p>
            <Link href="/coupons">
              <Button className="bg-amber-600 hover:bg-amber-700">Go to Home</Button>
            </Link>
          </div>
        </CardContent>
        </Card>
    </div>
  )
}
