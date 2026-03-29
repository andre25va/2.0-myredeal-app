import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
    }

    // Create admin Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Find the code
    const { data: authCode, error: findError } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .single()

    if (findError || !authCode) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
    }

    // Check expiry
    if (new Date(authCode.expires_at) < new Date()) {
      await supabase.from('auth_codes').update({ used: true }).eq('id', authCode.id)
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    // Mark code as used
    await supabase.from('auth_codes').update({ used: true }).eq('id', authCode.id)

    // Find or create the user in Supabase Auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    let user = users?.find(u => u.email === authCode.email)

    if (!user || userError) {
      // Create the user if they don't exist
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: authCode.email,
        email_confirm: true,
        user_metadata: { phone: authCode.phone },
      })

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }
      user = newUser.user
    }

    // Generate magic link to get the token hash (not for redirect)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authCode.email,
    })

    if (linkError || !linkData) {
      console.error('Failed to generate link:', linkError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Return the token hash so the client can verify locally
    return NextResponse.json({
      success: true,
      token_hash: linkData.properties?.hashed_token,
      email: authCode.email,
    })
  } catch (err) {
    console.error('Verify code error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
