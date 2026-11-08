import LZString from 'lz-string'
import type { GameState } from './types'

export const STORAGE_KEY = 'operation-romanivna:v1'

export function createInitialState(): GameState {
  return {
    version: 1,
    step: 0,
    maxStep: 0,
    startedAt: new Date().toISOString(),
    menu: {},
    eitherOr: {},
    hours: { hugs: 0, walks: 0, food: 0, movies: 0, adventures: 0 },
  }
}

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null
  } catch {
    return false
  }
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.version === 1 &&
    typeof v.step === 'number' &&
    typeof v.maxStep === 'number' &&
    typeof v.menu === 'object' &&
    v.menu !== null &&
    typeof v.hours === 'object' &&
    v.hours !== null &&
    typeof v.eitherOr === 'object' &&
    v.eitherOr !== null
  )
}

/** Повертає збережений стан або свіжий, якщо збереження немає чи воно пошкоджене. */
export function loadState(): GameState {
  if (!hasStorage()) return createInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed: unknown = JSON.parse(raw)
    return isGameState(parsed) ? parsed : createInitialState()
  } catch {
    return createInitialState()
  }
}

export function saveState(state: GameState): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Приватний режим або переповнене сховище — гра продовжує працювати в пам’яті.
  }
}

export function clearState(): void {
  if (!hasStorage()) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Стискає результат у рядок, безпечний для URL. */
export function encodeResult(state: GameState): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(state))
}

export function decodeResult(code: string): GameState | null {
  if (!code) return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(code)
    if (!json) return null
    const parsed: unknown = JSON.parse(json)
    return isGameState(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Посилання на сторінку організатора з вбудованим результатом. baseUrl має закінчуватися на "/". */
export function buildResultLink(baseUrl: string, state: GameState): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}admin?r=${encodeResult(state)}`
}
