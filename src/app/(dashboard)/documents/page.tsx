import { FolderOpen, Plus, Filter, Search, Upload, FileText, File } from 'lucide-react'

const docTypes = [
  { label: 'All', active: true },
  { label: 'Contracts', active: false },
  { label: 'Disclosures', active: false },
  { label: 'Addendums', active: false },
  { label: 'E-Signed', active: false },
]

export default function DocumentsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Documents</h1>
          <p className="text-sm text-brand-text-muted mt-1">Manage deal documents and templates</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors">
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search documents..."
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-brand-border">
        {docTypes.map((type) => (
          <button
            key={type.label}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              type.active
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-text-muted hover:text-brand-text-secondary'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-12 text-center">
        <FolderOpen className="h-12 w-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-text mb-2">No documents yet</h3>
        <p className="text-sm text-brand-text-muted mb-4">Upload documents or create templates to get started</p>
        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors">
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors">
            <Plus className="h-4 w-4" />
            Create Template
          </button>
        </div>
      </div>
    </div>
  )
}
