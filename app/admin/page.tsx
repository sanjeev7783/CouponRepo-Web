"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PrashadManager } from "@/components/prashad-manager"
import { createClient } from "@/lib/supabase/client"
import { isAuthorizedAdmin } from "@/lib/admin-config"

interface User {
  email: string
  authenticated: boolean
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      // Check localStorage for user
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/auth/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Only allow authorized admin users
      if (!isAuthorizedAdmin(parsedUser.email)) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Check if user is admin in database
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", parsedUser.email)
      
      setIsAdmin(!!(adminUser && adminUser.length > 0))
      
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <PrashadManager userEmail={user.email} />
    </div>
  )
}