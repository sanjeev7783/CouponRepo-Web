"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface Order {
  id: string
  user_email: string
  total_amount: number
  status: string
  created_at: string
  order_items: any[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/auth/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      
      // Check admin status
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", parsedUser.email)
      
      if (!adminUser || adminUser.length === 0) {
        router.push('/coupons')
        return
      }

      setIsAdmin(true)

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            coupons (*),
            prashad (*)
          )
        `)
        .order("created_at", { ascending: false })

      setOrders(ordersData || [])
      setLoading(false)
    }

    checkAuthAndFetchOrders()
  }, [router, supabase])

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-amber-900">User Orders Management</h1>
        </div>

        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-amber-900">Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-amber-700 mt-1">{order.user_email}</p>
                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">Items:</p>
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-amber-50 p-2 rounded">
                      <span>{item.coupons?.name || item.prashad?.name}</span>
                      <span>Qty: {item.quantity} × ₹{((item.price_in_cents || 0) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-4">
                    <p className="text-lg font-bold text-amber-900">
                      Total: ₹{(order.total_amount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}