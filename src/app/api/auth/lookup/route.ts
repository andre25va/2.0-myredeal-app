import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for admin-level access to staff_directory
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Normalize phone: strip everything except digits, ensure +1 prefix
    const digits = phone.replace(/\D/g, '')
    const normalized = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : phone

    const supabase = createAdminClient()

    // Look up the staff member by phone number
    const { data, error } = await supabase
      .from('staff_directory')
      .select('email, first_name, last_name, is_active')
      .eq('phone', normalized)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Phone number not found. Only authorized TC staff can log in.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      email: data.email,
      name: `${data.first_name} ${data.last_name}`.trim(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
