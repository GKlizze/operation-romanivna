import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, FileCheck2, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Card, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { EITHER_OR_DONE, EITHER_OR_ROUNDS, EITHER_OR_TIMEOUT, LEVEL_TITLES } from '../game/content'
import { EITHER_OR_SECONDS, type EitherOrChoice } from '../game/types'

function CountdownRing({ round, timedOut, frozen }: { round: number; timedOut: boolean; frozen: boolean }) {
  const [left, setLeft] = useState(EITHER_OR_SECONDS)
  useEffect(() => {
    setLeft(EITHER_OR_SECONDS)
    if (frozen) return
    const start = performance.now()
    const id = window.setInterval(() => {
      const l = Math.max(0, EITHER_OR_SECONDS - (performance.now() - start) / 1000)
      setLeft(l)
      if (l <= 0) window.clearInterval(id)
    }, 100)
    return () => window.clearInterval(id)
  }, [round, frozen])

  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="rgba(255,248,243,0.15)" strokeWidth="4" fill="none" />
        <motion.circle
          key={round}
          cx="32"
          cy="32"
          r="28"
          stroke={timedOut ? '#D6B783' : '#E9B8C7'}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 1 }}
          animate={{ pathLength: frozen ? 1 : 0 }}
          transition={{ duration: EITHER_OR_SECONDS, ease: 'linear' }}
        />
      </svg>
      <span className={cx('tabular font-display text-xl font-semibold', timedOut ? 'text-gold' : 'text-cream')}>
        {timedOut ? '∞' : Math.ceil(left)}
      </span>
    </div>
  )
}

export function Level4EitherOr() {
  const { state, setEitherOr, next } = useGame()
  const allAnswered = EITHER_OR_ROUNDS.every((_, i) => state.eitherOr[i] !== undefined)
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(allAnswered)
  const [picked, setPicked] = useState<EitherOrChoice | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (done) return
    setTimedOut(false)
    setPicked(null)
    const t = window.setTimeout(() => setTimedOut(true), EITHER_OR_SECONDS * 1000)
    return () => window.clearTimeout(t)
  }, [round, done])

  const choose = (choice: EitherOrChoice) => {
    if (picked) return
    setPicked(choice)
    setEitherOr(round, choice)
    window.setTimeout(() => {
      if (round < EITHER_OR_ROUNDS.length - 1) setRound(round + 1)
      else setDone(true)
    }, 520)
  }

  const restart = () => {
    setRound(0)
    setDone(false)
  }

  const current = EITHER_OR_ROUNDS[round]

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[4].code} title={LEVEL_TITLES[4].title} intro={done ? undefined : 'П’ять раундів. П’ять секунд на кожен. Думати не обов’язково — обирай серцем.'} />

      {!done ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                Раунд {round + 1} із {EITHER_OR_ROUNDS.length}
              </p>
              <div className="mt-1.5 flex gap-1">
                {EITHER_OR_ROUNDS.map((_, i) => (
                  <span key={i} className={cx('h-1.5 w-6 rounded-full', i < round ? 'bg-gold' : i === round ? 'bg-blush' : 'bg-cream/15')} />
                ))}
              </div>
            </div>
            <CountdownRing round={round} timedOut={timedOut} frozen={picked !== null} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={round}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col gap-3"
            >
              {(['a', 'b'] as const).map((side) => {
                const label = side === 'a' ? current.a : current.b
                const emoji = side === 'a' ? current.emojiA : current.emojiB
                const isPicked = picked === side
                const dimmed = picked !== null && !isPicked
                return (
                  <motion.button
                    key={side}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => choose(side)}
                    animate={{ opacity: dimmed ? 0.35 : 1, scale: isPicked ? 1.02 : 1 }}
                    className={cx(
                      'flex min-h-[132px] flex-1 flex-col items-center justify-center gap-3 rounded-3xl border px-5 text-center no-select',
                      isPicked ? 'border-gold bg-cream text-bordeaux shadow-glow' : 'border-cream/15 bg-cream/8 text-cream',
                    )}
                  >
                    <span className="text-4xl leading-none">{emoji}</span>
                    <span className="font-display text-xl font-semibold leading-tight text-balance">{label}</span>
                  </motion.button>
                )
              })}
              <div className="flex items-center justify-center py-1">
                <span className="rounded-full border border-gold/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-gold">або</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {timedOut && !picked && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-center text-sm text-gold"
              >
                {EITHER_OR_TIMEOUT}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
          <Card className="flex gap-3">
            <FileCheck2 className="shrink-0 text-cherry" />
            <p className="text-[15px] leading-relaxed">{EITHER_OR_DONE}</p>
          </Card>
          <ul className="mt-4 space-y-2">
            {EITHER_OR_ROUNDS.map((r, i) => {
              const c = state.eitherOr[i]
              const label = c === 'a' ? r.a : c === 'b' ? r.b : '—'
              const emoji = c === 'a' ? r.emojiA : c === 'b' ? r.emojiB : '•'
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-3 rounded-2xl border border-cream/15 bg-cream/8 px-4 py-3 text-cream"
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  <span className="text-[14px] font-medium">{label}</span>
                </motion.li>
              )
            })}
          </ul>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button onClick={next}>
              Далі <ArrowRight size={18} />
            </Button>
            <Button variant="ghost" onClick={restart}>
              <RotateCcw size={16} /> Переобрати
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
