import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-config'

// This should match the store from request-otp
declare global {
  var otpStore: Map<string, { otp: string, expires: number }> | undefined
}

if (!global.otpStore) {
  global.otpStore = new Map()
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp || !isAuthorizedAdmin(email)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const storedOTP = global.otpStore.get(email)
    
    if (!storedOTP) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 })
    }

    if (Date.now() > storedOTP.expires) {
      global.otpStore.delete(email)
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }

    if (storedOTP.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // OTP verified successfully
    global.otpStore.delete(email)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}