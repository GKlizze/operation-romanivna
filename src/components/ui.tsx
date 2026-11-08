import { motion, type HTMLMotionProps } from 'framer-motion'
import { Heart } from 'lucide-react'
import { type ReactNode } from 'react'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-cherry-light via-cherry to-bordeaux text-cream shadow-glow border border-gold/40',
  secondary: 'bg-cream text-bordeaux border border-blush/60 shadow-card',
  ghost: 'bg-cream/10 text-cream border border-cream/20 backdrop-blur',
  gold: 'bg-gradient-to-br from-gold to-[#c4a267] text-bordeaux-deep border border-cream/40 shadow-glow',
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  children?: ReactNode
  full?: boolean
}

export function Button({ variant = 'primary', className, children, disabled, full = true, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={cx(
        'relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold tracking-wide transition-opacity',
        'min-h-[56px] no-select',
        full && 'w-full',
        VARIANTS[variant],
        disabled && 'opacity-40 pointer-events-none',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

interface CardProps extends HTMLMotionProps<'div'> {
  tone?: 'cream' | 'cherry' | 'glass'
}

const CARD_TONES = {
  cream: 'bg-cream text-bordeaux shadow-card',
  cherry: 'bg-cherry/70 text-cream border border-blush/20 shadow-card',
  glass: 'bg-cream/8 text-cream border border-cream/15 backdrop-blur-md',
}

export function Card({ tone = 'cream', className, children, ...rest }: CardProps) {
  return (
    <motion.div className={cx('rounded-3xl p-5', CARD_TONES[tone], className)} {...rest}>
      {children}
    </motion.div>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-bordeaux-deep/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Текст, що з’являється слово за словом. */
export function RevealText({
  text,
  delay = 0,
  className,
  stagger = 0.035,
}: {
  text: string
  delay?: number
  className?: string
  stagger?: number
}) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${i}-${w}`}
          className="inline-block"
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * stagger, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  )
}

/** Жартівлива реакція організатора на вибір. */
export function Reaction({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="relative mt-4 rounded-2xl border border-gold/30 bg-bordeaux-deep/60 px-4 py-3 text-[15px] leading-relaxed text-cream backdrop-blur"
    >
      <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-cherry px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blush">
        <Heart size={10} fill="currentColor" /> організатор
      </span>
      <RevealText text={text} stagger={0.025} />
    </motion.div>
  )
}

export function SectionTitle({ code, title, intro }: { code: string; title: string; intro?: string }) {
  return (
    <div className="mb-5">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <Chip>{code}</Chip>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="font-display mt-3 text-[28px] leading-[1.15] font-semibold text-cream text-balance"
      >
        {title}
      </motion.h2>
      {intro && (
        <p className="mt-3 text-[15px] leading-relaxed text-blush/90">
          <RevealText text={intro} delay={0.2} stagger={0.02} />
        </p>
      )}
    </div>
  )
}
