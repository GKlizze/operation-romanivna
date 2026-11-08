import { motion, useScroll, useTransform } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useMemo } from 'react'

interface HeartSpec {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  color: string
  opacity: number
}

const COLORS = ['#E9B8C7', '#D6B783', '#FFF8F3', '#9A3A62']

export function FloatingHearts({ count = 14 }: { count?: number }) {
  const hearts = useMemo<HeartSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i / count) * 100 + Math.random() * 6,
        size: 10 + Math.random() * 22,
        duration: 14 + Math.random() * 14,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 60,
        color: COLORS[i % COLORS.length],
        opacity: 0.12 + Math.random() * 0.25,
      })),
    [count],
  )

  // Легкий паралакс: фонові сердечка рухаються трохи повільніше за контент.
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 180])

  return (
    <motion.div style={{ y }} className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: `${h.left}%`, bottom: -60, color: h.color, opacity: h.opacity }}
          animate={{ y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 900) - 160], x: [0, h.drift, 0], rotate: [0, 15, -10, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'linear' }}
        >
          <Heart size={h.size} fill="currentColor" strokeWidth={0} />
        </motion.div>
      ))}
    </motion.div>
  )
}
