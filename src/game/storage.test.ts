import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  buildResultLink,
  clearState,
  createInitialState,
  decodeResult,
  encodeResult,
  loadState,
  saveState,
} from './storage'
import type { GameState } from './types'

class MemoryStorage implements Storage {
  private map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  clear() {
    this.map.clear()
  }
  getItem(key: string) {
    return this.map.get(key) ?? null
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value))
  }
}

function filledState(): GameState {
  return {
    ...createInitialState(),
    step: 8,
    maxStep: 8,
    completedAt: '2026-11-08T20:00:00.000Z',
    vibe: 'secret',
    menu: { main: 'steak', dessert: 'pryanyky', drink: 'cocoa' },
    kisses: 14,
    eitherOr: { 0: 'a', 1: 'b', 2: 'b', 3: 'a', 4: 'b' },
    coupon: 'wish',
    hours: { hugs: 4, walks: 2, food: 2, movies: 1, adventures: 1 },
    wish: 'Обійняти так, щоб забути про потяг назад.',
  }
}

describe('encodeResult / decodeResult', () => {
  it('round-trips a full state through a URL-safe string', () => {
    const state = filledState()
    const code = encodeResult(state)
    expect(code).toMatch(/^[A-Za-z0-9+\-$]+$/)
    expect(decodeResult(code)).toEqual(state)
  })

  it('returns null for garbage', () => {
    expect(decodeResult('definitely-not-a-payload')).toBeNull()
    expect(decodeResult('')).toBeNull()
  })

  it('rejects payloads that are not a game state', () => {
    const notAState = encodeResult({ hello: 'world' } as unknown as GameState)
    expect(decodeResult(notAState)).toBeNull()
  })
})

describe('buildResultLink', () => {
  it('points at the admin page with the encoded result', () => {
    const state = filledState()
    const link = buildResultLink('https://example.com/game/', state)
    expect(link.startsWith('https://example.com/game/admin?r=')).toBe(true)
    const code = new URL(link).searchParams.get('r')
    expect(decodeResult(code ?? '')).toEqual(state)
  })
})

describe('localStorage persistence', () => {
  beforeEach(() => {
    ;(globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage()
  })

  it('returns a fresh state when nothing is stored', () => {
    const state = loadState()
    expect(state.step).toBe(0)
    expect(state.maxStep).toBe(0)
    expect(state.version).toBe(1)
    expect(state.hours).toEqual({ hugs: 0, walks: 0, food: 0, movies: 0, adventures: 0 })
  })

  it('saves and reloads the same state', () => {
    const state = filledState()
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('falls back to a fresh state when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadState().step).toBe(0)
  })

  it('clearState removes the record', () => {
    saveState(filledState())
    clearState()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
