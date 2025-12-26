import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
}

export function Particles({
  className = '',
  quantity = 30,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = '#ffffff',
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let particles: Array<{
        x: number
        y: number
        translateX: number
        translateY: number
        size: number
        alpha: number
        targetAlpha: number
        dx: number
        dy: number
        magnetism: number
      }> = []

      const resizeCanvas = () => {
        if (canvasContainerRef.current && canvas) {
          canvas.width = canvasContainerRef.current.offsetWidth
          canvas.height = canvasContainerRef.current.offsetHeight
        }
      }

      const initParticles = () => {
        particles = []
        for (let i = 0; i < quantity; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            translateX: 0,
            translateY: 0,
            size: Math.random() * size + 0.1,
            alpha: 0,
            targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
            dx: (Math.random() - 0.5) * 0.1,
            dy: (Math.random() - 0.5) * 0.1,
            magnetism: 0.1 + Math.random() * 0.4,
          })
        }
      }

      const drawParticle = (particle: typeof particles[0]) => {
        if (!ctx) return
        ctx.translate(particle.translateX, particle.translateY)
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.globalAlpha = particle.alpha
        ctx.fill()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }

      const updateParticles = () => {
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((particle, i) => {
          particle.x += particle.dx
          particle.y += particle.dy

          if (particle.x < 0 || particle.x > canvas.width) particle.dx = -particle.dx
          if (particle.y < 0 || particle.y > canvas.height) particle.dy = -particle.dy

          particle.alpha += (particle.targetAlpha - particle.alpha) / ease
          particle.translateX += (particle.x - particle.translateX) * particle.magnetism
          particle.translateY += (particle.y - particle.translateY) * particle.magnetism

          drawParticle(particle)
        })

        animationFrameRef.current = requestAnimationFrame(updateParticles)
      }

      resizeCanvas()
      initParticles()
      updateParticles()

      window.addEventListener('resize', resizeCanvas)

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [quantity, staticity, ease, size, refresh, color])

  return (
    <div ref={canvasContainerRef} className={className}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

