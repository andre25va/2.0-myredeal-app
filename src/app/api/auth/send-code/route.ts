import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phone, method } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Create admin Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up staff member by phone
    const { data: staff, error: lookupError } = await supabase
      .from('staff_directory')
      .select('email, first_name, is_active')
      .eq('phone', phone)
      .eq('is_active', true)
      .single()

    if (lookupError || !staff) {
      return NextResponse.json(
        { error: 'Phone number not found. Only authorized TC staff can log in.' },
        { status: 404 }
      )
    }

    if (method === 'sms') {
      return NextResponse.json(
        { error: 'SMS login coming soon. Please use email for now.' },
        { status: 400 }
      )
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate any existing codes for this phone
    await supabase
      .from('auth_codes')
      .update({ used: true })
      .eq('phone', phone)
      .eq('used', false)

    // Store the code
    const { error: insertError } = await supabase
      .from('auth_codes')
      .insert({
        phone,
        email: staff.email,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Failed to store auth code:', insertError)
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
    }

    // Send email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MyReDeal <onboarding@resend.dev>',
        to: [staff.email],
        subject: `Your MyReDeal login code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7C3AED; margin-bottom: 8px;">MyReDeal Login</h2>
            <p style="color: #6B7280; margin-bottom: 24px;">Hi${staff.first_name ? ` ${staff.first_name}` : ''}, here's your login code:</p>
            <div style="background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
            </div>
            <p style="color: #9CA3AF; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!resendRes.ok) {
      const resendError = await resendRes.text()
      console.error('Resend error:', resendError)
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
    }

    // Mask email for display
    const [localPart, domain] = staff.email.split('@')
    const maskedEmail = `${localPart.slice(0, 2)}***@${domain}`

    return NextResponse.json({
      success: true,
      maskedEmail,
      message: `Code sent to ${maskedEmail}`,
    })
  } catch (err) {
    console.error('Send code error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
