"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    console.log('Success page loaded')
    // Check if user is authenticated
    const userData = localStorage.getItem('user')
    console.log('User data from localStorage:', userData)
    
    if (userData) {
      console.log('User found, redirecting to coupons in 1 second')
      // Redirect to coupons after a short delay
      setTimeout(() => {
        console.log('Redirecting to coupons now')
        window.location.href = '/coupons'
      }, 1000)
    } else {
      console.log('No user data found, redirecting to login')
      // No user data, redirect back to login
      setTimeout(() => {
        router.push('/auth/login')
      }, 1000)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-900 mb-4">Login Successful!</h1>
        <p className="text-amber-700">Redirecting to coupons...</p>
      </div>
    </div>
  )
}