import { FileText, Users, CheckSquare, Mail, TrendingUp, Clock } from 'lucide-react'

const stats = [
  { name: 'Active Deals', value: '0', icon: FileText, color: 'text-brand-primary' },
  { name: 'Total Contacts', value: '0', icon: Users, color: 'text-side-buy' },
  { name: 'Open Tasks', value: '0', icon: CheckSquare, color: 'text-brand-warning' },
  { name: 'Unread Messages', value: '0', icon: Mail, color: 'text-brand-success' },
]

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome to MyReDeal 2.0</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-brand-border bg-brand-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Recent Activity
          </h2>
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No recent activity
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 rounded-lg border border-brand-border bg-brand-bg px-4 py-3 text-sm text-gray-300 hover:border-brand-primary hover:text-white transition-colors">
              <FileText className="h-4 w-4 text-brand-primary" />
              Create New Deal
            </button>
            <button className="w-full flex items-center gap-3 rounded-lg border border-brand-border bg-brand-bg px-4 py-3 text-sm text-gray-300 hover:border-brand-primary hover:text-white transition-colors">
              <Users className="h-4 w-4 text-side-buy" />
              Add Contact
            </button>
            <button className="w-full flex items-center gap-3 rounded-lg border border-brand-border bg-brand-bg px-4 py-3 text-sm text-gray-300 hover:border-brand-primary hover:text-white transition-colors">
              <CheckSquare className="h-4 w-4 text-brand-warning" />
              View All Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}