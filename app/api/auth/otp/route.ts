import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/resend'

const otpStore = new Map<string, { otp: string; expires: number }>()

function generateOTP(): string {
  return Math.random().toString().slice(2, 10)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000

    otpStore.set(email, { otp, expires })

    const result = await sendOTPEmail(email, otp)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/auth/otp called')
  try {
    const { email, otp } = await request.json()
    console.log('Received email:', email, 'OTP:', otp)

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const stored = otpStore.get(email)
    console.log('Stored OTP data:', stored)

    if (!stored) {
      return NextResponse.json({ error: 'OTP not found' }, { status: 400 })
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(email)
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }

    if (stored.otp !== otp) {
      console.log('OTP mismatch. Expected:', stored.otp, 'Received:', otp)
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // OTP verified - skip Supabase user creation for now
    otpStore.delete(email)
    console.log('OTP verified successfully for:', email)
    
    // Return user data for client-side session
    return NextResponse.json({ 
      success: true, 
      user: { email, authenticated: true } 
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}