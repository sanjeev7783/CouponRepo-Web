"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Users, UserCog, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminOTPVerification } from "@/components/admin-otp-verification"

interface AdminDropdownProps {
  userEmail: string
}

export function AdminDropdown({ userEmail }: AdminDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<string>('')

  const checkAdminSession = () => {
    const verified = localStorage.getItem('admin_verified')
    const verifiedAt = localStorage.getItem('admin_verified_at')
    
    if (verified && verifiedAt) {
      const timeDiff = Date.now() - parseInt(verifiedAt)
      // Session valid for 1 hour
      return timeDiff < 60 * 60 * 1000
    }
    return false
  }

  const handleMenuClick = (action: string) => {
    if (checkAdminSession()) {
      // Direct access if already verified
      navigateToAction(action)
    } else {
      // Require OTP verification
      setPendingAction(action)
      setShowOTPDialog(true)
    }
    setIsOpen(false)
  }

  const navigateToAction = (action: string) => {
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
    }
  }

  const handleOTPSuccess = () => {
    if (pendingAction) {
      navigateToAction(pendingAction)
      setPendingAction('')
    }
  }

  return (
    <>
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
              <Settings className="mr-3 h-4 w-4 text-blue-600" />
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
              className="hover:bg-blue-50 cursor-pointer px-4 py-3 flex items-center"
            >
              <UserCog className="mr-3 h-4 w-4 text-blue-600" />
              <span className="font-medium">Admin Profile Settings</span>
            </div>
          </div>
        )}
      </div>

      <AdminOTPVerification 
        open={showOTPDialog}
        onClose={() => {
          setShowOTPDialog(false)
          setPendingAction('')
        }}
        userEmail={userEmail}
      />
    </>
  )
}