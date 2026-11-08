import { AnimatePresence, motion } from 'framer-motion'
import { FolderLock, Heart, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Card, Chip, RevealText } from '../components/ui'
import { useGame } from '../game/GameContext'
import { PLAYER_NAME, WELCOME } from '../game/content'

function DossierOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux-deep/95 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full max-w-xs" style={{ perspective: 1200 }}>
        {/* внутрішній аркуш */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="relative rounded-2xl bg-cream p-6 text-bordeaux shadow-card"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cherry">Досьє № 001</p>
          <h3 className="font-display mt-2 text-2xl font-semibold">{PLAYER_NAME}</h3>
          <div className="mt-3 space-y-1.5 text-[13px] text-bordeaux/70">
            <p>Статус: особа надзвичайної важливості</p>
            <p>Рівень симпатії організатора: критичний</p>
            <p>Улюблений десерт: пряники (підтверджено)</p>
          </div>
          <motion.div
            initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute bottom-4 right-4 rounded-md border-[3px] border-cherry px-3 py-1 font-display text-lg font-bold uppercase tracking-wider text-cherry"
          >
            Допущено
          </motion.div>
        </motion.div>
        {/* обкладинка папки */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -165 }}
          transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-cherry to-bordeaux shadow-card"
        >
          <FolderLock size={42} className="text-gold" />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Цілком таємно</p>
          <p className="font-display mt-1 text-xl text-cream">Операція: Романівна</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function Welcome() {
  const { next, state } = useGame()
  const [opening, setOpening] = useState(false)
  const resuming = state.maxStep > 0

  useEffect(() => {
    if (!opening) return
    const t = window.setTimeout(next, 2300)
    return () => window.clearTimeout(t)
  }, [opening, next])

  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
        <Chip>
          <Lock size={11} /> цілком таємно
        </Chip>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16, letterSpacing: '0.2em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="font-display mt-5 text-center text-[34px] leading-none font-bold text-cream"
      >
        ОПЕРАЦІЯ:
        <br />
        <span className="shimmer">РОМАНІВНА</span>
      </motion.h1>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="gold-rule mx-auto mt-4 h-px w-40" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-3 text-center text-[13px] font-medium uppercase tracking-[0.18em] text-blush/80"
      >
        {WELCOME.subtitle}
      </motion.p>

      <Card
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 160, damping: 22 }}
        className="relative mt-8 space-y-3 text-[15px] leading-relaxed"
      >
        <Heart size={18} fill="currentColor" className="absolute -top-2 right-5 text-cherry" />
        {WELCOME.lines.map((line, i) => (
          <p key={i} className={i === 0 ? 'font-display text-xl font-semibold' : undefined}>
            <RevealText text={line} delay={1.1 + i * 0.35} stagger={0.03} />
          </p>
        ))}
      </Card>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }} className="mt-8">
        <Button onClick={() => setOpening(true)}>
          <Heart size={18} fill="currentColor" />
          {resuming ? 'Повернутися до місії' : WELCOME.cta}
        </Button>
        <p className="mt-3 text-center text-xs text-blush/60">Під час місії можна повертатися назад — відповіді не зникнуть.</p>
      </motion.div>

      <AnimatePresence>{opening && <DossierOverlay />}</AnimatePresence>
    </div>
  )
}
