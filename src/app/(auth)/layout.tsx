import { Logo } from '@/components/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-brand-border bg-brand-card p-8 shadow-xl">
          {children}
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        © 2024 MyReDeal. All rights reserved.
      </p>
    </div>
  )
}