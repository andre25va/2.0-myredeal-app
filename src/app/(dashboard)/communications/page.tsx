import { Mail, Plus, Filter, Search, Inbox, Send, Archive } from 'lucide-react'

const tabs = [
  { label: 'Inbox', icon: Inbox, count: 0, active: true },
  { label: 'Sent', icon: Send, count: 0, active: false },
  { label: 'Archived', icon: Archive, count: 0, active: false },
]

export default function CommunicationsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Communications</h1>
          <p className="text-sm text-brand-text-muted mt-1">Email threads, messages, and notifications</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          New Message
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search messages..."
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-brand-border">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab.active
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-text-muted hover:text-brand-text-secondary'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-brand-primary/10 text-brand-primary">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-12 text-center">
        <Mail className="h-12 w-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-text mb-2">No messages yet</h3>
        <p className="text-sm text-brand-text-muted mb-4">Communications linked to deals will appear here</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          Compose Message
        </button>
      </div>
    </div>
  )
}
