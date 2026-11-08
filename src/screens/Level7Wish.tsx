import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { heartRain } from '../components/confetti'
import { Button, SectionTitle } from '../components/ui'
import { useGame } from '../game/GameContext'
import { LEVEL_TITLES, WISH_CTA, WISH_INTRO, WISH_PLACEHOLDER, WISH_QUESTION } from '../game/content'

const MAX = 600

function CompletionOverlay() {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux-deep/95 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.7, times: [0, 0.6, 1] }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blush to-gold shadow-glow"
        >
          <Heart size={44} className="text-bordeaux-deep" fill="currentColor" strokeWidth={0} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-gold"
        >
          Бажання зафіксовано
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 16 }}
          className="font-display mt-3 inline-block rounded-lg border-[3px] border-cream px-4 py-2 text-3xl font-bold uppercase tracking-wider text-cream"
        >
          Місію виконано
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-5 text-sm text-blush/80">
          Формуємо наше побачення…
        </motion.p>
      </div>
    </motion.div>
  )
}

export function Level7Wish() {
  const { state, setWish, completeMission } = useGame()
  const [text, setText] = useState(state.wish ?? '')
  const [celebrating, setCelebrating] = useState(false)
  const ready = text.trim().length > 0

  useEffect(() => {
    if (!celebrating) return
    heartRain()
    const t = window.setTimeout(completeMission, 2600)
    return () => window.clearTimeout(t)
  }, [celebrating, completeMission])

  const onChange = (v: string) => {
    const clipped = v.slice(0, MAX)
    setText(clipped)
    setWish(clipped)
  }

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[7].code} title={LEVEL_TITLES[7].title} intro={WISH_INTRO} />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl bg-cream p-5 text-bordeaux shadow-card">
        <p className="font-display text-[22px] leading-tight font-semibold text-balance">{WISH_QUESTION}</p>
        <div className="gold-rule my-4 h-px w-full" />
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={WISH_PLACEHOLDER}
          rows={6}
          className="w-full resize-none rounded-2xl border border-blush/60 bg-blush/15 px-4 py-3 text-[16px] leading-relaxed text-bordeaux placeholder:text-bordeaux/40 focus:border-cherry focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-bordeaux/50">
          <span>Прочитаю тільки я. Чесно.</span>
          <span className="tabular">
            {text.length}/{MAX}
          </span>
        </div>
      </motion.div>

      <div className="mt-auto pt-6">
        <Button disabled={!ready} onClick={() => setCelebrating(true)}>
          <Send size={18} /> {WISH_CTA}
        </Button>
      </div>

      <AnimatePresence>{celebrating && <CompletionOverlay />}</AnimatePresence>
    </div>
  )
}
