import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { burst } from '../components/confetti'
import { Jaw } from '../components/Jaw'
import { Button, Card, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { BITE_WORDS, CRACK_WORDS, KISS_INTRO, KISS_WORDS, LEVEL_TITLES, bitesMessage, kissesMessage } from '../game/content'
import { pluralize, randomItem } from '../game/logic'
import { KISS_GAME_SECONDS } from '../game/types'

type HeartState = 'frozen' | 'freed' | 'bitten'

interface HeartItem {
  id: number
  x: number
  y: number
  size: number
  /** скільки дотиків треба, щоб розбити кригу */
  iceHp: number
  hits: number
  /** за скільки мс зубки дістануться сердечка */
  life: number
  /** звідки повзуть зубки (у % поля) */
  from: { x: number; y: number }
  /** кут руху щелепи в градусах (0 — вправо) */
  angle: number
  state: HeartState
}

interface Pop {
  id: number
  x: number
  y: number
  word: string
  kind: 'kiss' | 'bite' | 'crack'
}

const MAX_ON_SCREEN = 4
const EXIT_MS = 450
const SHARDS = [
  { x: -30, y: -26, r: 40 },
  { x: 32, y: -22, r: -30 },
  { x: -26, y: 26, r: 60 },
  { x: 28, y: 30, r: -50 },
  { x: 2, y: -36, r: 15 },
  { x: -4, y: 34, r: -20 },
]

const clamp = (v: number, min = 4, max = 96) => Math.max(min, Math.min(max, v))

function IceHeart({ h, onHit }: { h: HeartItem; onHit: (h: HeartItem) => void }) {
  const crack = h.iceHp > 0 ? h.hits / h.iceHp : 0
  const frozen = h.state === 'frozen'
  return (
    <motion.button
      aria-label="Сердечко в кризі"
      onPointerDown={(e) => {
        e.preventDefault()
        onHit(h)
      }}
      initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
      animate={
        frozen
          ? { x: '-50%', y: '-50%', scale: 1, opacity: 1, rotate: 0 }
          : h.state === 'freed'
            ? { x: '-50%', y: '-130%', scale: 1.25, opacity: 0, rotate: 0 }
            : { x: '-50%', y: '-50%', scale: 0.4, opacity: 0, rotate: 30 }
      }
      transition={frozen ? { type: 'spring', stiffness: 360, damping: 18 } : { duration: EXIT_MS / 1000, ease: 'easeOut' }}
      style={{ left: `${h.x}%`, top: `${h.y}%`, width: h.size, height: h.size }}
      className="absolute z-10 touch-none"
    >
      <motion.div
        key={h.hits}
        animate={h.hits ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative h-full w-full"
      >
        <Heart
          size={h.size * 0.58}
          fill="#E9B8C7"
          strokeWidth={0}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blush drop-shadow-[0_4px_10px_rgba(233,184,199,0.5)]"
        />
        {frozen && (
          <>
            <div className="absolute inset-0 rounded-[34%] border border-white/85 bg-gradient-to-br from-white/85 via-white/45 to-blush/25 shadow-[inset_0_0_14px_rgba(255,255,255,0.95),0_8px_18px_rgba(42,15,29,0.35)]" />
            <span className="absolute left-[16%] top-[12%] h-[16%] w-[9%] rotate-[28deg] rounded-full bg-white/95" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: crack }}>
              <path d="M52 4 L44 34 L58 50 L46 74 L60 97" stroke="#451B30" strokeWidth="2.6" fill="none" strokeOpacity="0.6" strokeLinecap="round" />
              <path d="M44 34 L14 42 M58 50 L88 40 M46 74 L20 84 M58 50 L74 72" stroke="#451B30" strokeWidth="2" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
            </svg>
          </>
        )}
        {h.state === 'freed' &&
          SHARDS.map((sh, i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: sh.x, y: sh.y, opacity: 0, rotate: sh.r }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-3 w-3 rounded-sm bg-white/90"
            />
          ))}
      </motion.div>
    </motion.button>
  )
}

export function Level3Kisses() {
  const { state, setKissResult, next } = useGame()
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>(state.kisses !== undefined ? 'done' : 'intro')
  const [hearts, setHearts] = useState<HeartItem[]>([])
  const [pops, setPops] = useState<Pop[]>([])
  const [kisses, setKissesCount] = useState(state.kisses ?? 0)
  const [bites, setBitesCount] = useState(state.bites ?? 0)
  const [remaining, setRemaining] = useState(KISS_GAME_SECONDS)

  const timers = useRef<number[]>([])
  const biteTimers = useRef<Map<number, number>>(new Map())
  const heartsRef = useRef<HeartItem[]>([])
  const arenaRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const popIdRef = useRef(0)
  const kissesRef = useRef(0)
  const bitesRef = useRef(0)
  const startRef = useRef(0)
  const runningRef = useRef(false)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    biteTimers.current.forEach((t) => window.clearTimeout(t))
    biteTimers.current.clear()
  }
  useEffect(() => () => clearTimers(), [])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const updateHearts = (fn: (list: HeartItem[]) => HeartItem[]) => {
    heartsRef.current = fn(heartsRef.current)
    setHearts(heartsRef.current)
  }

  const addPop = (x: number, y: number, word: string, kind: Pop['kind']) => {
    const id = ++popIdRef.current
    setPops((p) => [...p, { id, x, y, word, kind }])
    later(() => setPops((p) => p.filter((q) => q.id !== id)), kind === 'crack' ? 500 : 800)
  }

  const removeHeart = (id: number) => updateHearts((l) => l.filter((h) => h.id !== id))

  const finish = () => {
    runningRef.current = false
    clearTimers()
    updateHearts(() => [])
    setRemaining(0)
    setPhase('done')
    setKissResult(kissesRef.current, bitesRef.current)
    if (kissesRef.current >= 13) burst({ x: 0.5, y: 0.5 })
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
    later(tick, 100)
  }

  /** Зубки дісталися сердечка — кусь. */
  const bite = (id: number) => {
    biteTimers.current.delete(id)
    const h = heartsRef.current.find((x) => x.id === id)
    if (!h || h.state !== 'frozen' || !runningRef.current) return
    bitesRef.current += 1
    setBitesCount(bitesRef.current)
    addPop(h.x, h.y - 4, randomItem(BITE_WORDS), 'bite')
    updateHearts((l) => l.map((x) => (x.id === id ? { ...x, state: 'bitten' } : x)))
    later(() => removeHeart(id), EXIT_MS)
  }

  /** Дотик до криги. */
  const hit = (target: HeartItem) => {
    if (!runningRef.current) return
    const h = heartsRef.current.find((x) => x.id === target.id)
    if (!h || h.state !== 'frozen') return
    const hits = h.hits + 1
    if (hits >= h.iceHp) {
      const t = biteTimers.current.get(h.id)
      if (t) window.clearTimeout(t)
      biteTimers.current.delete(h.id)
      kissesRef.current += 1
      setKissesCount(kissesRef.current)
      addPop(h.x, h.y - 8, randomItem(KISS_WORDS), 'kiss')
      updateHearts((l) => l.map((x) => (x.id === h.id ? { ...x, hits, state: 'freed' } : x)))
      later(() => removeHeart(h.id), EXIT_MS)
    } else {
      addPop(h.x + 9, h.y - 9, randomItem(CRACK_WORDS), 'crack')
      updateHearts((l) => l.map((x) => (x.id === h.id ? { ...x, hits } : x)))
    }
  }

  const spawn = () => {
    if (!runningRef.current) return
    const elapsed = (performance.now() - startRef.current) / 1000
    if (elapsed >= KISS_GAME_SECONDS) return
    const progress = elapsed / KISS_GAME_SECONDS
    const active = heartsRef.current.filter((h) => h.state === 'frozen').length
    if (active < MAX_ON_SCREEN) {
      const id = ++idRef.current
      const x = 14 + Math.random() * 72
      const y = 14 + Math.random() * 72
      // Чим далі — тим швидші зубки і міцніша крига.
      const life = 2700 - progress * 1100 + Math.random() * 500
      const iceHp = progress < 0.35 ? 2 : Math.random() < 0.55 ? 2 : 3
      const edge = Math.floor(Math.random() * 4)
      const jitter = (Math.random() - 0.5) * 40
      const from =
        edge === 0
          ? { x: clamp(x + jitter), y: -10 }
          : edge === 1
            ? { x: clamp(x + jitter), y: 110 }
            : edge === 2
              ? { x: -10, y: clamp(y + jitter) }
              : { x: 110, y: clamp(y + jitter) }
      // Напрямок руху в пікселях, щоб щелепа дивилася точно на сердечко.
      const rect = arenaRef.current?.getBoundingClientRect()
      const aw = rect?.width ?? 1
      const ah = rect?.height ?? 1
      const angle = (Math.atan2(((y - from.y) * ah) / 100, ((x - from.x) * aw) / 100) * 180) / Math.PI
      const heart: HeartItem = { id, x, y, size: 60 + Math.random() * 18, iceHp, hits: 0, life, from, angle, state: 'frozen' }
      updateHearts((l) => [...l, heart])
      biteTimers.current.set(id, window.setTimeout(() => bite(id), life))
    }
    later(spawn, 950 - progress * 450 + Math.random() * 250)
  }

  const start = () => {
    clearTimers()
    updateHearts(() => [])
    setPops([])
    kissesRef.current = 0
    bitesRef.current = 0
    setKissesCount(0)
    setBitesCount(0)
    setRemaining(KISS_GAME_SECONDS)
    setPhase('playing')
    startRef.current = performance.now()
    runningRef.current = true
    tick()
    later(spawn, 400)
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
            <div className="flex items-center gap-2">
              <motion.div
                key={`k-${kisses}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-bordeaux"
              >
                <span className="text-sm leading-none">💋</span>
                <span className="tabular text-lg font-bold">{kisses}</span>
              </motion.div>
              <motion.div
                key={`b-${bites}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 rounded-full border border-cream/20 bg-bordeaux-deep/60 px-3 py-1.5 text-cream"
              >
                <span className="text-sm leading-none">🦷</span>
                <span className="tabular text-lg font-bold">{bites}</span>
              </motion.div>
            </div>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-cream/15">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blush to-gold"
              animate={{ width: `${timerPct}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>

          <div
            ref={arenaRef}
            className="relative h-[56dvh] min-h-[340px] touch-none select-none overflow-hidden rounded-3xl border border-cream/15 bg-bordeaux-deep/50"
            style={{ WebkitUserSelect: 'none' }}
          >
            {phase === 'intro' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-[34%] border border-white/85 bg-gradient-to-br from-white/85 via-white/45 to-blush/25 shadow-[inset_0_0_14px_rgba(255,255,255,0.95)]" />
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="relative">
                    <Heart size={44} fill="#E9B8C7" strokeWidth={0} className="text-blush" />
                  </motion.div>
                  <motion.div
                    className="absolute -right-14 top-1/2 -translate-y-1/2"
                    animate={{ x: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                  >
                    <div style={{ transform: 'scaleX(-1)' }}>
                      <Jaw size={52} />
                    </div>
                  </motion.div>
                </div>
                <p className="text-sm text-blush/80">Готова? Таймер стартує одразу.</p>
                <Button full={false} variant="gold" onClick={start} className="px-10">
                  Почати
                </Button>
              </div>
            )}

            <AnimatePresence>
              {hearts
                .filter((h) => h.state === 'frozen')
                .map((h) => (
                  <motion.div
                    key={`teeth-${h.id}`}
                    initial={{ left: `${h.from.x}%`, top: `${h.from.y}%`, x: '-50%', y: '-50%', opacity: 0, scale: 0.6 }}
                    animate={{ left: `${h.x}%`, top: `${h.y}%`, x: '-50%', y: '-50%', opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.3 } }}
                    transition={{
                      left: { duration: h.life / 1000, ease: 'linear' },
                      top: { duration: h.life / 1000, ease: 'linear' },
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.3 },
                    }}
                    className="pointer-events-none absolute z-20"
                  >
                    <div style={{ transform: `rotate(${h.angle}deg)${Math.abs(h.angle) > 90 ? ' scaleY(-1)' : ''}` }}>
                      <Jaw />
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            <AnimatePresence>
              {hearts.map((h) => (
                <IceHeart key={h.id} h={h} onHit={hit} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {pops.map((p) => (
                <motion.span
                  key={`pop-${p.id}`}
                  initial={{ opacity: 0, y: 0, scale: 0.6, x: '-50%' }}
                  animate={{ opacity: 1, y: p.kind === 'crack' ? -14 : -36, scale: 1, x: '-50%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: p.kind === 'crack' ? 0.4 : 0.65 }}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className={cx(
                    'pointer-events-none absolute z-30 whitespace-nowrap font-display font-bold drop-shadow',
                    p.kind === 'kiss' && 'text-2xl text-gold',
                    p.kind === 'bite' && 'rounded-full bg-cherry px-2.5 py-0.5 text-lg text-cream',
                    p.kind === 'crack' && 'text-sm text-white/80',
                  )}
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
            <div className="mt-3 grid grid-cols-2 gap-3">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                className="rounded-2xl bg-blush/30 px-3 py-4"
              >
                <p className="text-2xl leading-none">💋</p>
                <p className="font-display mt-1 text-5xl font-bold text-bordeaux">{kisses}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cherry">{pluralize(kisses, ['цьом', 'цьоми', 'цьомів'])}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
                className="rounded-2xl bg-bordeaux/5 px-3 py-4"
              >
                <p className="text-2xl leading-none">🦷</p>
                <p className="font-display mt-1 text-5xl font-bold text-bordeaux">{bites}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-bordeaux/60">{pluralize(bites, ['кусь', 'кусі', 'кусів'])}</p>
              </motion.div>
            </div>
            <div className="gold-rule mx-auto my-4 h-px w-24" />
            <p className="text-[15px] leading-relaxed">{kissesMessage(kisses)}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-bordeaux/75">{bitesMessage(bites)}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {Array.from({ length: Math.min(kisses, 30) }, (_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.03 }}>
                  <Heart size={14} fill="#7B294B" strokeWidth={0} />
                </motion.span>
              ))}
            </div>
          </Card>
          <div className="mt-auto flex flex-col gap-2 pt-6">
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
