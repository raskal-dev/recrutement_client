import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardHoverEffectProps {
  children: React.ReactNode
  className?: string
}

export function CardHoverEffect({ children, className }: CardHoverEffectProps) {
  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="relative bg-card rounded-lg border border-border">
        {children}
      </div>
    </motion.div>
  )
}

