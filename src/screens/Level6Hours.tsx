import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { HOURS_CATEGORIES, HOURS_DONE, HOURS_INTRO, LEVEL_TITLES, hoursSecret } from '../game/content'
import { canAddHour, hoursTotal, isHoursComplete } from '../game/logic'
import { TOTAL_HOURS, type HoursCategoryId } from '../game/types'

export const HOURS_COLORS: Record<HoursCategoryId, string> = {
  hugs: '#E9B8C7',
  walks: '#D6B783',
  food: '#FFF8F3',
  movies: '#B46A86',
  adventures: '#F0A58F',
}

export function Level6Hours() {
  const { state, setHours, next } = useGame()
  const total = hoursTotal(state.hours)
  const complete = isHoursComplete(state.hours)
  const [confirmed, setConfirmed] = useState(false)
  const secret = hoursSecret(state.hours)

  const change = (id: HoursCategoryId, delta: number) => {
    const current = state.hours[id]
    if (delta > 0 && !canAddHour(state.hours)) return
    if (delta < 0 && current === 0) return
    setHours({ ...state.hours, [id]: current + delta })
    setConfirmed(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[6].code} title={LEVEL_TITLES[6].title} intro={HOURS_INTRO} />

      {/* Візуалізація */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5 rounded-3xl border border-cream/15 bg-cream/8 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Розподілено</p>
          <p className="font-display text-2xl font-semibold text-cream">
            <span className={cx('tabular', complete && 'text-gold')}>{total}</span>
            <span className="text-base text-blush/60"> / {TOTAL_HOURS} год</span>
          </p>
        </div>
        <div className="mt-3 flex h-4 w-full gap-[2px] overflow-hidden rounded-full bg-bordeaux-deep/60">
          {HOURS_CATEGORIES.map((c) => (
            <motion.div
              key={c.id}
              layout
              animate={{ flexGrow: state.hours[c.id], opacity: state.hours[c.id] ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              style={{ backgroundColor: HOURS_COLORS[c.id], flexBasis: 0 }}
              className="h-full min-w-0"
            />
          ))}
          <motion.div layout animate={{ flexGrow: TOTAL_HOURS - total }} style={{ flexBasis: 0 }} className="h-full min-w-0" />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {HOURS_CATEGORIES.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 text-[11px] text-blush/80">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: HOURS_COLORS[c.id] }} />
              {c.label}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="space-y-2.5">
        {HOURS_CATEGORIES.map((c, i) => {
          const value = state.hours[c.id]
          const plusDisabled = total >= TOTAL_HOURS
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              className={cx('flex items-center gap-3 rounded-2xl border px-3 py-2.5', value > 0 ? 'border-gold/40 bg-cream text-bordeaux' : 'border-cream/15 bg-cream/8 text-cream')}
            >
              <span className="text-2xl leading-none">{c.emoji}</span>
              <span className="flex-1 text-[14px] font-medium leading-tight">{c.label}</span>
              <div className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => change(c.id, -1)}
                  disabled={value === 0}
                  aria-label={`Менше: ${c.label}`}
                  className={cx('flex h-10 w-10 items-center justify-center rounded-full border', value > 0 ? 'border-bordeaux/20 text-bordeaux' : 'border-cream/20 text-cream/40')}
                >
                  <Minus size={16} />
                </motion.button>
                <motion.span key={value} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="tabular w-7 text-center font-display text-xl font-semibold">
                  {value}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => change(c.id, 1)}
                  disabled={plusDisabled}
                  aria-label={`Більше: ${c.label}`}
                  className={cx(
                    'flex h-10 w-10 items-center justify-center rounded-full border',
                    plusDisabled
                      ? value > 0
                        ? 'border-bordeaux/10 text-bordeaux/25'
                        : 'border-cream/15 text-cream/30'
                      : value > 0
                        ? 'border-cherry bg-cherry text-cream'
                        : 'border-blush/60 bg-blush/20 text-cream',
                  )}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {confirmed ? (
          <Card key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex gap-3">
            <Sparkles className="shrink-0 text-cherry" />
            <p className="text-[15px] leading-relaxed">{HOURS_DONE}</p>
          </Card>
        ) : (
          secret && (
            <motion.p
              key={secret}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl border border-gold/30 bg-bordeaux-deep/60 px-4 py-3 text-center text-[14px] text-gold"
            >
              {secret}
            </motion.p>
          )
        )}
      </AnimatePresence>

      <div className="mt-auto pt-6">
        {confirmed ? (
          <Button onClick={next}>
            Далі <ArrowRight size={18} />
          </Button>
        ) : (
          <Button disabled={!complete} onClick={() => setConfirmed(true)}>
            Затвердити план
          </Button>
        )}
        {!complete && !confirmed && (
          <p className="mt-3 text-center text-xs text-blush/60">
            Залишилось розподілити {TOTAL_HOURS - total} год
          </p>
        )}
      </div>
    </div>
  )
}
