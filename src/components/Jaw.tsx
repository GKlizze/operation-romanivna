/**
 * Анімована щелепа: верхня й нижня частини з яснами та окремими зубами
 * (кутні, ікла, різці) клацають навколо шарніра зліва. Паща відкрита вправо —
 * батьківський елемент розвертає її в бік сердечка.
 */
export function Jaw({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 64 48"
      className={className}
      style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 8px rgba(26, 8, 18, 0.6))' }}
      aria-hidden
    >
      {/* глибина пащі */}
      <ellipse cx="16" cy="24" rx="9" ry="7" fill="#2a0f1d" />

      {/* верхня щелепа */}
      <g className="jaw-upper">
        <path d="M6 19 L6 10 Q6 2 15 2 L55 2 Q64 2 64 10 L64 19 Q35 16 6 19 Z" fill="#9a3a62" stroke="#451b30" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 7 Q35 4 61 7" fill="none" stroke="#c07a9b" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <g fill="#fff8f3" stroke="#c9a7b5" strokeWidth="0.9" strokeLinejoin="round">
          <path d="M9 17 h9 v4 q0 3 -3 3 h-3 q-3 0 -3 -3 z" />
          <path d="M19 17 h9 v4 q0 3 -3 3 h-3 q-3 0 -3 -3 z" />
          <path d="M29 17 h8 l-2.6 9.4 q-1.4 2.2 -2.8 0 z" />
          <path d="M38 17 h8 v6 q0 2 -2 2 h-4 q-2 0 -2 -2 z" />
          <path d="M47 17 h8 v6 q0 2 -2 2 h-4 q-2 0 -2 -2 z" />
          <path d="M56 17 h5 v5 q0 2 -2 2 h-1 q-2 0 -2 -2 z" />
        </g>
        <path d="M11 19 h5 M21 19 h5 M40 19 h4 M49 19 h4" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
      </g>

      {/* нижня щелепа */}
      <g className="jaw-lower">
        <path d="M6 29 L6 38 Q6 46 15 46 L55 46 Q64 46 64 38 L64 29 Q35 32 6 29 Z" fill="#9a3a62" stroke="#451b30" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 41 Q35 44 61 41" fill="none" stroke="#c07a9b" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <g fill="#fff8f3" stroke="#c9a7b5" strokeWidth="0.9" strokeLinejoin="round">
          <path d="M9 31 h9 v-4 q0 -3 -3 -3 h-3 q-3 0 -3 3 z" />
          <path d="M19 31 h9 v-4 q0 -3 -3 -3 h-3 q-3 0 -3 3 z" />
          <path d="M29 31 h8 l-2.6 -9.4 q-1.4 -2.2 -2.8 0 z" />
          <path d="M38 31 h8 v-6 q0 -2 -2 -2 h-4 q-2 0 -2 2 z" />
          <path d="M47 31 h8 v-6 q0 -2 -2 -2 h-4 q-2 0 -2 2 z" />
          <path d="M56 31 h5 v-5 q0 -2 -2 -2 h-1 q-2 0 -2 2 z" />
        </g>
      </g>

      {/* шарнір */}
      <circle cx="8" cy="24" r="3.2" fill="#7b294b" stroke="#fff8f3" strokeWidth="1.2" />
    </svg>
  )
}
