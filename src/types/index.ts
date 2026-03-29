export type DealSide = 'buy' | 'sell' | 'dual' | 'referral'

export type UserRole = 'platform_admin' | 'org_admin' | 'tc' | 'agent' | 'client'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  org_id: string | null
  avatar_url: string | null
  created_at: string
}