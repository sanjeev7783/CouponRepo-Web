"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, ShoppingBag, LogOut } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Order {
  id: string
  first_name: string
  last_name: string
  contact: string
  address: string
  total_amount_in_cents: number
  created_at: string
  order_items: {
    id: string
    quantity: number
    price_in_cents: number
    coupons: {
      name: string
    }
  }[]
}

interface ProfileDrawerProps {
  user: SupabaseUser
  open: boolean
  onClose: () => void
}

export function ProfileDrawer({ user, open, onClose }: ProfileDrawerProps) {
  const [showOrders, setShowOrders] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders/user")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setShowOrders(true)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" })
    window.location.href = "/auth/login"
  }

  if (showOrders) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <Button variant="ghost" onClick={() => setShowOrders(false)} className="w-fit">
              ← Back to Profile
            </Button>
            <SheetTitle>My Orders</SheetTitle>
            <SheetDescription>Your order history</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4 overflow-y-auto max-h-96 mx-2">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-amber-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      <span className="text-lg font-semibold text-amber-700">
                        ₹{(order.total_amount_in_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.coupons.name} × {item.quantity}</span>
                          <span>₹{((item.price_in_cents * item.quantity) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>Your account details</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">User ID:</span> {user.id.slice(0, 8)}...</p>
                <p><span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={fetchOrders}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "My Orders"}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}