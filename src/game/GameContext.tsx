import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { clearState, createInitialState, loadState, saveState } from './storage'
import { FINAL_STEP, type CouponId, type EitherOrChoice, type GameState, type HoursMap, type MenuSelection, type VibeId } from './types'

export type Direction = 1 | -1

interface GameContextValue {
  state: GameState
  direction: Direction
  goTo: (step: number) => void
  next: () => void
  back: () => void
  reset: () => void
  setVibe: (vibe: VibeId) => void
  setMenu: (patch: Partial<MenuSelection>) => void
  setKisses: (kisses: number) => void
  setEitherOr: (round: number, choice: EitherOrChoice) => void
  setCoupon: (coupon: CouponId) => void
  setHours: (hours: HoursMap) => void
  setWish: (wish: string) => void
  completeMission: () => void
  markSent: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => loadState())
  const [direction, setDirection] = useState<Direction>(1)
  const firstRender = useRef(true)

  useEffect(() => {
    // Перший рендер — це вже завантажений стан, його не треба перезаписувати.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    saveState(state)
  }, [state])

  const patch = useCallback((p: Partial<GameState>) => {
    setState((s) => ({ ...s, ...p }))
  }, [])

  const goTo = useCallback((step: number) => {
    const target = Math.max(0, Math.min(FINAL_STEP, step))
    setState((s) => {
      setDirection(target >= s.step ? 1 : -1)
      return { ...s, step: target, maxStep: Math.max(s.maxStep, target) }
    })
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      direction,
      goTo,
      next: () => goTo(state.step + 1),
      back: () => goTo(state.step - 1),
      reset: () => {
        clearState()
        setDirection(-1)
        setState(createInitialState())
      },
      setVibe: (vibe) => patch({ vibe }),
      setMenu: (p) => setState((s) => ({ ...s, menu: { ...s.menu, ...p } })),
      setKisses: (kisses) => patch({ kisses }),
      setEitherOr: (round, choice) =>
        setState((s) => ({ ...s, eitherOr: { ...s.eitherOr, [round]: choice } })),
      setCoupon: (coupon) => patch({ coupon }),
      setHours: (hours) => patch({ hours }),
      setWish: (wish) => patch({ wish }),
      completeMission: () => {
        setDirection(1)
        setState((s) => ({
          ...s,
          completedAt: new Date().toISOString(),
          step: FINAL_STEP,
          maxStep: FINAL_STEP,
        }))
      },
      markSent: () => patch({ sentAt: new Date().toISOString() }),
    }),
    [state, direction, goTo, patch],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
