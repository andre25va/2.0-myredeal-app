import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
        <Lock className="h-6 w-6 text-brand-primary" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Invite Only</h2>
      <p className="text-gray-400 text-sm mb-4">
        MyReDeal is currently invite-only. Contact your organization admin to get access.
      </p>
      <Link
        href="/login"
        className="text-sm text-brand-primary hover:underline"
      >
        Already have an account? Sign in
      </Link>
    </div>
  )
}