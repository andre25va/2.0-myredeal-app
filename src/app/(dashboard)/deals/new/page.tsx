'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Upload,
  FileText,
  PenLine,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Loader2,
  Sparkles,
  Home,
  Key,
  Handshake,
  Send,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
} from 'lucide-react'

/* ───── constants ───── */

const STEPS = [
  { label: 'Deal Type', icon: FileText },
  { label: 'Property', icon: MapPin },
  { label: 'Parties', icon: Users },
  { label: 'Review', icon: CheckCircle2 },
]

const DEAL_TYPES = [
  { value: 'buy', label: 'Buy Side', icon: Home, desc: 'Representing the buyer', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'sell', label: 'Sell / Listing', icon: Key, desc: 'Representing the seller', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { value: 'dual', label: 'Dual Agency', icon: Handshake, desc: 'Representing both sides', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'referral', label: 'Referral', icon: Send, desc: 'Referral agreement', color: 'bg-amber-50 border-amber-200 text-amber-700' },
]

const PARTY_ROLES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'agent', label: 'Agent' },
  { value: 'listing_agent', label: 'Listing Agent' },
  { value: 'buyers_agent', label: "Buyer's Agent" },
  { value: 'lender', label: 'Lender' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'escrow_officer', label: 'Escrow Officer' },
]

/* ───── types ───── */

interface Party {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  is_primary: boolean
}

const emptyParty = (): Party => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'buyer',
  is_primary: false,
})

/* ───── component ───── */

export default function NewDealPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mode
  const [mode, setMode] = useState<'choose' | 'upload' | 'wizard'>('choose')
  const [uploading, setUploading] = useState(false)
  const [aiExtracted, setAiExtracted] = useState(false)
  const [aiNotes, setAiNotes] = useState('')
  const [aiConfidence, setAiConfidence] = useState('')

  // Wizard
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [dealType, setDealType] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [dealAmount, setDealAmount] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [parties, setParties] = useState<Party[]>([emptyParty()])

  // Drag / error
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState('')

  /* ── helpers ── */

  const formatCurrency = (val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
  }

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError('')

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/deals/extract', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        setUploadError(json.error || 'Extraction failed. Please try again.')
        setUploading(false)
        return
      }

      const data = json.data

      if (data.deal_type) setDealType(data.deal_type)
      if (data.property_address) setPropertyAddress(data.property_address)
      if (data.city) setCity(data.city)
      if (data.state) setState(data.state)
      if (data.zip) setZip(data.zip)
      if (data.deal_amount) setDealAmount(data.deal_amount)
      if (data.close_date) setCloseDate(data.close_date)
      if (data.parties && data.parties.length > 0) {
        setParties(
          data.parties.map((p: Partial<Party>) => ({
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            email: p.email || '',
            phone: p.phone || '',
            role: p.role || 'buyer',
            is_primary: p.is_primary || false,
          }))
        )
      }

      setAiConfidence(data.confidence || '')
      setAiNotes(data.notes || '')
      setAiExtracted(true)
      setCurrentStep(0)
      setMode('wizard')
    } catch {
      setUploadError('Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const files = e.dataTransfer.files
      if (files && files.length > 0) handleFileUpload(files[0])
    },
    [handleFileUpload]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) handleFileUpload(files[0])
    },
    [handleFileUpload]
  )

  const addParty = () => setParties([...parties, emptyParty()])

  const removeParty = (index: number) => {
    if (parties.length > 1) setParties(parties.filter((_, i) => i !== index))
  }

  const updateParty = (index: number, field: keyof Party, value: string | boolean) => {
    const updated = [...parties]
    updated[index] = { ...updated[index], [field]: value }
    setParties(updated)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          user_id: user.id,
          deal_type: dealType,
          property_address: propertyAddress,
          city,
          state,
          zip,
          deal_amount: dealAmount ? parseFloat(dealAmount) : null,
          close_date: closeDate || null,
          status: 'pending',
          ai_extracted: aiExtracted,
        })
        .select()
        .single()

      if (dealError) throw dealError

      if (deal && parties.length > 0) {
        const partyRows = parties
          .filter((p) => p.first_name || p.last_name || p.email)
          .map((p) => ({
            deal_id: deal.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email || null,
            phone: p.phone || null,
            role: p.role,
            is_primary: p.is_primary,
          }))

        if (partyRows.length > 0) {
          const { error: partiesError } = await supabase
            .from('deal_parties')
            .insert(partyRows)

          if (partiesError) throw partiesError
        }
      }

      router.push(`/deals/${deal.id}`)
    } catch (err) {
      console.error('Failed to create deal:', err)
      alert('Failed to create deal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!dealType
      case 1: return !!propertyAddress && !!city && !!state && !!zip
      case 2: return parties.some((p) => p.first_name || p.last_name)
      case 3: return true
      default: return false
    }
  }

  /* ── reusable input class ── */
  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  // ╔══════════════════════════════════════════════╗
  // ║              CHOOSE MODE                     ║
  // ╚══════════════════════════════════════════════╝
  if (mode === 'choose') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 mb-4">
              <Plus className="w-7 h-7 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
            <p className="mt-2 text-gray-500 text-sm">Choose how you&apos;d like to get started</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Smart Import */}
            <button
              onClick={() => setMode('upload')}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 text-left"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-700">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              </div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 shadow-lg shadow-purple-200">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                Smart Import
              </h2>
              <p className="mt-1.5 text-gray-500 text-sm leading-relaxed">
                Upload a contract PDF and let AI extract all deal details automatically
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 group-hover:gap-2.5 transition-all">
                Upload PDF <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Manual Entry */}
            <button
              onClick={() => setMode('wizard')}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 text-left"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <PenLine className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                Manual Entry
              </h2>
              <p className="mt-1.5 text-gray-500 text-sm leading-relaxed">
                Enter deal details step by step using the guided wizard
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 group-hover:gap-2.5 transition-all">
                Start wizard <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ╔══════════════════════════════════════════════╗
  // ║              UPLOAD MODE                     ║
  // ╚══════════════════════════════════════════════╝
  if (mode === 'upload') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <button
            onClick={() => { setMode('choose'); setUploadError('') }}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 mb-4">
              <Sparkles className="w-7 h-7 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Import</h1>
            <p className="mt-2 text-gray-500 text-sm">
              Upload a real estate contract and AI will extract the deal details
            </p>
          </div>

          {uploading ? (
            <div className="bg-white rounded-2xl border border-purple-200 p-10 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-5">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">AI is reading your contract...</h2>
              <p className="mt-2 text-sm text-gray-500">
                Extracting property details, parties, and key dates
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                {['Parsing PDF', 'Analyzing text', 'Extracting data'].map((step, i) => (
                  <span key={step} className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> {step}
                    {i < 2 && <span className="text-purple-300 ml-1">→</span>}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Drag & drop your contract PDF
              </h3>
              <p className="mt-1 text-sm text-gray-500">or click to browse files</p>
              <p className="mt-4 text-xs text-gray-400">PDF only · Max 10MB</p>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ╔══════════════════════════════════════════════╗
  // ║              WIZARD MODE                     ║
  // ╚══════════════════════════════════════════════╝
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
        <p className="mt-1 text-sm text-gray-500">
          {aiExtracted ? 'Review the AI-extracted details below' : 'Fill in your deal details step by step'}
        </p>
      </div>

      {/* AI Confidence Banner */}
      {aiExtracted && (
        <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
          aiConfidence === 'high'
            ? 'bg-emerald-50 border-emerald-200'
            : aiConfidence === 'medium'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          {aiConfidence === 'high' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${
              aiConfidence === 'high' ? 'text-emerald-800' : aiConfidence === 'medium' ? 'text-amber-800' : 'text-orange-800'
            }`}>
              {aiConfidence === 'high' && 'AI extracted deal details with high confidence'}
              {aiConfidence === 'medium' && 'AI extracted details — please review carefully'}
              {aiConfidence === 'low' && 'AI found limited data — please verify all fields'}
              {!aiConfidence && 'AI extracted details — please review'}
            </p>
            {aiNotes && <p className="mt-1 text-xs opacity-70">{aiNotes}</p>}
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isComplete = index < currentStep
            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-initial">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-gray-900' : isComplete ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                    {aiExtracted && index <= 2 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 sm:p-8">

          {/* ── Step 0: Deal Type ── */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Deal Type</h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">What type of transaction is this?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEAL_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = dealType === type.value
                  return (
                    <button
                      key={type.value}
                      onClick={() => setDealType(type.value)}
                      className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 ring-1 ring-purple-500/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                          {type.label}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{type.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 1: Property Info ── */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">Enter the property details for this deal</p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="123 Main Street, Unit 4B"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Los Angeles"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="CA"
                      maxLength={2}
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>ZIP Code *</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="90210"
                      maxLength={10}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          Deal Amount
                        </span>
                      </label>
                      <input
                        type="text"
                        value={dealAmount}
                        onChange={(e) => setDealAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="500000"
                        className={inputClass}
                      />
                      {dealAmount && (
                        <p className="mt-1 text-xs text-gray-400">{formatCurrency(dealAmount)}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Expected Close Date
                        </span>
                      </label>
                      <input
                        type="date"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Parties ── */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Deal Parties</h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Add the people and companies involved in this transaction
              </p>
              <div className="space-y-4">
                {parties.map((party, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 rounded-xl p-5 bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {party.first_name && party.last_name
                            ? `${party.first_name} ${party.last_name}`
                            : `Party ${index + 1}`}
                        </span>
                      </div>
                      {parties.length > 1 && (
                        <button
                          onClick={() => removeParty(index)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input
                          type="text"
                          value={party.first_name}
                          onChange={(e) => updateParty(index, 'first_name', e.target.value)}
                          placeholder="First name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                          type="text"
                          value={party.last_name}
                          onChange={(e) => updateParty(index, 'last_name', e.target.value)}
                          placeholder="Last name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input
                          type="email"
                          value={party.email}
                          onChange={(e) => updateParty(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input
                          type="tel"
                          value={party.phone}
                          onChange={(e) => updateParty(index, 'phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Role</label>
                        <select
                          value={party.role}
                          onChange={(e) => updateParty(index, 'role', e.target.value)}
                          className={inputClass + ' bg-white'}
                        >
                          {PARTY_ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={party.is_primary}
                            onChange={(e) => updateParty(index, 'is_primary', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            Primary contact
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addParty}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Party
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review &amp; Create</h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">Confirm the details before creating your deal</p>

              <div className="space-y-6">
                {/* Deal Type */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  {(() => {
                    const t = DEAL_TYPES.find((t) => t.value === dealType)
                    const Icon = t?.icon || FileText
                    return (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Type</div>
                          <div className="font-semibold text-gray-900">{t?.label || '—'}</div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Property + Financials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Property</span>
                    </div>
                    <div className="font-medium text-gray-900">{propertyAddress || '—'}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {[city, state, zip].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {dealAmount ? formatCurrency(dealAmount) : '—'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Close</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {closeDate
                          ? new Date(closeDate + 'T12:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parties ({parties.filter((p) => p.first_name || p.last_name).length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {parties
                      .filter((p) => p.first_name || p.last_name)
                      .map((party, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-600">
                                {(party.first_name?.[0] || '') + (party.last_name?.[0] || '')}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {party.first_name} {party.last_name}
                              </span>
                              {party.is_primary && (
                                <span className="ml-2 text-[10px] font-semibold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {PARTY_ROLES.find((r) => r.value === party.role)?.label || party.role}
                          </span>
                        </div>
                      ))}
                    {parties.filter((p) => p.first_name || p.last_name).length === 0 && (
                      <p className="text-gray-400 text-sm py-2">No parties added</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 sm:px-8 py-4">
          <button
            onClick={() => {
              if (currentStep === 0) {
                setMode('choose')
                setAiExtracted(false)
                setAiNotes('')
                setAiConfidence('')
              } else {
                setCurrentStep(currentStep - 1)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Back' : 'Previous'}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Create Deal
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
