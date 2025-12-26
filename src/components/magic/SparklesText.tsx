import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface SparklesTextProps {
  text: string
  className?: string
}

export function SparklesText({ text, className }: SparklesTextProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      <span>{text}</span>
    </motion.div>
  )
}

