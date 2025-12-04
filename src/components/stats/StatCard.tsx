import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { GlowCard } from '@/components/magic/GlowCard'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  glowColor?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  glowColor 
}: StatCardProps) {
  return (
    <GlowCard className={cn('p-6', className)} glowColor={glowColor}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </motion.div>
    </GlowCard>
  )
}

