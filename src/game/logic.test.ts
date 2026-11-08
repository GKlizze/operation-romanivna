import { describe, expect, it } from 'vitest'
import { bitesMessage, kissesMessage } from './content'
import { canAddHour, hoursTotal, isHoursComplete, shuffle } from './logic'
import type { HoursMap } from './types'

const zero: HoursMap = { hugs: 0, walks: 0, food: 0, movies: 0, adventures: 0 }

describe('hours', () => {
  it('sums all categories', () => {
    expect(hoursTotal({ ...zero, hugs: 3, food: 2 })).toBe(5)
  })

  it('is complete only at exactly 10 hours', () => {
    expect(isHoursComplete({ ...zero, hugs: 10 })).toBe(true)
    expect(isHoursComplete({ ...zero, hugs: 9 })).toBe(false)
    expect(isHoursComplete({ ...zero, hugs: 6, walks: 4 })).toBe(true)
  })

  it('blocks adding hours past the budget', () => {
    expect(canAddHour({ ...zero, hugs: 9 })).toBe(true)
    expect(canAddHour({ ...zero, hugs: 10 })).toBe(false)
  })
})

describe('kissesMessage', () => {
  it('matches the three tiers', () => {
    expect(kissesMessage(0)).toMatch(/скромний/)
    expect(kissesMessage(5)).toMatch(/скромний/)
    expect(kissesMessage(6)).toMatch(/Непогано/)
    expect(kissesMessage(12)).toMatch(/Непогано/)
    expect(kissesMessage(13)).toMatch(/Ого/)
    expect(kissesMessage(40)).toMatch(/Ого/)
  })
})

describe('shuffle', () => {
  it('keeps every element exactly once', () => {
    const out = shuffle(['a', 'b', 'c'])
    expect([...out].sort()).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input and is deterministic with an injected rng', () => {
    const input = [1, 2, 3, 4]
    const seq = [0.9, 0.1, 0.5]
    let i = 0
    const rng = () => seq[i++ % seq.length]
    const out = shuffle(input, rng)
    expect(input).toEqual([1, 2, 3, 4])
    i = 0
    expect(shuffle(input, rng)).toEqual(out)
  })
})

describe('bitesMessage', () => {
  it('has a line for zero, a few and many bites', () => {
    expect(bitesMessage(0)).toMatch(/жодного/i)
    expect(bitesMessage(2)).toMatch(/зубки/i)
    expect(bitesMessage(4)).not.toEqual(bitesMessage(2))
    expect(bitesMessage(9)).toMatch(/зубки/i)
  })
})
