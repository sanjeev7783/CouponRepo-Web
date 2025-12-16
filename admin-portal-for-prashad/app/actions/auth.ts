"use server"

import { createClient } from "@/lib/supabase/server"

export async function createAdminUser(userId: string, email: string) {
  const supabase = await createClient()

  try {
    // Call the database function that bypasses RLS
    const { error } = await supabase.rpc("create_admin_user", {
      user_id: userId,
      user_email: email,
    })

    if (error) {
      console.error("[v0] Error calling create_admin_user function:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in createAdminUser action:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create admin user",
    }
  }
}
