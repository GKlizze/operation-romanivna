import { describe, expect, it } from 'vitest'
import { generatePlan, planToText } from './plan'
import { createInitialState } from './storage'
import type { GameState } from './types'

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    vibe: 'cozy',
    menu: { main: 'shashlik', dessert: 'pryanyky', drink: 'tea' },
    kisses: 9,
    eitherOr: { 0: 'a', 1: 'b', 2: 'b', 3: 'b', 4: 'a' },
    coupon: 'hugs',
    hours: { hugs: 4, walks: 1, food: 2, movies: 2, adventures: 1 },
    wish: 'Просто бути поруч і нікуди не поспішати.',
    ...overrides,
  }
}

const allText = (s: GameState) => planToText(generatePlan(s))

describe('generatePlan', () => {
  it('contains every section the brief asks for', () => {
    const ids = generatePlan(state()).map((s) => s.id)
    expect(ids).toEqual([
      'start',
      'activities',
      'menu',
      'romance',
      'schedule',
      'kisses',
      'coupon',
      'wish',
    ])
  })

  it('weaves the chosen menu, coupon, kisses and wish into the text', () => {
    const text = allText(state())
    expect(text).toContain('Шашличок із курячого стегна')
    expect(text).toContain('Пряники')
    expect(text).toContain('Чай')
    expect(text).toContain('30 хвилин обіймів')
    expect(text).toContain('9')
    expect(text).toContain('Просто бути поруч і нікуди не поспішати.')
  })

  it('changes the opening with the vibe', () => {
    const cozy = generatePlan(state({ vibe: 'cozy' })).find((s) => s.id === 'start')!
    const walk = generatePlan(state({ vibe: 'walk' })).find((s) => s.id === 'start')!
    expect(cozy.text).not.toEqual(walk.text)
    expect(cozy.text).toMatch(/плед/i)
    expect(walk.text).toMatch(/за руку|містом/i)
  })

  it('leads with the category that got the most hours', () => {
    const schedule = generatePlan(
      state({ hours: { hugs: 1, walks: 1, food: 1, movies: 1, adventures: 6 } }),
    ).find((s) => s.id === 'schedule')!
    expect(schedule.text.indexOf('Спонтанні пригоди')).toBeLessThan(
      schedule.text.indexOf('Обійми й відпочинок'),
    )
    expect(schedule.text).toContain('6 год')
  })

  it('reflects either-or answers in the romance section', () => {
    const rain = generatePlan(state({ eitherOr: { 2: 'a' } })).find((s) => s.id === 'romance')!
    const blanket = generatePlan(state({ eitherOr: { 2: 'b' } })).find((s) => s.id === 'romance')!
    expect(rain.text).toMatch(/дощ/i)
    expect(blanket.text).toMatch(/ковдр/i)
  })

  it('survives a completely empty state without throwing', () => {
    const text = allText(createInitialState())
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(50)
  })
})
