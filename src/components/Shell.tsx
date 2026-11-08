import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Heart } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useGame } from '../game/GameContext'
import { FINAL_STEP, LEVEL_COUNT } from '../game/types'
import { FloatingHearts } from './FloatingHearts'
import { cx } from './ui'

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48, filter: 'blur(6px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48, filter: 'blur(6px)' }),
}

function ProgressBar({ step }: { step: number }) {
  const level = Math.min(step, LEVEL_COUNT)
  const done = step >= FINAL_STEP
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-blush/80">
        <span>{done ? 'Місію виконано' : `Рівень ${level} із ${LEVEL_COUNT}`}</span>
        <span className="inline-flex items-center gap-1 text-gold">
          <Heart size={10} fill="currentColor" /> {Math.round(((done ? LEVEL_COUNT : level - 1) / LEVEL_COUNT) * 100)}%
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: LEVEL_COUNT }, (_, i) => {
          const filled = done || i < level - 1
          const active = !done && i === level - 1
          return (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream/15">
              <motion.div
                className={cx('h-full rounded-full', active ? 'bg-blush' : 'bg-gradient-to-r from-blush to-gold')}
                initial={false}
                animate={{ width: filled ? '100%' : active ? '45%' : '0%' }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, direction, back } = useGame()
  const showHeader = state.step >= 1

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [state.step])

  return (
    <div className="app-bg relative min-h-dvh overflow-x-hidden">
      <FloatingHearts />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 safe-top safe-bottom">
        {showHeader && (
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 pt-2"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={back}
              aria-label="Повернутися на попередній рівень"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/15 bg-cream/10 text-cream backdrop-blur"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <ProgressBar step={state.step} />
          </motion.header>
        )}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.main
            key={state.step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
