import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Download, Heart } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { burst } from '../components/confetti'
import { CouponCard, couponSerial } from '../components/CouponCard'
import { exportNodeAsImage } from '../components/exportImage'
import { Toast } from '../components/Toast'
import { Button, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { COUPONS, ENVELOPE_INTRO, LEVEL_TITLES } from '../game/content'
import { shuffle } from '../game/logic'

function Envelope({ open, index, onClick, disabled, hidden }: { open: boolean; index: number; onClick: () => void; disabled: boolean; hidden: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 30, rotate: -6 + index * 6 }}
      animate={
        hidden
          ? { opacity: 0, scale: 0.6, y: 20 }
          : open
            ? { opacity: 1, scale: 1.25, y: -10, rotate: 0 }
            : { opacity: 1, y: [0, -6, 0], rotate: -4 + index * 4 }
      }
      transition={
        open || hidden
          ? { type: 'spring', stiffness: 200, damping: 20 }
          : { y: { repeat: Infinity, duration: 2.2 + index * 0.3, ease: 'easeInOut' }, opacity: { delay: 0.2 + index * 0.1 } }
      }
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className="relative h-[92px] w-[132px] shrink-0 no-select"
      style={{ perspective: 600 }}
      aria-label={`Конверт ${index + 1}`}
    >
      {/* задня частина */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-cherry-light to-cherry shadow-card" />
      {/* лист */}
      <motion.div
        animate={open ? { y: -58, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ delay: open ? 0.45 : 0, type: 'spring', stiffness: 180, damping: 18 }}
        className="absolute inset-x-2 bottom-1.5 top-2 z-10 flex items-center justify-center rounded-sm bg-cream shadow"
      >
        <Heart size={18} className="text-cherry" fill="currentColor" strokeWidth={0} />
      </motion.div>
      {/* передній карман */}
      <div
        className="absolute inset-0 z-20 rounded-lg bg-gradient-to-t from-cherry via-cherry-light to-cherry-light"
        style={{ clipPath: 'polygon(0 100%, 0 30%, 50% 68%, 100% 30%, 100% 100%)' }}
      />
      <div className="absolute inset-0 z-20 rounded-lg border border-gold/30" style={{ clipPath: 'polygon(0 100%, 0 30%, 50% 68%, 100% 30%, 100% 100%)' }} />
      {/* клапан */}
      <motion.div
        animate={{ rotateX: open ? -175 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'top center', clipPath: 'polygon(0 0, 100% 0, 50% 62%)', zIndex: open ? 5 : 30 }}
        className="absolute inset-x-0 top-0 h-full rounded-t-lg bg-gradient-to-b from-bordeaux to-cherry"
      />
      {/* сургучна печатка */}
      <motion.div
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.4 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute left-1/2 top-[48%] z-40 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cream/60 bg-gold shadow"
      >
        <Heart size={14} className="text-bordeaux-deep" fill="currentColor" strokeWidth={0} />
      </motion.div>
    </motion.button>
  )
}

export function Level5Envelope() {
  const { state, setCoupon, next } = useGame()
  const [order] = useState(() => shuffle(COUPONS))
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(state.coupon !== undefined)
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const coupon = COUPONS.find((c) => c.id === state.coupon)

  const choose = (i: number) => {
    if (picked !== null || revealed) return
    setPicked(i)
    setCoupon(order[i].id)
    window.setTimeout(() => {
      setRevealed(true)
      burst({ x: 0.5, y: 0.45 })
    }, 1350)
  }

  const save = useCallback(async () => {
    if (!couponRef.current || !coupon) return
    setSaving(true)
    const outcome = await exportNodeAsImage(couponRef.current, 'kupon-romanivna.png', coupon.title)
    setSaving(false)
    setToast(
      outcome === 'shared'
        ? 'Купон збережено 💌'
        : outcome === 'downloaded'
          ? 'Купон завантажено як зображення'
          : outcome === 'cancelled'
            ? 'Добре, купон залишається тут'
            : 'Не вдалося зберегти. Зроби скриншот — так теж дійсний',
    )
  }, [coupon])

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[5].code} title={LEVEL_TITLES[5].title} intro={revealed ? undefined : ENVELOPE_INTRO} />

      <AnimatePresence mode="wait">
        {!revealed || !coupon ? (
          <motion.div key="envelopes" exit={{ opacity: 0, scale: 0.9 }} className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
              <div className="flex flex-wrap items-center justify-center gap-5">
                {order.map((_, i) => (
                  <Envelope
                    key={i}
                    index={i}
                    open={picked === i}
                    hidden={picked !== null && picked !== i}
                    disabled={picked !== null}
                    onClick={() => choose(i)}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                {picked === null ? (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-sm text-blush/70">
                    Нагороди перемішано. Торкнись конверта.
                  </motion.p>
                ) : (
                  <motion.p key="opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-center text-lg text-gold">
                    Відкриваємо…
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="coupon"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            className="flex flex-1 flex-col"
          >
            <p className="mb-3 text-center text-sm text-blush/80">Твоя нагорода. Зберігай — підлягає обов’язковому використанню.</p>
            <CouponCard ref={couponRef} coupon={coupon} serial={couponSerial(coupon, state.startedAt)} />
            <div className={cx('mt-auto flex flex-col gap-2 pt-6')}>
              <Button onClick={next}>
                Далі <ArrowRight size={18} />
              </Button>
              <Button variant="ghost" onClick={save} disabled={saving}>
                <Download size={16} /> {saving ? 'Готуємо зображення…' : 'Зберегти купон як зображення'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
