import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Download, Heart, RotateCcw, Send, Share2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ConfirmModal } from '../components/ConfirmModal'
import { couponSerial } from '../components/CouponCard'
import { heartRain } from '../components/confetti'
import { exportNodeAsImage, shareText } from '../components/exportImage'
import { Toast } from '../components/Toast'
import { Button, Chip } from '../components/ui'
import { useGame } from '../game/GameContext'
import { COUPONS, FINAL, PLAYER_NAME } from '../game/content'
import { pluralize } from '../game/logic'
import { generatePlan } from '../game/plan'
import { buildResultLink } from '../game/storage'
import { submitResult } from '../game/submit'

export function Final() {
  const { state, reset, markSent } = useGame()
  const plan = generatePlan(state)
  const coupon = COUPONS.find((c) => c.id === state.coupon)
  const cardRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'share' | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const kisses = state.kisses ?? 0

  // Святкуємо лише один раз на кожне завершення.
  useEffect(() => {
    const key = `or-celebrated:${state.completedAt ?? 'none'}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(heartRain, 400)
    return () => window.clearTimeout(t)
  }, [state.completedAt])

  // Якщо налаштовано серверний API — надсилаємо результат автоматично, один раз.
  useEffect(() => {
    if (state.sentAt || !state.completedAt) return
    void submitResult(state).then((ok) => {
      if (ok) markSent()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.completedAt, state.sentAt])

  const resultLink = buildResultLink(`${window.location.origin}${import.meta.env.BASE_URL}`, state)

  const save = async () => {
    if (!cardRef.current) return
    setBusy('save')
    const outcome = await exportNodeAsImage(cardRef.current, 'nashe-pobachennya.png', 'Наше ідеальне побачення')
    setBusy(null)
    setToast(
      outcome === 'shared'
        ? 'Картку збережено 💌'
        : outcome === 'downloaded'
          ? 'Картку завантажено як зображення'
          : outcome === 'cancelled'
            ? 'Добре, картка залишається тут'
            : 'Не вдалося зберегти. Скриншот теж рахується',
    )
  }

  const shareMessage = `${PLAYER_NAME} виконала «Операцію: Романівна» 💌 ${kisses} ${pluralize(kisses, ['поцілунок', 'поцілунки', 'поцілунків'])} зібрано, план побачення сформовано. Деталі — за посиланням.`

  const share = async () => {
    setBusy('share')
    const text = shareMessage
    const outcome = await shareText(text, resultLink)
    setBusy(null)
    if (outcome === 'failed') {
      setShowLink(true)
      return
    }
    setToast(
      outcome === 'shared'
        ? 'Надіслано. Місія офіційно зарахована 💋'
        : outcome === 'copied'
          ? 'Посилання скопійовано — встав його в чат зі мною'
          : 'Добре, можна поділитися пізніше',
    )
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultLink)
      setToast('Посилання скопійовано')
    } catch {
      setToast('Виділи посилання і скопіюй вручну')
    }
  }

  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(resultLink)}&text=${encodeURIComponent(shareMessage)}`

  return (
    <div className="flex flex-1 flex-col pb-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex justify-center">
        <Chip>місія завершена</Chip>
      </motion.div>

      {/* Картка, яка експортується в PNG */}
      <div ref={cardRef} className="rounded-[32px] bg-gradient-to-b from-bordeaux to-bordeaux-deep p-1">
        <div className="rounded-[30px] border border-gold/40 px-5 pb-6 pt-7">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="font-display text-center text-[34px] leading-none font-bold tracking-wide text-cream"
          >
            {FINAL.title}
          </motion.h1>
          <div className="gold-rule mx-auto mt-4 h-px w-32" />
          <p className="mt-3 text-center text-[13px] leading-relaxed text-blush/85">{FINAL.subtitle}</p>

          <div className="mt-6 space-y-3">
            {plan.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.09 }}
                className="rounded-2xl bg-cream px-4 py-3.5 text-bordeaux"
              >
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cherry">
                  <span className="text-base leading-none">{s.emoji}</span> {s.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed">{s.text}</p>
                {s.id === 'kisses' && (
                  <div className="mt-2 flex flex-wrap gap-0.5">
                    {Array.from({ length: Math.min(kisses, 40) }, (_, k) => (
                      <Heart key={k} size={11} fill="#7B294B" strokeWidth={0} />
                    ))}
                  </div>
                )}
                {s.id === 'coupon' && coupon && (
                  <p className="mt-2 font-mono text-[10px] tracking-widest text-bordeaux/50">№ {couponSerial(coupon, state.startedAt)}</p>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 rounded-2xl border border-gold/40 bg-bordeaux-deep/50 px-4 py-4 text-[14px] leading-relaxed text-cream"
          >
            {FINAL.message.map((m, i) => (
              <p key={i} className={i === 0 ? 'font-display text-lg font-semibold' : 'mt-2'}>
                {m}
              </p>
            ))}
            <p className="mt-3 text-[13px] italic text-gold">{FINAL.ps}</p>
          </motion.div>

          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.25em] text-blush/50">Операція: Романівна · {new Date(state.completedAt ?? Date.now()).toLocaleDateString('uk-UA')}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mt-6 flex flex-col gap-2">
        <Button variant="gold" onClick={share} disabled={busy !== null}>
          <Share2 size={18} /> {busy === 'share' ? 'Відкриваємо…' : 'Поділитися результатом'}
        </Button>
        <p className="-mt-0.5 mb-1 text-center text-xs text-blush/70">Надішли це мені — і місія буде офіційно зарахована.</p>
        <Button onClick={save} disabled={busy !== null}>
          <Download size={18} /> {busy === 'save' ? 'Готуємо зображення…' : 'Зберегти наше побачення'}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} /> Пройти ще раз
        </Button>
      </motion.div>

      <ConfirmModal
        open={confirmReset}
        title="Почати нову місію?"
        text="Поточні відповіді буде стерто з цього пристрою. Якщо ти ще не поділилася результатом — краще спочатку зроби це."
        confirmLabel="Так, почати знову"
        onConfirm={() => {
          setConfirmReset(false)
          reset()
        }}
        onCancel={() => setConfirmReset(false)}
      />
      <AnimatePresence>
        {showLink && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-bordeaux-deep/70 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLink(false)}
          >
            <motion.div
              role="dialog"
              aria-modal
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-3xl bg-cream p-5 text-bordeaux shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-semibold">Посилання з результатом</h3>
                <button onClick={() => setShowLink(false)} aria-label="Закрити" className="rounded-full p-1 text-bordeaux/60">
                  <X size={20} />
                </button>
              </div>
              <p className="mt-1 text-sm text-bordeaux/70">Надішли його мені будь-яким зручним способом.</p>
              <textarea
                readOnly
                value={resultLink}
                rows={3}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-3 w-full resize-none rounded-2xl border border-blush/60 bg-blush/15 px-3 py-2 font-mono text-[11px] leading-snug break-all focus:outline-none"
              />
              <div className="mt-3 flex flex-col gap-2">
                <a href={telegramHref} target="_blank" rel="noreferrer" className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-cherry-light to-bordeaux px-5 text-base font-semibold text-cream">
                  <Send size={18} /> Надіслати в Telegram
                </a>
                <Button variant="secondary" onClick={copyLink} className="shadow-none border-bordeaux/15">
                  <Copy size={18} /> Скопіювати посилання
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
