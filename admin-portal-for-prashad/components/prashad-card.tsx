"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { Prashad } from "@/lib/types"
import Image from "next/image"

interface PrashadCardProps {
  prashad: Prashad
  onEdit: (prashad: Prashad) => void
  onDelete: (id: string) => void
}

export function PrashadCard({ prashad, onEdit, onDelete }: PrashadCardProps) {
  return (
    <Card className="overflow-hidden">
      {prashad.image_url && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={prashad.image_url || "/placeholder.svg"}
            alt={prashad.name}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(prashad.name)}`
            }}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{prashad.name}</CardTitle>
          <Badge variant={prashad.is_available ? "default" : "secondary"}>
            {prashad.is_available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {prashad.description && <p className="text-sm text-muted-foreground mb-4">{prashad.description}</p>}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(prashad)} className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(prashad.id)} className="flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
