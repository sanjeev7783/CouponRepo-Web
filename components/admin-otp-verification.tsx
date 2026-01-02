"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminOTPVerificationProps {
  open: boolean
  onClose: () => void
  userEmail: string
}

export function AdminOTPVerification({ open, onClose, userEmail }: AdminOTPVerificationProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const requestOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })

      if (response.ok) {
        setStep('verify')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp })
      })

      if (response.ok) {
        // Store admin session
        localStorage.setItem('admin_verified', 'true')
        localStorage.setItem('admin_verified_at', Date.now().toString())
        onClose()
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('request')
    setOtp('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Verification
          </DialogTitle>
          <DialogDescription>
            {step === 'request' 
              ? 'Verify your admin access to continue'
              : 'Enter the OTP sent to your email'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'request' ? (
            <>
              <div className="text-center py-4">
                <Mail className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  An OTP will be sent to your registered email for verification
                </p>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button 
                onClick={requestOTP} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('request')}
                  className="flex-1"
                >
                  Resend OTP
                </Button>
                <Button 
                  onClick={verifyOTP} 
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}