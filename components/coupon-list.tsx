"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, ArrowLeft, User } from "lucide-react"
import type { Coupon, CartItem, Prashad } from "@/lib/types"
import { Cart } from "@/components/cart"
import { ProfileDrawer } from "@/components/profile-drawer"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"

interface CouponListProps {
  coupons: Coupon[]
  prashads: Prashad[]
  user: User
}

export function CouponList({ coupons, prashads, user }: CouponListProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const addToCart = (coupon: Coupon) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.coupon?.id === coupon.id)
      if (existing) {
        return prev.map((item) => (item.coupon?.id === coupon.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { coupon, quantity: 1 }]
    })
  }

  const addPrashadToCart = (prashad: Prashad) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.prashad?.id === prashad.id)
      if (existing) {
        return prev.map((item) => (item.prashad?.id === prashad.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { prashad, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number, type: 'coupon' | 'prashad' = 'coupon') => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const id = type === 'coupon' ? item.coupon?.id : item.prashad?.id
          return id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => {
    const price = item.coupon?.price_in_cents || item.prashad?.price_in_cents || 0
    return sum + price * item.quantity
  }, 0)

  const groupedCoupons = coupons.reduce(
    (acc, coupon) => {
      const category = coupon.category || "Other"
      if (!acc[category]) acc[category] = []
      acc[category].push(coupon)
      return acc
    },
    {} as Record<string, Coupon[]>,
  )

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">Welcome, {user.email?.split("@")[0]}!</h1>
            <p className="text-lg text-amber-700">Select your temple coupons</p>
          </div>
          <div className="flex gap-3">

            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 relative" onClick={() => setShowCart(true)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-600 hover:bg-orange-700">{totalItems}</Badge>
              )}
            </Button>
            <Button size="lg" variant="outline" className="border-amber-300" onClick={() => setShowProfile(true)}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {prashads.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Temple Prashad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prashads.map((prashad) => {
                const cartItem = cart.find((item) => item.prashad?.id === prashad.id)
                return (
                  <Card key={prashad.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {prashad.image_url && (
                        <div className="w-full h-48 bg-muted rounded-md overflow-hidden mb-4">
                          <Image
                            src={prashad.image_url}
                            alt={prashad.name}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-amber-900">{prashad.name}</CardTitle>
                        <Badge variant="secondary">{prashad.meal_time}</Badge>
                      </div>
                      <CardDescription>{prashad.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-amber-700 mb-2">₹{((prashad.price_in_cents || 0) / 100).toFixed(2)}</p>
                      <Badge variant="default">Available</Badge>
                    </CardContent>
                    <CardFooter>
                      {cartItem ? (
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(prashad.id, -1, 'prashad')}
                            className="border-amber-300"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold flex-1 text-center">{cartItem.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(prashad.id, 1, 'prashad')}
                            className="border-amber-300"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => addPrashadToCart(prashad)}>
                          Add to Cart
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {Object.entries(groupedCoupons).map(([category, coupons]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => {
                const cartItem = cart.find((item) => item.coupon?.id === coupon.id)
                return (
                  <Card key={coupon.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-full h-48 bg-muted rounded-md overflow-hidden mb-4">
                        <img
                          src={coupon.image_url || "/placeholder.svg"}
                          alt={coupon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-amber-900">{coupon.name}</CardTitle>
                      <CardDescription>{coupon.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-amber-700">₹{(coupon.price_in_cents / 100).toFixed(2)}</p>
                    </CardContent>
                    <CardFooter>
                      {cartItem ? (
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(coupon.id, -1, 'coupon')}
                            className="border-amber-300"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold flex-1 text-center">{cartItem.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(coupon.id, 1, 'coupon')}
                            className="border-amber-300"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => addToCart(coupon)}>
                          Add to Cart
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Cart
        cart={cart}
        open={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateQuantity}
        totalPrice={totalPrice}
        userId={user.id}
      />

      <ProfileDrawer
        user={user}
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  )
}
