import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChefHat, Check } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Reaction, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { DESSERTS, DRINKS, LEVEL_TITLES, MAINS, MENU_DONE, MENU_INTRO, type MenuOption } from '../game/content'
import type { MenuSelection } from '../game/types'

type Cat = keyof MenuSelection

const CATEGORIES: { id: Cat; title: string; options: readonly MenuOption<string>[] }[] = [
  { id: 'main', title: 'Основна страва', options: MAINS },
  { id: 'dessert', title: 'Десерт', options: DESSERTS },
  { id: 'drink', title: 'Напій', options: DRINKS },
]

function Plate({ emoji, label, delay }: { emoji?: string; label: string; delay: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        className={cx(
          'flex h-16 w-16 items-center justify-center rounded-full border-2',
          emoji ? 'border-gold bg-cream shadow-glow' : 'border-dashed border-cream/30 bg-cream/5',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={emoji ?? 'empty'}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className={cx('leading-none', emoji ? 'text-3xl' : 'text-xl text-cream/40')}
          >
            {emoji ?? '?'}
          </motion.span>
        </AnimatePresence>
      </motion.div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blush/70">{label}</span>
    </div>
  )
}

export function Level2Menu() {
  const { state, setMenu, next } = useGame()
  const [lastPick, setLastPick] = useState<MenuOption<string> | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const complete = Boolean(state.menu.main && state.menu.dessert && state.menu.drink)

  const pick = (cat: Cat, opt: MenuOption<string>) => {
    setMenu({ [cat]: opt.id } as Partial<MenuSelection>)
    setLastPick(opt)
    setConfirmed(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[2].code} title={LEVEL_TITLES[2].title} intro={MENU_INTRO} />

      {/* Віртуальний столик */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mb-5 rounded-[36px] border border-gold/30 bg-gradient-to-b from-cherry/60 to-bordeaux-deep/70 px-4 pb-4 pt-5"
      >
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-bordeaux-deep">
          наш столик
        </span>
        <div className="flex items-start justify-around">
          {CATEGORIES.map((c, i) => {
            const chosen = c.options.find((o) => o.id === state.menu[c.id])
            return <Plate key={c.id} emoji={chosen?.emoji} label={c.title} delay={0.35 + i * 0.08} />
          })}
        </div>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gold/40" />
      </motion.div>

      <div className="space-y-5">
        {CATEGORIES.map((c, ci) => (
          <div key={c.id}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{c.title}</p>
            <div className="grid grid-cols-2 gap-2">
              {c.options.map((o, oi) => {
                const selected = state.menu[c.id] === o.id
                return (
                  <motion.button
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + ci * 0.1 + oi * 0.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => pick(c.id, o)}
                    className={cx(
                      'relative flex min-h-[64px] items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-[13px] font-medium leading-tight transition-colors no-select',
                      selected ? 'border-gold bg-cream text-bordeaux shadow-glow' : 'border-cream/15 bg-cream/8 text-cream active:bg-cream/15',
                    )}
                  >
                    <span className="text-xl leading-none">{o.emoji}</span>
                    <span className="flex-1">{o.label}</span>
                    {selected && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cherry text-cream">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {confirmed ? (
          <Card key="done" tone="cream" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex gap-3">
            <ChefHat className="shrink-0 text-cherry" />
            <p className="text-[15px] leading-relaxed">{MENU_DONE}</p>
          </Card>
        ) : (
          lastPick && <Reaction key={lastPick.id} text={lastPick.reaction} />
        )}
      </AnimatePresence>

      <div className="mt-auto pt-6">
        {confirmed ? (
          <Button onClick={next}>
            Далі <ArrowRight size={18} />
          </Button>
        ) : (
          <Button disabled={!complete} onClick={() => setConfirmed(true)}>
            <ChefHat size={18} /> Оформити замовлення
          </Button>
        )}
        {!complete && <p className="mt-3 text-center text-xs text-blush/60">Обери по одній позиції в кожній категорії</p>}
      </div>
    </div>
  )
}
