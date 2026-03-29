'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Deal {
  id: string
  deal_number: string
  property_address: string
  deal_type: string
  status: string
  stage: string
  deal_amount: number | null
  close_date: string | null
  created_at: string
}

interface Milestone {
  id: string
  title: string
  milestone_type: string
  status: string
}

interface Party {
  id: string
  role: string
  is_primary: boolean
  party_id: string | null
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchDeal = async () => {
      const { data: dealData, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !dealData) {
        router.push('/deals')
        return
      }

      setDeal(dealData)

      // Fetch milestones
      const { data: ms } = await supabase
        .from('deal_milestones')
        .select('*')
        .eq('deal_id', params.id)
        .order('created_at')

      setMilestones(ms || [])

      // Fetch parties
      const { data: pts } = await supabase
        .from('deal_parties')
        .select('*')
        .eq('deal_id', params.id)

      setParties(pts || [])
      setLoading(false)
    }

    fetchDeal()
  }, [params.id])

  const toggleMilestone = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed'
    
    await supabase
      .from('deal_milestones')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', milestone.id)

    setMilestones(milestones.map(m => 
      m.id === milestone.id ? { ...m, status: newStatus } : m
    ))
  }

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const dealTypeIcon = (type: string) => {
    switch(type) {
      case 'buy': return '🏠'
      case 'sell': return '🔑'
      case 'dual': return '🤝'
      case 'referral': return '📨'
      default: return '📋'
    }
  }

  const statusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'closed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!deal) return null

  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalMilestones = milestones.length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/deals')}
          className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Deals
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{dealTypeIcon(deal.deal_type)}</span>
              <h1 className="text-2xl font-bold text-gray-900">{deal.deal_number}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(deal.status)}`}>
                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{deal.property_address}</p>
          </div>
          {deal.deal_amount && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Deal Amount</div>
              <div className="text-xl font-bold text-gray-900">
                ${deal.deal_amount.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Type</div>
          <div className="font-semibold text-gray-900 mt-1 capitalize">{deal.deal_type} Side</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Stage</div>
          <div className="font-semibold text-gray-900 mt-1 capitalize">{deal.stage}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Close Date</div>
          <div className="font-semibold text-gray-900 mt-1">
            {deal.close_date ? new Date(deal.close_date + 'T12:00:00').toLocaleDateString() : 'TBD'}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="font-semibold text-gray-900 mt-1">{completedMilestones}/{totalMilestones}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Milestones - 2 cols */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {milestones.map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    milestone.status === 'completed'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300'
                  }`}>
                    {milestone.status === 'completed' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    milestone.status === 'completed'
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </span>
                </button>
              ))}

              {milestones.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No milestones yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Parties + Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parties</h2>
            <div className="space-y-3">
              {parties.map((party) => (
                <div key={party.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xs font-medium">
                      {formatRole(party.role).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{formatRole(party.role)}</div>
                    <div className="text-xs text-gray-500">{party.is_primary ? 'Primary' : 'Additional'}</div>
                  </div>
                </div>
              ))}
              {parties.length === 0 && (
                <p className="text-gray-400 text-sm">No parties added</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📄 Upload Document
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                ✉️ Send Communication
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📝 Add Note
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                👤 Add Party
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h2>
            <div className="text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Created {new Date(deal.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
