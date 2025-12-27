"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Filter, X, Search } from "lucide-react"

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingExpiry, setPendingExpiry] = useState<{ orderId: string, itemId: string } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
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

      // Fetch orders with basic info first
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      console.log('Orders data:', ordersData)
      console.log('Orders error:', error)

      if (ordersData) {
        // Fetch order items separately for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: items } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", order.id)

            return {
              ...order,
              order_items: items || []
            }
          })
        )

        setOrders(ordersWithItems)
        setFilteredOrders(ordersWithItems)
      }

      setLoading(false)
    }

    checkAuthAndFetchOrders()
  }, [router, supabase])

  const applyFilters = () => {
    let filtered = orders

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        return orderDate === selectedDate
      })
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }

  const handleDateFilter = (date: string) => {
    setSelectedDate(date)
  }

  const handleSearchFilter = (query: string) => {
    setSearchQuery(query)
  }

  const resetFilter = () => {
    setSelectedDate("")
    setSearchQuery("")
  }

  const handleCouponExpiry = async (orderId: string, itemId: string, isExpired: boolean) => {
    try {
      const { error } = await supabase
        .from("order_items")
        .update({ used: isExpired })
        .eq("id", itemId)
        .eq("order_id", orderId)

      if (error) {
        console.error('Error updating coupon expiry:', error)
        return
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
              ...order,
              order_items: order.order_items.map(item =>
                item.id === itemId
                  ? { ...item, used: isExpired }
                  : item
              )
            }
            : order
        )
      )

      setFilteredOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
              ...order,
              order_items: order.order_items.map(item =>
                item.id === itemId
                  ? { ...item, used: isExpired }
                  : item
              )
            }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating coupon expiry:', error)
    }
  }

  const confirmExpiry = async () => {
    if (pendingExpiry) {
      setIsUpdating(true)
      await handleCouponExpiry(pendingExpiry.orderId, pendingExpiry.itemId, true)
      setIsUpdating(false)
      setShowConfirmDialog(false)
      setPendingExpiry(null)
    }
  }

  const cancelExpiry = () => {
    setShowConfirmDialog(false)
    setPendingExpiry(null)
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-amber-900">User Orders Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-700" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchFilter(e.target.value)}
                className="w-48"
                placeholder="Search by Order ID"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-700" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="w-40"
                placeholder="Filter by date"
              />
            </div>
            {(selectedDate || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilter}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{selectedDate || searchQuery ? 'No orders found for current filters' : 'No orders found'}</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-amber-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-amber-900">Order #{order.id.slice(0, 8)}</CardTitle>
                      <div className="mt-2 space-y-1">
                        <p className="text-amber-700 font-medium">{order.first_name} {order.last_name}</p>
                        <p className="text-sm text-gray-600">{order.contact}</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge> */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={order.order_items?.every(item => item.used) ? 'default' : 'secondary'}
                          className={order.order_items?.every(item => item.used) ? 'bg-[#b15300] text-white' : ''}
                        >
                          {order.order_items?.every(item => item.used) ? 'Coupon Expired' : 'Coupon Active'}
                        </Badge>
                        {!order.order_items?.every(item => item.used) ? (
                          <Switch
                            checked={true}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                const validItem = order.order_items?.find(item => !item.used)
                                if (validItem) {
                                  setPendingExpiry({ orderId: order.id, itemId: validItem.id })
                                  setShowConfirmDialog(true)
                                }
                              }
                            }}
                            className="data-[state=checked]:bg-green-500"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">Items:</p>
                    {order.order_items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-amber-50 p-2 rounded">
                        <span>Item #{item.id}</span>
                        <span>Qty: {item.quantity} × ₹{((item.price_in_cents || 0) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-4">
                      <p className="text-lg font-bold text-amber-900">
                        Total: ₹{(order?.total_amount_in_cents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Coupon Expiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this coupon as expired? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExpiry} disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExpiry} className="bg-red-600 hover:bg-red-700" disabled={isUpdating}>
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                "Yes, Mark as Expired"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}