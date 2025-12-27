"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { Plus, Minus, Trash2 } from "lucide-react"
import { CheckoutForm } from "@/components/checkout-form"

interface CartProps {
  cart: CartItem[]
  open: boolean
  onClose: () => void
  onUpdateQuantity: (itemId: string, delta: number, type?: 'coupon' | 'prashad') => void
  totalPrice: number
  userId: string
}

export function Cart({ cart, open, onClose, onUpdateQuantity, totalPrice, userId }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false)

  if (showCheckout) {
    return (
      <CheckoutForm
        cart={cart}
        totalPrice={totalPrice}
        userId={userId}
        onBack={() => setShowCheckout(false)}
        onClose={onClose}
      />
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>Review your selected items</SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col h-full mx-3 mb-4">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-scroll mb-4">
                <div className="flex flex-col gap-4">
                  {cart.map((item) => {
                    const isProshad = !!item.prashad
                    const itemData = item.coupon || item.prashad
                    const itemId = itemData?.id || ''
                    const itemName = itemData?.name || ''
                    const itemImage = item.coupon?.image_url || item.prashad?.image_url
                    const itemPrice = item.coupon?.price_in_cents || 0

                    return (
                      <div key={itemId} className="flex items-center gap-3 border rounded-lg p-3">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img
                            src={itemImage || "/placeholder.svg"}
                            alt={itemName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {isProshad ? (
                              `₹${((item.prashad?.price_in_cents || 0) / 100).toFixed(2)} × ${item.quantity}`
                            ) : (
                              `₹${(itemPrice / 100).toFixed(2)} × ${item.quantity}`
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onUpdateQuantity(itemId, -1, isProshad ? 'prashad' : 'coupon')}
                            className="h-8 w-8"
                          >
                            {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onUpdateQuantity(itemId, 1, isProshad ? 'prashad' : 'coupon')}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="sticky bottom-0 bg-background border-t pt-4 space-y-2 mt-auto">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-amber-700">₹{(totalPrice / 100).toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
