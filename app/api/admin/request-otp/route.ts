import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-config'

// Store OTPs temporarily (in production, use Redis or database)
declare global {
  var otpStore: Map<string, { otp: string, expires: number }> | undefined
}

if (!global.otpStore) {
  global.otpStore = new Map()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !isAuthorizedAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store OTP
    global.otpStore.set(email, { otp, expires })

    // In production, send email using Resend
    console.log(`OTP for ${email}: ${otp}`) // For development

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}