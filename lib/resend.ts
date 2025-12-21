import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Temple Coupons <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Login OTP - Temple Coupons',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #92400e;">Temple Coupons - Login OTP</h2>
          <p>Your one-time password (OTP) for login is:</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #92400e; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return { success: false, error }
  }
}