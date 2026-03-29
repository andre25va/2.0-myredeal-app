'use client'

import { Settings, User, Building2, Bell, Shield, Palette } from 'lucide-react'

const sections = [
  {
    title: 'Profile',
    description: 'Your personal information and preferences',
    icon: User,
    fields: [
      { label: 'Name', value: 'Andre Vargas', type: 'text' },
      { label: 'Email', value: 'tc@myredeal.com', type: 'email' },
      { label: 'Phone', value: '(708) 506-9000', type: 'tel' },
      { label: 'Role', value: 'Admin', type: 'badge' },
    ]
  },
  {
    title: 'Organization',
    description: 'Company settings and team management',
    icon: Building2,
    fields: [
      { label: 'Company', value: 'MyReDeal', type: 'text' },
      { label: 'Plan', value: 'Pro', type: 'badge' },
    ]
  },
]

export default function SettingsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">Settings</h1>
        <p className="text-sm text-brand-text-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings nav */}
      <div className="flex gap-8">
        {/* Left nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {[
              { label: 'Profile', icon: User, active: true },
              { label: 'Organization', icon: Building2, active: false },
              { label: 'Notifications', icon: Bell, active: false },
              { label: 'Security', icon: Shield, active: false },
              { label: 'Appearance', icon: Palette, active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1 max-w-2xl space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-brand-text">{section.title}</h2>
                  <p className="text-sm text-brand-text-muted">{section.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                    <span className="text-sm text-brand-text-secondary">{field.label}</span>
                    {field.type === 'badge' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
                        {field.value}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-brand-text">{field.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
