import { FileText, Plus, Filter, Search } from 'lucide-react'

export default function DealsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Deals</h1>
          <p className="text-sm text-brand-text-muted mt-1">Manage all your transactions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          New Deal
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search deals..."
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        {/* Side filter pills */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-side-buy/10 text-side-buy border border-side-buy/20">Buy</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-side-sell/10 text-side-sell border border-side-sell/20">Sell</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-side-dual/10 text-side-dual border border-side-dual/20">Dual</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-400/10 text-brand-text-muted border border-gray-300/30">Referral</span>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-12 text-center">
        <FileText className="h-12 w-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-text mb-2">No deals yet</h3>
        <p className="text-sm text-brand-text-muted mb-4">Create your first deal to get started</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          Create Deal
        </button>
      </div>
    </div>
  )
}
