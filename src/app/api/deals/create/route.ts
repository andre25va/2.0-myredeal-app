import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      deal_type,
      property_address,
      city,
      state,
      zip,
      deal_amount,
      close_date,
      parties // array of { first_name, last_name, email, phone, role }
    } = body

    // Validate required fields
    if (!deal_type || !property_address) {
      return NextResponse.json({ error: 'Deal type and property address are required' }, { status: 400 })
    }

    // Generate deal number
    const { data: seqData, error: seqError } = await supabase.rpc('generate_deal_number')
    
    let dealNumber = 'MRD-' + Date.now().toString().slice(-6)
    if (seqData && !seqError) {
      dealNumber = seqData
    }

    // Get org_id (first org for now - single tenant)
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Create the deal
    const fullAddress = [property_address, city, state, zip].filter(Boolean).join(', ')
    
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        org_id: org?.id || '00000000-0000-0000-0000-000000000000',
        deal_number: dealNumber,
        property_address: fullAddress,
        deal_type: deal_type,
        status: 'active',
        stage: 'new',
        deal_amount: deal_amount ? parseFloat(deal_amount) : null,
        close_date: close_date || null,
        assigned_tc: user?.id || null
      })
      .select()
      .single()

    if (dealError) {
      console.error('Deal creation error:', dealError)
      return NextResponse.json({ error: 'Failed to create deal: ' + dealError.message }, { status: 500 })
    }

    // Create contacts and deal_parties for each party
    if (parties && parties.length > 0) {
      for (const party of parties) {
        // Create or find contact
        let contactId = null
        
        if (party.email || party.phone) {
          // Check if contact exists
          let query = supabase.from('contacts').select('id')
          if (party.email) {
            query = query.eq('email', party.email)
          } else if (party.phone) {
            query = query.eq('phone', party.phone)
          }
          
          const { data: existing } = await query.limit(1).single()
          
          if (existing) {
            contactId = existing.id
          } else {
            const { data: newContact } = await supabase
              .from('contacts')
              .insert({
                org_id: org?.id || null,
                first_name: party.first_name || '',
                last_name: party.last_name || '',
                email: party.email || null,
                phone: party.phone || null,
                contact_type: party.role === 'agent' ? 'agent' : 'client',
                created_by: user?.id || null
              })
              .select('id')
              .single()
            
            if (newContact) contactId = newContact.id
          }
        }

        // Create deal_party
        await supabase
          .from('deal_parties')
          .insert({
            deal_id: deal.id,
            party_id: contactId,
            role: party.role || 'buyer',
            is_primary: party.is_primary || false
          })
      }
    }

    // Create default milestones based on deal type
    const milestones = getDefaultMilestones(deal_type)
    for (let i = 0; i < milestones.length; i++) {
      await supabase
        .from('deal_milestones')
        .insert({
          deal_id: deal.id,
          milestone_type: milestones[i].type,
          title: milestones[i].title,
          status: 'pending'
        })
    }

    return NextResponse.json({ 
      success: true, 
      deal: {
        id: deal.id,
        deal_number: deal.deal_number,
        property_address: deal.property_address,
        deal_type: deal.deal_type,
        status: deal.status
      }
    })

  } catch (error) {
    console.error('Deal creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDefaultMilestones(dealType: string) {
  const common = [
    { type: 'listing', title: 'Listing/Contract Received' },
    { type: 'review', title: 'Contract Review Complete' },
    { type: 'earnest_money', title: 'Earnest Money Deposited' },
    { type: 'inspection', title: 'Inspection Period' },
    { type: 'appraisal', title: 'Appraisal Ordered' },
    { type: 'title', title: 'Title Work Ordered' },
    { type: 'mortgage', title: 'Mortgage Commitment' },
    { type: 'final_walkthrough', title: 'Final Walkthrough' },
    { type: 'closing', title: 'Closing' },
    { type: 'commission', title: 'Commission Disbursed' }
  ]

  if (dealType === 'referral') {
    return [
      { type: 'referral_sent', title: 'Referral Sent' },
      { type: 'referral_accepted', title: 'Referral Accepted' },
      { type: 'deal_closed', title: 'Deal Closed' },
      { type: 'commission', title: 'Referral Fee Received' }
    ]
  }

  return common
}
