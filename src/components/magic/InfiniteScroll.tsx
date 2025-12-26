import { ReactNode, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface InfiniteScrollProps {
  children: ReactNode[]
  direction?: 'left' | 'right'
  speed?: number
  pauseOnHover?: boolean
  className?: string
}

export function InfiniteScroll({
  children,
  direction = 'left',
  speed = 50,
  pauseOnHover = true,
  className = '',
}: InfiniteScrollProps) {
  const [isPaused, setIsPaused] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const duplicateContent = () => {
      const content = Array.from(scroller.children)
      content.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement
        duplicatedItem.setAttribute('aria-hidden', 'true')
        scroller.appendChild(duplicatedItem)
      })
    }

    duplicateContent()
  }, [children])

  return (
    <div
      className={className}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        ref={scrollerRef}
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? [0, -50] : [0, 50],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          ...(isPaused && { duration: 0 }),
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

