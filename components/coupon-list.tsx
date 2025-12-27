"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Minus, ArrowLeft, User, LogIn, Search, Filter, X } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [mealTimeFilter, setMealTimeFilter] = useState<string>("")
  const [filteredPrashads, setFilteredPrashads] = useState<Prashad[]>(prashads)

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

  // Filter prashads based on search and meal time
  const applyFilters = () => {
    let filtered = prashads

    if (searchQuery) {
      filtered = filtered.filter(prashad =>
        prashad.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (mealTimeFilter) {
      filtered = filtered.filter(prashad => prashad.meal_time === mealTimeFilter)
    }

    setFilteredPrashads(filtered)
  }

  // Apply filters when dependencies change
  React.useEffect(() => {
    applyFilters()
  }, [searchQuery, mealTimeFilter, prashads])

  const resetFilters = () => {
    setSearchQuery("")
    setMealTimeFilter("")
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900 mb-2">
              {user.authenticated ? `Welcome, ${user.email?.split("@")[0]}!` : "Welcome to Temple Coupons!"}
            </h1>
            <p className="text-base sm:text-lg text-amber-700">Select your temple coupons</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 relative flex-1 sm:flex-none" onClick={() => setShowCart(true)}>
              <div className="relative mr-2">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-1 bg-orange-600 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center">{totalItems}</span>
                )}
              </div>
              Cart
            </Button>
            {user.authenticated ? (
              <Button size="lg" variant="outline" className="border-amber-300" onClick={() => setShowProfile(true)}>
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="border-amber-300" onClick={() => window.location.href = '/auth/login'}>
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {prashads.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Temple Prashad</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-amber-700" />
                  <div className="relative">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-48 pr-8"
                      placeholder="Search by Name"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-amber-700" />
                  <Select value={mealTimeFilter} onValueChange={setMealTimeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by meal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(searchQuery || mealTimeFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrashads.map((prashad) => {
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
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-amber-700">₹{((prashad.price_in_cents || 0) / 100).toFixed(2)}</p>
                        <Badge variant="default">Available</Badge>
                      </div>
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

        {/* {Object.entries(groupedCoupons).map(([category, coupons]) => (
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
        ))} */}
      </div>

      <Cart
        cart={cart}
        open={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateQuantity}
        totalPrice={totalPrice}
        userId={user.email}
      />

      {user.authenticated && (
        <ProfileDrawer
          user={user}
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  )
}
