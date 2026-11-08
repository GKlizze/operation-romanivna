import { X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const NEAR_PX = 80
const COOLDOWN_MS = 110
/** на стільки пікселів кнопка має «не доторкатися» до курсора після стрибка */
const SAFE_PX = 20

interface Props {
  labels: string[]
  hint: string
  onCaught?: () => void
}

interface Point {
  x: number
  y: number
}

/**
 * Кнопка, яку неможливо натиснути: тікає від курсора, коли той наближається,
 * і стрибає з-під пальця в момент дотику — без анімації, щоб клік не встиг
 * «долетіти». Позиція керується звичайним CSS-transform (без framer-motion),
 * бо стрибок має відбутися синхронно, ще до події відпускання.
 * Якщо її все ж «впіймали» клавіатурою, вона лише жартує і нічого не робить.
 */
export function FleeingButton({ labels, hint, onCaught }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const lastFlee = useRef(0)
  const [pos, setPos] = useState<Point | null>(null)
  const [instant, setInstant] = useState(false)
  const [escapes, setEscapes] = useState(0)

  // Спочатку кнопка стоїть по центру своєї зони.
  useLayoutEffect(() => {
    const arena = arenaRef.current
    const btn = btnRef.current
    if (!arena || !btn) return
    setPos({ x: (arena.clientWidth - btn.offsetWidth) / 2, y: (arena.clientHeight - btn.offsetHeight) / 2 })
  }, [])

  // Після миттєвого стрибка повертаємо плавний перехід для наступних втеч.
  useEffect(() => {
    if (!instant) return
    const id = requestAnimationFrame(() => setInstant(false))
    return () => cancelAnimationFrame(id)
  }, [instant, pos])

  const flee = useCallback((px: number, py: number, immediate = false) => {
    const arena = arenaRef.current
    const btn = btnRef.current
    if (!arena || !btn) return
    const now = performance.now()
    if (!immediate && now - lastFlee.current < COOLDOWN_MS) return
    lastFlee.current = now

    const a = arena.getBoundingClientRect()
    const bw = btn.offsetWidth
    const bh = btn.offsetHeight
    const maxX = Math.max(0, a.width - bw)
    const maxY = Math.max(0, a.height - bh)

    // Кандидати — випадкові точки зони; відкидаємо ті, де курсор лишився б над кнопкою.
    const candidates = Array.from({ length: 40 }, () => {
      const x = Math.random() * maxX
      const y = Math.random() * maxY
      const left = a.left + x
      const top = a.top + y
      const covered = px > left - SAFE_PX && px < left + bw + SAFE_PX && py > top - SAFE_PX && py < top + bh + SAFE_PX
      const d = Math.hypot(left + bw / 2 - px, top + bh / 2 - py)
      return { x, y, d, covered }
    })
    const safe = candidates.filter((c) => !c.covered).sort((p, q) => q.d - p.d)
    const pool = safe.length ? safe.slice(0, 5) : candidates.sort((p, q) => q.d - p.d).slice(0, 1)
    const pick = pool[Math.floor(Math.random() * pool.length)]

    if (immediate) {
      // Стрибаємо синхронно, ще до того, як палець чи кнопка миші піднімуться.
      btn.style.transition = 'none'
      btn.style.transform = `translate(${pick.x}px, ${pick.y}px)`
    }
    setInstant(immediate)
    setPos({ x: pick.x, y: pick.y })
    setEscapes((e) => e + 1)
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const btn = btnRef.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right)
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom)
      if (Math.hypot(dx, dy) < NEAR_PX) flee(e.clientX, e.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [flee])

  const label = labels[Math.min(escapes, labels.length - 1)] ?? labels[0]

  return (
    <div>
      <div ref={arenaRef} className="relative -mx-3 mt-3 h-[150px]">
        <button
          ref={btnRef}
          type="button"
          aria-label={labels[0]}
          onPointerEnter={(e) => flee(e.clientX, e.clientY, true)}
          onPointerDown={(e) => {
            e.preventDefault()
            flee(e.clientX, e.clientY, true)
          }}
          onClick={(e) => {
            e.preventDefault()
            onCaught?.()
          }}
          style={{
            transform: pos ? `translate(${pos.x}px, ${pos.y}px)` : undefined,
            opacity: pos ? 1 : 0,
            transition: instant ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s',
            touchAction: 'none',
          }}
          className="absolute left-0 top-0 inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border border-cream/25 bg-cream/10 px-4 text-[13px] font-semibold text-cream/85 no-select backdrop-blur"
        >
          <X size={14} /> {label}
        </button>
      </div>
      <p
        className="text-center text-xs text-gold transition-opacity duration-300"
        style={{ opacity: escapes >= 4 ? 1 : 0 }}
      >
        {hint}
      </p>
    </div>
  )
}
