import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('font-bold tracking-tight', sizes[size], className)}>
      <span className="text-white">My</span>
      <span className="text-brand-primary">Re</span>
      <span className="text-white">Deal</span>
    </div>
  )
}