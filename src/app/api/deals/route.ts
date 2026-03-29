import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: deals, error } = await supabase
      .from('deals')
      .select(`
        *,
        deal_parties (
          id,
          role,
          is_primary,
          party_id
        ),
        deal_milestones (
          id,
          title,
          status,
          milestone_type
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deals: deals || [] })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
