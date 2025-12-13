import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  if (!params.orderId) {
    redirect("/coupons")
  }

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        coupons:coupon_id (*)
      )
    `)
    .eq("id", params.orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/coupons")
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
            <h3 className="font-semibold text-amber-900 mb-3">Coupons Purchased</h3>
            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.coupons.name} × {item.quantity}
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
