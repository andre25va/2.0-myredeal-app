'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Home,
  Key,
  Handshake,
  Send,
  FileText,
  Mail,
  StickyNote,
  UserPlus,
  Upload,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  Clock,
  Users,
  MoreHorizontal,
} from 'lucide-react'

/* ───── types ───── */

interface Deal {
  id: string
  deal_number: string
  property_address: string
  city?: string
  state?: string
  zip?: string
  deal_type: string
  status: string
  stage: string
  deal_amount: number | null
  close_date: string | null
  created_at: string
  ai_extracted?: boolean
}

interface Milestone {
  id: string
  title: string
  milestone_type: string
  status: string
  sort_order?: number
}

interface Party {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role: string
  is_primary: boolean
  party_id: string | null
}

/* ───── helpers ───── */

const dealTypeConfig: Record<string, { icon: typeof Home; label: string; color: string }> = {
  buy: { icon: Home, label: 'Buy Side', color: 'bg-blue-100 text-blue-700' },
  sell: { icon: Key, label: 'Sell / Listing', color: 'bg-emerald-100 text-emerald-700' },
  dual: { icon: Handshake, label: 'Dual Agency', color: 'bg-purple-100 text-purple-700' },
  referral: { icon: Send, label: 'Referral', color: 'bg-amber-100 text-amber-700' },
}

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed: { label: 'Closed', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', bg: 'bg-red-50 text-red-700 border-red-200' },
}

const formatRole = (role: string) =>
  role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

/* ───── component ───── */

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

      const { data: ms } = await supabase
        .from('deal_milestones')
        .select('*')
        .eq('deal_id', params.id)
        .order('created_at')

      setMilestones(ms || [])

      const { data: pts } = await supabase
        .from('deal_parties')
        .select('*')
        .eq('deal_id', params.id)

      setParties(pts || [])
      setLoading(false)
    }

    fetchDeal()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const toggleMilestone = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed'

    await supabase
      .from('deal_milestones')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', milestone.id)

    setMilestones(
      milestones.map((m) => (m.id === milestone.id ? { ...m, status: newStatus } : m))
    )
  }

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading deal...</p>
        </div>
      </div>
    )
  }

  if (!deal) return null

  const completedMilestones = milestones.filter((m) => m.status === 'completed').length
  const totalMilestones = milestones.length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  const typeConfig = dealTypeConfig[deal.deal_type] || { icon: FileText, label: deal.deal_type, color: 'bg-gray-100 text-gray-700' }
  const TypeIcon = typeConfig.icon
  const stConfig = statusConfig[deal.status] || { label: deal.status, dot: 'bg-gray-400', bg: 'bg-gray-50 text-gray-700 border-gray-200' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/deals')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Deals
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{deal.deal_number}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stConfig.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stConfig.dot}`} />
                  {stConfig.label}
                </span>
                {deal.ai_extracted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-700">
                    AI Imported
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {deal.property_address}
                {deal.city && `, ${deal.city}`}
                {deal.state && `, ${deal.state}`}
                {deal.zip && ` ${deal.zip}`}
              </div>
            </div>
          </div>
          {deal.deal_amount && (
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Amount</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">
                {formatCurrency(deal.deal_amount)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: FileText, label: 'Type', value: typeConfig.label },
          { icon: TrendingUp, label: 'Stage', value: deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1) },
          {
            icon: Calendar,
            label: 'Close Date',
            value: deal.close_date
              ? new Date(deal.close_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'TBD',
          },
          {
            icon: CheckCircle2,
            label: 'Progress',
            value: `${completedMilestones} / ${totalMilestones}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <stat.icon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones — 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Milestones</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {Math.round(progress)}% complete
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {milestones.map((milestone, index) => {
                const isCompleted = milestone.status === 'completed'
                return (
                  <button
                    key={milestone.id}
                    onClick={() => toggleMilestone(milestone)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors text-left group"
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300 group-hover:border-purple-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${
                      isCompleted
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900 group-hover:text-purple-700'
                    }`}>
                      {milestone.title}
                    </span>
                  </button>
                )
              })}

              {milestones.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <Circle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No milestones yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Parties */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Parties</h2>
              <span className="text-xs text-gray-400">{parties.length}</span>
            </div>
            <div className="space-y-3">
              {parties.map((party) => {
                const initials = ((party.first_name?.[0] || '') + (party.last_name?.[0] || '')).toUpperCase() || formatRole(party.role)[0]
                const name = party.first_name && party.last_name
                  ? `${party.first_name} ${party.last_name}`
                  : formatRole(party.role)
                return (
                  <div key={party.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {name}
                        {party.is_primary && (
                          <span className="ml-1.5 text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{formatRole(party.role)}</div>
                    </div>
                  </div>
                )
              })}
              {parties.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No parties added</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-1">
              {[
                { icon: Upload, label: 'Upload Document' },
                { icon: Mail, label: 'Send Communication' },
                { icon: StickyNote, label: 'Add Note' },
                { icon: UserPlus, label: 'Add Party' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                >
                  <action.icon className="w-4 h-4 text-gray-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h2>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-900">Deal created</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(deal.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
