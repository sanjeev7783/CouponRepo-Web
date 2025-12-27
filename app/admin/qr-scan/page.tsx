"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, QrCode, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CouponValidation {
  id: string
  order_id: string
  user_email: string
  coupon_name: string
  status: string
  created_at: string
  used_at?: string
}

export default function QRScanPage() {
  const [couponCode, setCouponCode] = useState("")
  const [validationResult, setValidationResult] = useState<CouponValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
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
    }

    checkAuth()
  }, [router, supabase])

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Check if coupon exists in orders
      const { data: orderItem } = await supabase
        .from("order_items")
        .select(`
          *,
          orders (user_email, status, created_at),
          coupons (name),
          prashad (name)
        `)
        .eq("id", couponCode)
        .single()

      if (!orderItem) {
        setValidationResult(null)
        toast({
          title: "Invalid Coupon",
          description: "Coupon code not found",
          variant: "destructive",
        })
        return
      }

      const result: CouponValidation = {
        id: orderItem.id,
        order_id: orderItem.order_id,
        user_email: orderItem.orders.user_email,
        coupon_name: orderItem.coupons?.name || orderItem.prashad?.name || "Unknown",
        status: orderItem.used ? "used" : "valid",
        created_at: orderItem.orders.created_at,
        used_at: orderItem.used_at
      }

      setValidationResult(result)
      
      if (result.status === "used") {
        toast({
          title: "Coupon Already Used",
          description: `This coupon was used on ${new Date(result.used_at!).toLocaleString()}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Valid Coupon",
          description: "Coupon is valid and ready to use",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsUsed = async () => {
    if (!validationResult || validationResult.status === "used") return

    try {
      const { error } = await supabase
        .from("order_items")
        .update({
          used: true,
          used_at: new Date().toISOString()
        })
        .eq("id", validationResult.id)

      if (error) throw error

      setValidationResult({
        ...validationResult,
        status: "used",
        used_at: new Date().toISOString()
      })

      toast({
        title: "Coupon Marked as Used",
        description: "The coupon has been successfully marked as used",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark coupon as used",
        variant: "destructive",
      })
    }
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
          <h1 className="text-4xl font-bold text-amber-900">QR Code Scan & Validity</h1>
        </div>

        <Card className="max-w-md mx-auto border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Scan or Enter Coupon Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code or scan QR"
                onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
              />
              <Button onClick={validateCoupon} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {validationResult && (
          <Card className="max-w-md mx-auto border-amber-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-amber-900">Validation Result</CardTitle>
                <Badge variant={validationResult.status === "valid" ? "default" : "destructive"}>
                  {validationResult.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">Coupon:</p>
                <p>{validationResult.coupon_name}</p>
              </div>
              <div>
                <p className="font-semibold">User:</p>
                <p>{validationResult.user_email}</p>
              </div>
              <div>
                <p className="font-semibold">Purchase Date:</p>
                <p>{new Date(validationResult.created_at).toLocaleString()}</p>
              </div>
              {validationResult.used_at && (
                <div>
                  <p className="font-semibold">Used Date:</p>
                  <p>{new Date(validationResult.used_at).toLocaleString()}</p>
                </div>
              )}
              
              {validationResult.status === "valid" && (
                <Button 
                  onClick={markAsUsed}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Mark as Used
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}