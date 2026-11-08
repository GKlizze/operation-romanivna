import { TOTAL_HOURS, type HoursMap } from './types'

export function hoursTotal(hours: HoursMap): number {
  return Object.values(hours).reduce((sum, h) => sum + h, 0)
}

export function isHoursComplete(hours: HoursMap): boolean {
  return hoursTotal(hours) === TOTAL_HOURS
}

export function canAddHour(hours: HoursMap): boolean {
  return hoursTotal(hours) < TOTAL_HOURS
}

/** Fisher–Yates без мутації вхідного масиву. rng можна підмінити в тестах. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Українські форми: pluralize(3, ['поцілунок', 'поцілунки', 'поцілунків']) */
export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}

export function randomItem<T>(items: readonly T[], rng: () => number = Math.random): T {
  return items[Math.floor(rng() * items.length)]
}
