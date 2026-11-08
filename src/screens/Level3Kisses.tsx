import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { burst } from '../components/confetti'
import { Button, Card, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { KISS_INTRO, KISS_TAP_WORDS, LEVEL_TITLES, kissesMessage } from '../game/content'
import { pluralize, randomItem } from '../game/logic'
import { KISS_GAME_SECONDS } from '../game/types'

interface HeartItem {
  id: number
  x: number
  y: number
  size: number
  life: number
  rot: number
  color: string
}
interface Pop {
  id: number
  x: number
  y: number
  word: string
}

const HEART_COLORS = ['#E9B8C7', '#D6B783', '#FFF8F3', '#F08BA8']

export function Level3Kisses() {
  const { state, setKisses, next } = useGame()
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>(state.kisses !== undefined ? 'done' : 'intro')
  const [hearts, setHearts] = useState<HeartItem[]>([])
  const [pops, setPops] = useState<Pop[]>([])
  const [count, setCount] = useState(state.kisses ?? 0)
  const [remaining, setRemaining] = useState(KISS_GAME_SECONDS)

  const timers = useRef<number[]>([])
  const idRef = useRef(0)
  const countRef = useRef(0)
  const startRef = useRef(0)
  const runningRef = useRef(false)
  const caughtRef = useRef<Set<number>>(new Set())

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => () => clearTimers(), [])

  const finish = () => {
    runningRef.current = false
    clearTimers()
    setHearts([])
    setRemaining(0)
    setPhase('done')
    setKisses(countRef.current)
    if (countRef.current >= 13) burst({ x: 0.5, y: 0.5 })
  }

  const tick = () => {
    if (!runningRef.current) return
    const elapsed = (performance.now() - startRef.current) / 1000
    const left = Math.max(0, KISS_GAME_SECONDS - elapsed)
    setRemaining(left)
    if (left <= 0) {
      finish()
      return
    }
    timers.current.push(window.setTimeout(tick, 100))
  }

  const spawn = () => {
    if (!runningRef.current) return
    const elapsed = (performance.now() - startRef.current) / 1000
    if (elapsed >= KISS_GAME_SECONDS) return
    const progress = elapsed / KISS_GAME_SECONDS
    const id = ++idRef.current
    // Чим ближче до кінця — тим швидше з’являються й зникають сердечка.
    const life = 1600 - progress * 750 + Math.random() * 500
    const heart: HeartItem = {
      id,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 44 + Math.random() * 26,
      life,
      rot: (Math.random() - 0.5) * 40,
      color: randomItem(HEART_COLORS),
    }
    setHearts((h) => [...h, heart])
    timers.current.push(window.setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), life))
    const nextIn = 850 - progress * 500 + Math.random() * 280
    timers.current.push(window.setTimeout(spawn, nextIn))
  }

  const start = () => {
    clearTimers()
    setHearts([])
    setPops([])
    caughtRef.current = new Set()
    countRef.current = 0
    setCount(0)
    setRemaining(KISS_GAME_SECONDS)
    setPhase('playing')
    startRef.current = performance.now()
    runningRef.current = true
    tick()
    timers.current.push(window.setTimeout(spawn, 350))
  }

  const catchHeart = (h: HeartItem) => {
    if (!runningRef.current || caughtRef.current.has(h.id)) return
    caughtRef.current.add(h.id)
    setHearts((list) => list.filter((x) => x.id !== h.id))
    countRef.current += 1
    setCount(countRef.current)
    const pop: Pop = { id: h.id, x: h.x, y: h.y, word: randomItem(KISS_TAP_WORDS) }
    setPops((p) => [...p, pop])
    timers.current.push(window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== pop.id)), 700))
  }

  const timerPct = (remaining / KISS_GAME_SECONDS) * 100

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[3].code} title={LEVEL_TITLES[3].title} intro={phase === 'intro' ? KISS_INTRO : undefined} />

      {phase !== 'done' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cream">
              <Timer size={18} className="text-gold" />
              <span className="tabular font-display text-3xl font-semibold">{remaining.toFixed(1)}</span>
              <span className="text-xs text-blush/70">сек</span>
            </div>
            <motion.div
              key={count}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-bordeaux"
            >
              <Heart size={16} fill="currentColor" className="text-cherry" />
              <span className="tabular text-lg font-bold">{count}</span>
            </motion.div>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-cream/15">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-blush to-gold" animate={{ width: `${timerPct}%` }} transition={{ ease: 'linear', duration: 0.1 }} />
          </div>

          <div
            className="relative h-[56dvh] min-h-[340px] touch-none select-none overflow-hidden rounded-3xl border border-cream/15 bg-bordeaux-deep/50"
            style={{ WebkitUserSelect: 'none' }}
          >
            {phase === 'intro' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                  <Heart size={64} fill="#E9B8C7" strokeWidth={0} />
                </motion.div>
                <p className="text-sm text-blush/80">Готова? Таймер стартує одразу.</p>
                <Button full={false} variant="gold" onClick={start} className="px-10">
                  Почати
                </Button>
              </div>
            )}

            <AnimatePresence>
              {hearts.map((h) => (
                <motion.button
                  key={h.id}
                  aria-label="Сердечко"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    catchHeart(h)
                  }}
                  initial={{ scale: 0, opacity: 0, rotate: h.rot - 20 }}
                  animate={{ scale: [0, 1.15, 1, 0.7], opacity: [0, 1, 1, 0.6], rotate: h.rot }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: h.life / 1000, times: [0, 0.15, 0.6, 1], ease: 'easeOut' }}
                  style={{ left: `${h.x}%`, top: `${h.y}%`, width: h.size, height: h.size, color: h.color }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 touch-none"
                >
                  <Heart size={h.size} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_6px_14px_rgba(233,184,199,0.45)]" />
                </motion.button>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {pops.map((p) => (
                <motion.span
                  key={`pop-${p.id}`}
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 1, y: -34, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className="pointer-events-none absolute -translate-x-1/2 font-display text-xl font-bold text-gold drop-shadow"
                >
                  {p.word}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
          <Card className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cherry">Результат</p>
            <motion.p
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              className="font-display mt-2 text-6xl font-bold text-bordeaux"
            >
              {count}
            </motion.p>
            <p className="mt-1 text-sm font-semibold text-cherry">{pluralize(count, ['поцілунок', 'поцілунки', 'поцілунків'])}</p>
            <div className="gold-rule mx-auto my-4 h-px w-24" />
            <p className="text-[15px] leading-relaxed">{kissesMessage(count)}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {Array.from({ length: Math.min(count, 30) }, (_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.03 }}>
                  <Heart size={14} fill="#7B294B" strokeWidth={0} />
                </motion.span>
              ))}
            </div>
          </Card>
          <div className={cx('mt-auto flex flex-col gap-2 pt-6')}>
            <Button onClick={next}>
              Зберегти й далі <ArrowRight size={18} />
            </Button>
            <Button variant="ghost" onClick={start}>
              <RotateCcw size={16} /> Спробувати ще раз
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
