"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminProfile {
  id: string
  email: string
  name: string
  phone_number: string
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/auth/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      
      // Check admin status and fetch profile
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", parsedUser.email)
        .single()
      
      if (!adminUser) {
        router.push('/coupons')
        return
      }

      setIsAdmin(true)
      setProfile(adminUser)
      setLoading(false)
    }

    checkAuthAndFetchProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({
          email: profile.email,
          name: profile.name,
          phone_number: profile.phone_number
        })
        .eq("id", profile.id)

      if (error) throw error

      // Update localStorage if email changed
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        parsedUser.email = profile.email
        localStorage.setItem('user', JSON.stringify(parsedUser))
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin || !profile) {
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
          <h1 className="text-4xl font-bold text-amber-900">Admin Profile Settings</h1>
        </div>

        <Card className="max-w-md mx-auto border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Update Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone_number || ""}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}