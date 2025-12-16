import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Prashad, MealTime } from "@/lib/types"
import Image from "next/image"

export default async function PrashadPage() {
  const supabase = await createClient()
  
  const { data: prashads } = await supabase
    .from("prashad")
    .select("*")
    .eq("is_available", true)
    .order("meal_time", { ascending: true })
    .order("name", { ascending: true })

  const getPrashadsByMealTime = (mealTime: MealTime) => {
    return prashads?.filter((p) => p.meal_time === mealTime) || []
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-8">Temple Prashad Menu</h1>
      
      <Tabs defaultValue="breakfast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakfast">Breakfast ({getPrashadsByMealTime("breakfast").length})</TabsTrigger>
          <TabsTrigger value="lunch">Lunch ({getPrashadsByMealTime("lunch").length})</TabsTrigger>
          <TabsTrigger value="dinner">Dinner ({getPrashadsByMealTime("dinner").length})</TabsTrigger>
        </TabsList>

        {(["breakfast", "lunch", "dinner"] as MealTime[]).map((mealTime) => (
          <TabsContent key={mealTime} value={mealTime} className="mt-6">
            {getPrashadsByMealTime(mealTime).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No {mealTime} items available.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getPrashadsByMealTime(mealTime).map((prashad) => (
                  <Card key={prashad.id}>
                    {prashad.image_url && (
                      <div className="relative h-48 w-full bg-muted">
                        <Image
                          src={prashad.image_url}
                          alt={prashad.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{prashad.name}</CardTitle>
                        <Badge variant="default">Available</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {prashad.description && (
                        <p className="text-sm text-muted-foreground">{prashad.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}