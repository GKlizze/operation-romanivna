import type { GameState } from './types'

/**
 * Надсилає результат на серверний ендпоінт, якщо його налаштовано через VITE_SUBMIT_URL.
 * Повертає true лише коли запит вдалося відправити. Без ендпоінта — одразу false,
 * і тоді працює запасний канал: Дарина ділиться посиланням із результатом вручну.
 */
export async function submitResult(state: GameState): Promise<boolean> {
  const url = import.meta.env.VITE_SUBMIT_URL
  if (!url) return false
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ sentAt: new Date().toISOString(), result: state }),
    })
    return true
  } catch {
    return false
  }
}
