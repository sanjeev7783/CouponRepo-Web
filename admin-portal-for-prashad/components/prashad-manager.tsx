"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrashadCard } from "@/components/prashad-card"
import { Plus, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Prashad, MealTime } from "@/lib/types"

interface PrashadManagerProps {
  userEmail: string
}

export function PrashadManager({ userEmail }: PrashadManagerProps) {
  const [prashads, setPrashads] = useState<Prashad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    meal_time: "breakfast" as MealTime,
    image_url: "",
    is_available: true,
  })

  useEffect(() => {
    loadPrashads()
  }, [])

  const loadPrashads = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("prashad")
      .select("*")
      .order("meal_time", { ascending: true })
      .order("name", { ascending: true })

    if (!error && data) {
      setPrashads(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      const { error } = await supabase.from("prashad").update(formData).eq("id", editingId)

      if (!error) {
        await loadPrashads()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("prashad").insert([formData])

      if (!error) {
        await loadPrashads()
        resetForm()
      }
    }
  }

  const handleEdit = (prashad: Prashad) => {
    setFormData({
      name: prashad.name,
      description: prashad.description || "",
      meal_time: prashad.meal_time,
      image_url: prashad.image_url || "",
      is_available: prashad.is_available,
    })
    setEditingId(prashad.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prashad item?")) {
      const { error } = await supabase.from("prashad").delete().eq("id", id)

      if (!error) {
        await loadPrashads()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      meal_time: "breakfast",
      image_url: "",
      is_available: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getPrashadsByMealTime = (mealTime: MealTime) => {
    return prashads.filter((p) => p.meal_time === mealTime)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Prashad Management</h1>
          <p className="text-muted-foreground mt-1">Logged in as: {userEmail}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="mb-6">
          <Plus className="mr-2 h-4 w-4" />
          Add New Prashad
        </Button>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Prashad" : "Add New Prashad"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Masala Dosa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal_time">Meal Time *</Label>
                  <Select
                    value={formData.meal_time}
                    onValueChange={(value: MealTime) => setFormData({ ...formData, meal_time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the prashad item..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Prashad</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="breakfast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakfast">Breakfast ({getPrashadsByMealTime("breakfast").length})</TabsTrigger>
          <TabsTrigger value="lunch">Lunch ({getPrashadsByMealTime("lunch").length})</TabsTrigger>
          <TabsTrigger value="dinner">Dinner ({getPrashadsByMealTime("dinner").length})</TabsTrigger>
        </TabsList>

        {(["breakfast", "lunch", "dinner"] as MealTime[]).map((mealTime) => (
          <TabsContent key={mealTime} value={mealTime} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : getPrashadsByMealTime(mealTime).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No {mealTime} items added yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getPrashadsByMealTime(mealTime).map((prashad) => (
                  <PrashadCard key={prashad.id} prashad={prashad} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
