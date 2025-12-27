"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Users, UserCog, QrCode, ChefHat, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminDropdownProps {
  userEmail: string
}

export function AdminDropdown({ userEmail }: AdminDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

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
    setIsOpen(false)
  }

  return (
    <div className="w-full">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin Portal
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1">
          <div 
            onClick={() => handleMenuClick("prashad")}
            className="hover:bg-blue-50 cursor-pointer px-4 py-3 flex items-center border-b border-gray-100 last:border-b-0"
          >
            <ChefHat className="mr-3 h-4 w-4 text-blue-600" />
            <span className="font-medium">Prasad Management</span>
          </div>
          <div 
            onClick={() => handleMenuClick("orders")}
            className="hover:bg-blue-50 cursor-pointer px-4 py-3 flex items-center border-b border-gray-100 last:border-b-0"
          >
            <Users className="mr-3 h-4 w-4 text-blue-600" />
            <span className="font-medium">User Order Section</span>
          </div>
          <div 
            onClick={() => handleMenuClick("profile")}
            className="hover:bg-blue-50 cursor-pointer px-4 py-3 flex items-center border-b border-gray-100 last:border-b-0"
          >
            <UserCog className="mr-3 h-4 w-4 text-blue-600" />
            <span className="font-medium">Admin Profile Settings</span>
          </div>
          <div 
            onClick={() => handleMenuClick("qr-scan")}
            className="hover:bg-blue-50 cursor-pointer px-4 py-3 flex items-center"
          >
            <QrCode className="mr-3 h-4 w-4 text-blue-600" />
            <span className="font-medium">QR Code Scan & Validity</span>
          </div>
        </div>
      )}
    </div>
  )
}