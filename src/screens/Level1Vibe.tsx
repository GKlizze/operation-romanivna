import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Button, Reaction, SectionTitle, cx } from '../components/ui'
import { useGame } from '../game/GameContext'
import { LEVEL_TITLES, VIBES, VIBE_QUESTION } from '../game/content'

export function Level1Vibe() {
  const { state, setVibe, next } = useGame()
  const chosen = VIBES.find((v) => v.id === state.vibe)

  return (
    <div className="flex flex-1 flex-col">
      <SectionTitle code={LEVEL_TITLES[1].code} title={LEVEL_TITLES[1].title} intro={VIBE_QUESTION} />

      <div className="flex flex-col gap-3">
        {VIBES.map((v, i) => {
          const selected = v.id === state.vibe
          return (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVibe(v.id)}
              className={cx(
                'flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors duration-200 no-select',
                selected
                  ? 'border-gold bg-cream text-bordeaux shadow-glow'
                  : 'border-cream/15 bg-cream/8 text-cream active:bg-cream/15',
              )}
            >
              <span className="text-2xl leading-none">{v.emoji}</span>
              <span className="flex-1 text-[15px] font-medium leading-snug">{v.label}</span>
              <span
                className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-cherry bg-cherry text-cream' : 'border-cream/30',
                )}
              >
                {selected && <Check size={14} strokeWidth={3} />}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">{chosen && <Reaction key={chosen.id} text={chosen.reaction} />}</AnimatePresence>

      <div className="mt-auto pt-6">
        <Button disabled={!chosen} onClick={next}>
          Далі <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  )
}
