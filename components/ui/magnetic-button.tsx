'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

/**
 * MagneticButton - A button that follows the cursor with smooth spring physics
 *
 * Inspired by: Vercel, Linear, and other modern SaaS sites
 *
 * Usage:
 * ```tsx
 * <MagneticButton strength={0.3} onClick={handleClick}>
 *   Click Me
 * </MagneticButton>
 * ```
 *
 * @param children - Button content
 * @param className - Additional CSS classes
 * @param strength - Magnetic strength (0-1, default 0.2)
 * @param onClick - Click handler
 */
export function MagneticButton({
  children,
  className = '',
  strength = 0.2,
  onClick
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const scale = useTransform(springX, [-50, 0, 50], [1.05, 1, 1.05])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, scale }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-lg pointer-events-none"
      />
      {children}
    </motion.button>
  )
}
