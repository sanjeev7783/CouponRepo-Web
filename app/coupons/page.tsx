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
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking auth in coupons page')
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
      setAuthChecked(true)
    }

    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 100)
  }, [router])

  useEffect(() => {
    if (!authChecked || !user) return

    // Fetch data only after auth is confirmed
    const fetchData = async () => {
      console.log('Fetching data for authenticated user')
      const supabase = createClient()
      
      const [couponsResult, prashadResult] = await Promise.all([
        supabase.from("coupons").select("*").eq("available", true).order("category", { ascending: true }),
        supabase.from("prashad").select("*").eq("is_available", true).order("meal_time", { ascending: true }).order("name", { ascending: true })
      ])

      setCoupons(couponsResult.data || [])
      setPrashads(prashadResult.data || [])
      setLoading(false)
    }

    fetchData()
  }, [authChecked, user])

  if (!authChecked || loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <CouponList coupons={coupons} prashads={prashads} user={user} />
    </div>
  )
}
