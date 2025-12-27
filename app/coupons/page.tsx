"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CouponList } from "@/components/coupon-list"
import { createClient } from "@/lib/supabase/client"

interface User {
  email: string
  authenticated: boolean
}

export default function CouponsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [coupons, setCoupons] = useState<any[]>([])
  const [prashads, setPrashads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking auth in coupons page')
      const userData = localStorage.getItem('user')
      console.log('User data from localStorage:', userData)
      
      if (userData) {
        const parsedUser = JSON.parse(userData)
        console.log('Parsed user:', parsedUser)
        setUser(parsedUser)
      } else {
        // Create guest user
        setUser({ email: 'guest@temple.com', authenticated: false })
      }
    }

    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 100)
  }, [router])

  useEffect(() => {
    // Fetch data for both authenticated and guest users
    const fetchData = async () => {
      console.log('Fetching data')
      const supabase = createClient()
      
      const [couponsResult, prashadResult] = await Promise.all([
        supabase.from("coupons").select("*").eq("available", true).order("category", { ascending: true }),
        supabase.from("prashad").select("*").eq("is_available", true).order("meal_time", { ascending: true }).order("name", { ascending: true })
      ])

      setCoupons(couponsResult.data || [])
      setPrashads(prashadResult.data || [])
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <CouponList coupons={coupons} prashads={prashads} user={user} />
    </div>
  )
}
