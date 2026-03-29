'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false })

      setDeals(data || [])
      setLoading(false)
    }

    fetchDeals()
  }, [])

  const filteredDeals = deals.filter(deal => {
    const matchesFilter = filter === 'all' || deal.deal_type === filter
    const matchesSearch = !search || 
      deal.property_address.toLowerCase().includes(search.toLowerCase()) ||
      deal.deal_number.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{deals.length} total deals</p>
        </div>
        <button
          onClick={() => router.push('/deals/new')}
          className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Deal
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'buy', label: '🏠 Buy' },
            { value: 'sell', label: '🔑 Sell' },
            { value: 'dual', label: '🤝 Dual' },
            { value: 'referral', label: '📨 Referral' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <button
              key={deal.id}
              onClick={() => router.push(`/deals/${deal.id}`)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{dealTypeIcon(deal.deal_type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{deal.deal_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(deal.status)}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{deal.property_address}</p>
                  </div>
                </div>
                <div className="text-right">
                  {deal.deal_amount && (
                    <div className="font-semibold text-gray-900">${deal.deal_amount.toLocaleString()}</div>
                  )}
                  {deal.close_date && (
                    <div className="text-xs text-gray-500">Close: {new Date(deal.close_date + 'T12:00:00').toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900">No deals yet</h3>
          <p className="text-gray-500 mt-1 mb-4">Create your first deal to get started</p>
          <button
            onClick={() => router.push('/deals/new')}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            Create New Deal
          </button>
        </div>
      )}
    </div>
  )
}
