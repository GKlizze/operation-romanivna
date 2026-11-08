export type VibeId = 'cozy' | 'walk' | 'surprise' | 'secret'
export type MainId = 'steak' | 'shashlik' | 'lula' | 'together'
export type DessertId = 'pryanyky' | 'chocolate' | 'strawberry' | 'surprise'
export type DrinkId = 'coffee' | 'tea' | 'cocoa' | 'signature'
export type CouponId = 'hugs' | 'surprise' | 'wish'
export type HoursCategoryId = 'hugs' | 'walks' | 'food' | 'movies' | 'adventures'
export type EitherOrChoice = 'a' | 'b'

export interface MenuSelection {
  main?: MainId
  dessert?: DessertId
  drink?: DrinkId
}

export type HoursMap = Record<HoursCategoryId, number>

/** Повний стан гри. Зберігається в localStorage і передається організатору у стислому вигляді. */
export interface GameState {
  version: 1
  /** 0 — привітання, 1..7 — рівні, 8 — фінал */
  step: number
  /** найдальший досягнутий крок — щоб можна було повертатися назад без втрати прогресу */
  maxStep: number
  startedAt: string
  completedAt?: string
  vibe?: VibeId
  menu: MenuSelection
  kisses?: number
  /** індекс раунду -> вибір */
  eitherOr: Record<number, EitherOrChoice>
  coupon?: CouponId
  hours: HoursMap
  wish?: string
  /** коли результат був надісланий організатору через серверний API */
  sentAt?: string
}

export const FINAL_STEP = 8
export const LEVEL_COUNT = 7
export const TOTAL_HOURS = 10
export const KISS_GAME_SECONDS = 15
export const EITHER_OR_SECONDS = 5
