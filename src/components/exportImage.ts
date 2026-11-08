import { toBlob, toPng } from 'html-to-image'

export type ExportOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed'

/**
 * Рендерить DOM-вузол у PNG. На iPhone відкриває системне меню «Поділитися»
 * (звідти можна зберегти у Фото), на десктопі — завантажує файл.
 */
export async function exportNodeAsImage(
  node: HTMLElement,
  filename: string,
  shareTitle: string,
): Promise<ExportOutcome> {
  const options = { pixelRatio: 2, cacheBust: true, backgroundColor: '#451b30' }
  try {
    // Safari інколи віддає порожнє зображення з першого разу — «прогріваємо» рендер.
    await toPng(node, options)
    const blob = await toBlob(node, options)
    if (!blob) return 'failed'
    const file = new File([blob], filename, { type: 'image/png' })

    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: shareTitle })
        return 'shared'
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return 'cancelled'
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}

export async function shareText(text: string, url?: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(url ? { text, url } : { text })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url ? `${text}\n${url}` : text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
