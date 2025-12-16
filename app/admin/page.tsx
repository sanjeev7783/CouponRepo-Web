import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrashadManager } from "@/components/prashad-manager"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
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
      <PrashadManager userEmail={user.email || ""} />
    </div>
  )
}