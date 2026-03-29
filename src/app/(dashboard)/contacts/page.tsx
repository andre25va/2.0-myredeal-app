import { Users, Plus, Filter, Search, UserPlus } from 'lucide-react'

const roleFilters = [
  { label: 'All', active: true },
  { label: 'Agents', active: false },
  { label: 'Buyers', active: false },
  { label: 'Sellers', active: false },
  { label: 'Lenders', active: false },
  { label: 'Title', active: false },
]

export default function ContactsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Contacts</h1>
          <p className="text-sm text-brand-text-muted mt-1">Manage agents, clients, and partners</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-brand-border">
        {roleFilters.map((filter) => (
          <button
            key={filter.label}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter.active
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-text-muted hover:text-brand-text-secondary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-12 text-center">
        <Users className="h-12 w-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-text mb-2">No contacts yet</h3>
        <p className="text-sm text-brand-text-muted mb-4">Add your first contact to build your network</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </button>
      </div>
    </div>
  )
}
