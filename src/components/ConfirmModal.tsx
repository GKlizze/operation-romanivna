import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui'

interface Props {
  open: boolean
  title: string
  text: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, text, confirmLabel, cancelLabel = 'Залишити як є', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bordeaux-deep/70 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-md rounded-3xl bg-cream p-6 text-bordeaux shadow-card"
          >
            <h3 className="font-display text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-bordeaux/80">{text}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button variant="primary" onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button variant="secondary" onClick={onCancel} className="shadow-none border-bordeaux/15">
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
