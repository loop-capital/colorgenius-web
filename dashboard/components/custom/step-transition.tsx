'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StepTransitionProps {
  children: ReactNode
  direction: 'forward' | 'back'
  stepKey: string | number
  className?: string
}

const variants = {
  enter: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? -80 : 80,
    opacity: 0,
  }),
}

export function StepTransition({ children, direction, stepKey, className }: StepTransitionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}