import { Variants } from 'framer-motion'

// Easing functions following Fluent 2 design principles
export const easing = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
} as const

// Duration constants (in milliseconds)
export const duration = {
  fast: 150,
  base: 200,
  slow: 300,
} as const

// Common animation variants
export const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
}

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
}

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
}

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
}

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
}

// Drawer/sidebar animations
export const drawerVariants: Variants = {
  closed: {
    x: '100%',
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeIn,
    },
  },
  open: {
    x: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
}

export const sidebarVariants: Variants = {
  closed: {
    x: '-100%',
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeIn,
    },
  },
  open: {
    x: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
}

// Modal/dialog animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.base / 1000,
      ease: easing.easeOut,
    },
  },
}

export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeOut,
    },
  },
}

// List animations
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.easeIn,
    },
  },
}

// Hover animations (for use with whileHover)
export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: duration.fast / 1000,
    ease: easing.easeOut,
  },
}

export const hoverElevate = {
  y: -2,
  transition: {
    duration: duration.fast / 1000,
    ease: easing.easeOut,
  },
}

// Tap animations (for use with whileTap)
export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: easing.easeInOut,
  },
}

// Utility function to disable animations based on user preference
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = {
        transition: { duration: 0.01 },
      }
      return acc
    }, {} as Variants)
  }
  return variants
}