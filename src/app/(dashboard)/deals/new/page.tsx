'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DealType = 'buy' | 'sell' | 'dual' | 'referral' | ''

interface Party {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  is_primary: boolean
}

const DEAL_TYPES = [
  { value: 'buy', label: 'Buy Side', icon: '🏠', description: 'Representing the buyer in a purchase' },
  { value: 'sell', label: 'Sell Side', icon: '🔑', description: 'Representing the seller/listing agent' },
  { value: 'dual', label: 'Dual Agency', icon: '🤝', description: 'Representing both buyer and seller' },
  { value: 'referral', label: 'Referral', icon: '📨', description: 'Referral deal with another agent' },
]

const STEPS = ['Deal Type', 'Property Info', 'Parties', 'Review']

export default function NewDealPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [dealType, setDealType] = useState<DealType>('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [dealAmount, setDealAmount] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [parties, setParties] = useState<Party[]>([
    { first_name: '', last_name: '', email: '', phone: '', role: 'agent', is_primary: true }
  ])

  const canNext = () => {
    switch (step) {
      case 0: return dealType !== ''
      case 1: return propertyAddress.trim() !== ''
      case 2: return parties.some(p => p.first_name.trim() !== '')
      default: return true
    }
  }

  const addParty = (role: string) => {
    setParties([...parties, { first_name: '', last_name: '', email: '', phone: '', role, is_primary: false }])
  }

  const updateParty = (index: number, field: keyof Party, value: string | boolean) => {
    const updated = [...parties]
    updated[index] = { ...updated[index], [field]: value }
    setParties(updated)
  }

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index))
  }

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_type: dealType,
          property_address: propertyAddress,
          city,
          state,
          zip,
          deal_amount: dealAmount.replace(/[^0-9]/g, ''),
          close_date: closeDate,
          parties: parties.filter(p => p.first_name.trim() !== '')
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create deal')
        return
      }

      router.push(`/deals/${data.deal.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPartyRoles = () => {
    switch (dealType) {
      case 'buy': return ['agent', 'buyer', 'listing_agent', 'lender', 'title_company']
      case 'sell': return ['agent', 'seller', 'buyers_agent', 'title_company']
      case 'dual': return ['agent', 'buyer', 'seller', 'lender', 'title_company']
      case 'referral': return ['referring_agent', 'receiving_agent']
      default: return ['agent']
    }
  }

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/deals')}
          className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Deals
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
        <p className="text-gray-500 mt-1">Fill in the details to open a new transaction</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < step
                    ? 'bg-purple-600 text-white'
                    : i === step
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? 'text-purple-700 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Step 0: Deal Type */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What type of deal is this?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDealType(type.value as DealType)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    dealType === type.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Property Info */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chicago"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="IL"
                    maxLength={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="60601"
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="text"
                      value={dealAmount}
                      onChange={(e) => setDealAmount(formatCurrency(e.target.value))}
                      placeholder="350,000"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Parties */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Parties</h2>
            <p className="text-sm text-gray-500 mb-4">Add the people involved in this transaction</p>
            
            <div className="space-y-4">
              {parties.map((party, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={party.role}
                      onChange={(e) => updateParty(index, 'role', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    >
                      {getPartyRoles().map(role => (
                        <option key={role} value={role}>{formatRole(role)}</option>
                      ))}
                    </select>
                    {index > 0 && (
                      <button
                        onClick={() => removeParty(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={party.first_name}
                      onChange={(e) => updateParty(index, 'first_name', e.target.value)}
                      placeholder="First name"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={party.last_name}
                      onChange={(e) => updateParty(index, 'last_name', e.target.value)}
                      placeholder="Last name"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="email"
                      value={party.email}
                      onChange={(e) => updateParty(index, 'email', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="tel"
                      value={party.phone}
                      onChange={(e) => updateParty(index, 'phone', e.target.value)}
                      placeholder="Phone"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addParty(getPartyRoles()[1] || 'buyer')}
              className="mt-4 px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              + Add Another Party
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Deal Details</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Deal Type</div>
                <div className="font-medium text-gray-900">
                  {DEAL_TYPES.find(t => t.value === dealType)?.icon}{' '}
                  {DEAL_TYPES.find(t => t.value === dealType)?.label}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Property</div>
                <div className="font-medium text-gray-900">{propertyAddress}</div>
                <div className="text-sm text-gray-600">
                  {[city, state, zip].filter(Boolean).join(', ')}
                </div>
              </div>

              {(dealAmount || closeDate) && (
                <div className="grid grid-cols-2 gap-4">
                  {dealAmount && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Deal Amount</div>
                      <div className="font-medium text-gray-900">${dealAmount}</div>
                    </div>
                  )}
                  {closeDate && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Target Close</div>
                      <div className="font-medium text-gray-900">{new Date(closeDate + 'T12:00:00').toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              )}

              {parties.filter(p => p.first_name).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Parties</div>
                  <div className="space-y-2">
                    {parties.filter(p => p.first_name).map((party, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{party.first_name} {party.last_name}</div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {formatRole(party.role)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(step - 1)}
            className={`px-4 py-2 text-sm text-gray-600 hover:text-gray-900 ${
              step === 0 ? 'invisible' : ''
            }`}
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Deal'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
