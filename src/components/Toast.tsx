import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(t)
  }, [message, onDone])
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-cream px-4 py-3 text-center text-sm font-medium text-bordeaux shadow-card"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
