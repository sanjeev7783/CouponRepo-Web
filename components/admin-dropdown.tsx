"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Users, UserCog, QrCode, ChefHat, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminDropdownProps {
  userEmail: string
}

export function AdminDropdown({ userEmail }: AdminDropdownProps) {
  const router = useRouter()

  const handleMenuClick = (action: string) => {
    switch (action) {
      case "prashad":
        router.push("/admin")
        break
      case "orders":
        router.push("/admin/orders")
        break
      case "profile":
        router.push("/admin/profile")
        break
      case "qr-scan":
        router.push("/admin/qr-scan")
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Settings className="mr-2 h-4 w-4" />
          Admin Portal
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="w-full bg-white border border-gray-200 shadow-lg rounded-md z-50">
        <DropdownMenuItem 
          onClick={() => handleMenuClick("prashad")}
          className="hover:bg-blue-50 cursor-pointer px-4 py-3"
        >
          <ChefHat className="mr-3 h-4 w-4 text-blue-600" />
          <span className="font-medium">Prasad Management</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleMenuClick("orders")}
          className="hover:bg-blue-50 cursor-pointer px-4 py-3"
        >
          <Users className="mr-3 h-4 w-4 text-blue-600" />
          <span className="font-medium">User Order Section</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleMenuClick("profile")}
          className="hover:bg-blue-50 cursor-pointer px-4 py-3"
        >
          <UserCog className="mr-3 h-4 w-4 text-blue-600" />
          <span className="font-medium">Admin Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleMenuClick("qr-scan")}
          className="hover:bg-blue-50 cursor-pointer px-4 py-3"
        >
          <QrCode className="mr-3 h-4 w-4 text-blue-600" />
          <span className="font-medium">QR Code Scan & Validity</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}