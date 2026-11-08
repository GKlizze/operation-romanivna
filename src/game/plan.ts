import {
  COUPONS,
  DESSERTS,
  DRINKS,
  HOURS_CATEGORIES,
  MAINS,
  kissesMessage,
} from './content'
import { hoursTotal, pluralize } from './logic'
import type { GameState, HoursCategoryId } from './types'

export interface PlanSection {
  id: 'start' | 'activities' | 'menu' | 'romance' | 'schedule' | 'kisses' | 'coupon' | 'wish'
  title: string
  emoji: string
  text: string
}

const START_BY_VIBE: Record<NonNullable<GameState['vibe']>, string> = {
  cozy: 'Ти переступаєш поріг — і далі ми нікуди не йдемо. Плед уже розкладений, кіно майже обране, а моє плече офіційно закріплене за тобою на весь вечір.',
  walk: 'Починаємо з міста: гуляємо без маршруту, тримаємось за руку і шукаємо затишне місце, де можна сісти навпроти одне одного й нікуди не спішити.',
  surprise:
    'Перші години засекречені. Ти просто сідаєш у машину, я мовчу із загадковим обличчям, а далі — побачиш. Обіцяю, що це тобі сподобається.',
  secret:
    'Перші години — за твоїм сценарієм, який ти так і не розкрила. Я готовий до всього. Трохи хвилююсь, але готовий.',
}

const ACTIVITY_PHRASES: Record<HoursCategoryId, string> = {
  hugs: 'обійми й відпочинок без жодного почуття провини',
  walks: 'прогулянки без мети, зате за руку',
  food: 'смачна їжа, яку я готую з надто серйозним обличчям',
  movies: 'фільми, які ми не додивимось, бо розговоримось',
  adventures: 'спонтанні пригоди, про які потім розповідатимемо роками',
}

const ACTIVITY_FLAVOR: Record<HoursCategoryId, string> = {
  hugs: 'Дистанція між нами на цей день скасовується.',
  walks: 'Зручне взуття обов’язкове, рука — моя.',
  food: 'Шеф-кухар попереджений і нервує з приємністю.',
  movies: 'Сюжет фільму ми, скоріш за все, згадаємо приблизно.',
  adventures: 'Планувати пригоди не будемо — у цьому весь сенс.',
}

function sortedHours(state: GameState) {
  return HOURS_CATEGORIES.map((c) => ({ ...c, hours: state.hours[c.id] ?? 0 })).sort(
    (a, b) => b.hours - a.hours,
  )
}

function startSection(state: GameState): string {
  const parts: string[] = []
  parts.push(
    state.vibe ? START_BY_VIBE[state.vibe] : 'Починаємо з того, що ти нарешті поруч. Усе інше — деталі.',
  )
  const trip = state.eitherOr[1]
  if (trip === 'a') parts.push('А якщо захочеться — зриваємось у спонтанну поїздку. Бензин є.')
  if (trip === 'b') parts.push('І так, цілий день у ліжку — це теж офіційно затверджений план.')
  return parts.join(' ')
}

function activitiesSection(state: GameState): string {
  const ranked = sortedHours(state).filter((c) => c.hours > 0)
  if (ranked.length === 0) {
    return 'Головне — ти поруч. Програма підлаштується під настрій, а настрій я беру на себе.'
  }
  const [top, second, third] = ranked
  const parts: string[] = [`Головне в нашому дні — ${ACTIVITY_PHRASES[top.id]}.`]
  if (second && third) {
    parts.push(`Далі — ${ACTIVITY_PHRASES[second.id]} і ${ACTIVITY_PHRASES[third.id]}.`)
  } else if (second) {
    parts.push(`А ще — ${ACTIVITY_PHRASES[second.id]}.`)
  }
  parts.push(ACTIVITY_FLAVOR[top.id])
  return parts.join(' ')
}

function menuSection(state: GameState): string {
  const main = MAINS.find((m) => m.id === state.menu.main)
  const dessert = DESSERTS.find((d) => d.id === state.menu.dessert)
  const drink = DRINKS.find((d) => d.id === state.menu.drink)
  if (!main && !dessert && !drink) {
    return 'Меню уточнюється на місці — обирати будемо разом, сперечатись теж.'
  }
  const parts: string[] = []
  if (main) {
    parts.push(
      main.id === 'together'
        ? 'Основну страву готуємо разом — я заважаю обіймами, ти вдаєш, що це дратує.'
        : `Основна страва: ${main.label}.`,
    )
  }
  if (dessert) {
    parts.push(
      dessert.id === 'surprise'
        ? 'На десерт — сюрприз від мене. Хлопець уже щось гуглить.'
        : `Десерт: ${dessert.label}.`,
    )
  }
  if (drink) {
    parts.push(
      drink.id === 'signature'
        ? 'До цього — авторський напій, рецепт якого я тобі не скажу.'
        : `Напій: ${drink.label}.`,
    )
  }
  if (dessert?.id === 'pryanyky') parts.push('Запас пряників перевірено двічі.')
  if (dessert?.id === 'strawberry') parts.push('Полуницю годую з рук, правила такі.')
  if (main?.id === 'steak') parts.push('Прожарювання обговоримо пошепки.')
  if (drink?.id === 'cocoa') parts.push('Маршмелоу — без обмежень.')
  return parts.join(' ')
}

function romanceSection(state: GameState): string {
  const e = state.eitherOr
  const parts: string[] = []
  if (e[2] === 'a') parts.push('Поцілунок під дощем — чекаємо на прогноз або влаштовуємо дощ самі.')
  if (e[2] === 'b') parts.push('Поцілунок під ковдрою — прогноз погоди не потрібен.')
  if (e[3] === 'a') parts.push('На кухні готую я, ти дивишся й коментуєш.')
  if (e[3] === 'b') parts.push('На кухні готуємо разом і героїчно заважаємо одне одному.')
  if (e[4] === 'a') parts.push('Ввечері — ніжний масаж. Руки вже розминаю.')
  if (e[4] === 'b') parts.push('Ввечері — тривалі обійми без таймера.')
  if (e[0] === 'a') parts.push('Засинаємо в обіймах.')
  if (e[0] === 'b') parts.push('Розмовляємо до світанку, поки хтось не засне першим. Ставлю на себе.')
  if (parts.length === 0) {
    return 'Романтичні моменти не планують — вони трапляються. Я лише подбаю, щоб їх було багато.'
  }
  return parts.join(' ')
}

function scheduleSection(state: GameState): string {
  const total = hoursTotal(state.hours)
  if (total === 0) return 'Години ще не розподілені — отже, кожна з них наша.'
  const ranked = sortedHours(state).filter((c) => c.hours > 0)
  const lines = ranked.map((c) => `${c.label} — ${c.hours} год`)
  return `${lines.join(' · ')}. Усього ${total} умовних годин. На практиці — помножимо на два.`
}

function kissesSection(state: GameState): string {
  const n = state.kisses ?? 0
  return `Запас: ${n} ${pluralize(n, ['поцілунок', 'поцілунки', 'поцілунків'])}. ${kissesMessage(n)}`
}

function couponSection(state: GameState): string {
  const coupon = COUPONS.find((c) => c.id === state.coupon)
  if (!coupon) return 'Конверт ще не відкрито. Нагорода чекає.'
  return `${coupon.title}. ${coupon.subtitle}`
}

function wishSection(state: GameState): string {
  const wish = state.wish?.trim()
  if (!wish) return 'Бажання залишилось незаписаним. Запитаю особисто — пошепки.'
  return `«${wish}»`
}

export function generatePlan(state: GameState): PlanSection[] {
  return [
    { id: 'start', title: 'Початок зустрічі', emoji: '🚪', text: startSection(state) },
    { id: 'activities', title: 'Основні активності', emoji: '🗺️', text: activitiesSection(state) },
    { id: 'menu', title: 'Наше меню', emoji: '🍽️', text: menuSection(state) },
    { id: 'romance', title: 'Романтичні моменти', emoji: '🌹', text: romanceSection(state) },
    { id: 'schedule', title: 'Орієнтовний розподіл часу', emoji: '⏳', text: scheduleSection(state) },
    { id: 'kisses', title: 'Поцілунки', emoji: '💋', text: kissesSection(state) },
    { id: 'coupon', title: 'Секретний купон', emoji: '💌', text: couponSection(state) },
    { id: 'wish', title: 'Твоє бажання', emoji: '✨', text: wishSection(state) },
  ]
}

export function planToText(sections: PlanSection[]): string {
  return sections.map((s) => `${s.title}\n${s.text}`).join('\n\n')
}
