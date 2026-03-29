import { CheckSquare, Plus, Filter, Search, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

const statusFilters = [
  { label: 'All Tasks', active: true },
  { label: 'To Do', icon: Clock, color: 'text-brand-warning', active: false },
  { label: 'In Progress', icon: AlertCircle, color: 'text-side-buy', active: false },
  { label: 'Completed', icon: CheckCircle2, color: 'text-brand-success', active: false },
]

export default function TasksPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Tasks</h1>
          <p className="text-sm text-brand-text-muted mt-1">Track your work across all deals</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-brand-border">
        {statusFilters.map((filter) => (
          <button
            key={filter.label}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
        <CheckSquare className="h-12 w-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-text mb-2">No tasks yet</h3>
        <p className="text-sm text-brand-text-muted mb-4">Tasks from deals and workflows will appear here</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>
    </div>
  )
}
