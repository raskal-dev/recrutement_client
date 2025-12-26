import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ children, className, glowColor = 'hsl(var(--primary))' }: GlowCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border bg-card p-6',
        'before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-500',
        'hover:before:opacity-100',
        className
      )}
      style={{
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      <div
        className="absolute -inset-0.5 rounded-xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}40, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

