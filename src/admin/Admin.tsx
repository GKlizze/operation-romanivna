import { motion } from 'framer-motion'
import { ClipboardPaste, Download, Heart, Lock, LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FloatingHearts } from '../components/FloatingHearts'
import { Button, Chip, cx } from '../components/ui'
import { couponSerial } from '../components/CouponCard'
import {
  COUPONS,
  DESSERTS,
  DRINKS,
  EITHER_OR_ROUNDS,
  HOURS_CATEGORIES,
  MAINS,
  VIBES,
  kissesMessage,
} from '../game/content'
import { hoursTotal } from '../game/logic'
import { generatePlan, planToText } from '../game/plan'
import { decodeResult, loadState } from '../game/storage'
import type { GameState } from '../game/types'
import { HOURS_COLORS } from '../screens/Level6Hours'
import { configuredHash, forgetSession, hasSession, rememberSession, verifyPassword } from './auth'

interface Loaded {
  state: GameState
  source: string
}

function extractCode(input: string): string {
  const trimmed = input.trim()
  try {
    const url = new URL(trimmed)
    return url.searchParams.get('r') ?? trimmed
  } catch {
    const m = trimmed.match(/[?&]r=([^&\s]+)/)
    return m ? m[1] : trimmed
  }
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-bordeaux/10 py-2 last:border-0">
      <span className="text-[12px] uppercase tracking-[0.12em] text-bordeaux/55">{label}</span>
      <span className="text-right text-[14px] font-medium">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-cream p-5 text-bordeaux shadow-card">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cherry">{title}</h3>
      {children}
    </section>
  )
}

function Results({ loaded }: { loaded: Loaded }) {
  const s = loaded.state
  const plan = useMemo(() => generatePlan(s), [s])
  const vibe = VIBES.find((v) => v.id === s.vibe)
  const main = MAINS.find((m) => m.id === s.menu.main)
  const dessert = DESSERTS.find((d) => d.id === s.menu.dessert)
  const drink = DRINKS.find((d) => d.id === s.menu.drink)
  const coupon = COUPONS.find((c) => c.id === s.coupon)
  const total = hoursTotal(s.hours)

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: loaded.source,
      answers: {
        vibe: vibe ? { id: vibe.id, label: vibe.label } : null,
        menu: { main: main?.label ?? null, dessert: dessert?.label ?? null, drink: drink?.label ?? null },
        kisses: s.kisses ?? null,
        eitherOr: EITHER_OR_ROUNDS.map((r, i) => ({
          question: `${r.a} / ${r.b}`,
          answer: s.eitherOr[i] === 'a' ? r.a : s.eitherOr[i] === 'b' ? r.b : null,
        })),
        coupon: coupon ? { id: coupon.id, title: coupon.title } : null,
        hours: s.hours,
        wish: s.wish ?? null,
      },
      plan: plan.map((p) => ({ title: p.title, text: p.text })),
      raw: s,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `operation-romanivna-${(s.completedAt ?? s.startedAt).slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(planToText(plan))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-blush/80">
        <Chip>джерело: {loaded.source}</Chip>
        <span>почато {fmtDate(s.startedAt)}</span>
        <span>· завершено {fmtDate(s.completedAt)}</span>
        {s.sentAt && <span>· надіслано на сервер {fmtDate(s.sentAt)}</span>}
        <span>· крок {s.step}/8</span>
      </div>

      <Section title="Рівень 1 · Вайб">
        <p className="text-[15px] font-medium">{vibe ? `${vibe.emoji} ${vibe.label}` : '—'}</p>
      </Section>

      <Section title="Рівень 2 · Меню">
        <Row label="Основна страва" value={main ? `${main.emoji} ${main.label}` : '—'} />
        <Row label="Десерт" value={dessert ? `${dessert.emoji} ${dessert.label}` : '—'} />
        <Row label="Напій" value={drink ? `${drink.emoji} ${drink.label}` : '—'} />
      </Section>

      <Section title="Рівень 3 · Поцілунки">
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-bold">{s.kisses ?? '—'}</span>
          <p className="text-[14px] text-bordeaux/75">{s.kisses !== undefined ? kissesMessage(s.kisses) : 'Мінігру ще не пройдено'}</p>
        </div>
      </Section>

      <Section title="Рівень 4 · Або-або">
        {EITHER_OR_ROUNDS.map((r, i) => {
          const c = s.eitherOr[i]
          return (
            <div key={i} className="flex items-center gap-2 border-b border-bordeaux/10 py-2 text-[14px] last:border-0">
              <span className={cx('flex-1 rounded-lg px-2 py-1', c === 'a' ? 'bg-cherry text-cream font-semibold' : 'text-bordeaux/50')}>{r.a}</span>
              <span className="text-[10px] uppercase text-bordeaux/40">або</span>
              <span className={cx('flex-1 rounded-lg px-2 py-1 text-right', c === 'b' ? 'bg-cherry text-cream font-semibold' : 'text-bordeaux/50')}>{r.b}</span>
            </div>
          )
        })}
      </Section>

      <Section title="Рівень 5 · Купон">
        {coupon ? (
          <>
            <p className="text-[15px] font-medium">
              {coupon.emoji} {coupon.title}
            </p>
            <p className="mt-1 text-[12px] text-bordeaux/60">№ {couponSerial(coupon, s.startedAt)}</p>
          </>
        ) : (
          <p>—</p>
        )}
      </Section>

      <Section title={`Рівень 6 · Розподіл часу (${total}/10)`}>
        <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-bordeaux/10">
          {HOURS_CATEGORIES.map((c) => (
            <div key={c.id} style={{ width: `${(s.hours[c.id] / 10) * 100}%`, backgroundColor: HOURS_COLORS[c.id] }} className="border-r border-cream/60 last:border-0" />
          ))}
        </div>
        {HOURS_CATEGORIES.map((c) => (
          <Row key={c.id} label={`${c.emoji} ${c.label}`} value={`${s.hours[c.id]} год`} />
        ))}
      </Section>

      <Section title="Рівень 7 · Особисте бажання">
        <p className="font-display text-[18px] leading-snug">{s.wish?.trim() ? `«${s.wish.trim()}»` : '—'}</p>
      </Section>

      <Section title="Сформований план побачення">
        <div className="space-y-3">
          {plan.map((p) => (
            <div key={p.id}>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-bordeaux/60">
                {p.emoji} {p.title}
              </p>
              <p className="text-[14px] leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="gold" onClick={exportJson}>
          <Download size={18} /> Експорт у JSON
        </Button>
        <Button variant="ghost" onClick={copyPlan}>
          Скопіювати план текстом
        </Button>
      </div>
    </div>
  )
}

export function Admin() {
  const [params] = useSearchParams()
  const [authed, setAuthed] = useState(hasSession)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [pasted, setPasted] = useState('')
  const [remote, setRemote] = useState<{ items: Loaded[]; error?: string } | null>(null)
  const hashConfigured = Boolean(configuredHash())
  const resultsUrl = import.meta.env.VITE_RESULTS_URL

  const loadFromSources = useCallback(() => {
    const code = params.get('r')
    if (code) {
      const decoded = decodeResult(code)
      if (decoded) {
        setLoaded({ state: decoded, source: 'посилання від Дарини' })
        return
      }
    }
    const local = loadState()
    if (local.maxStep > 0) setLoaded({ state: local, source: 'цей пристрій' })
  }, [params])

  useEffect(() => {
    if (authed) loadFromSources()
  }, [authed, loadFromSources])

  const fetchRemote = useCallback(async () => {
    if (!resultsUrl) return
    try {
      const res = await fetch(resultsUrl, { cache: 'no-store' })
      const data: unknown = await res.json()
      const list = Array.isArray(data) ? data : []
      const items: Loaded[] = []
      for (const row of list) {
        const r = row as { result?: unknown; sentAt?: string }
        const candidate = r.result ?? row
        const decoded = decodeResult(typeof candidate === 'string' ? candidate : '') ?? (isState(candidate) ? candidate : null)
        if (decoded) items.push({ state: decoded, source: `сервер · ${fmtDate(r.sentAt)}` })
      }
      setRemote({ items })
    } catch {
      setRemote({ items: [], error: 'Не вдалося завантажити результати з сервера' })
    }
  }, [resultsUrl])

  useEffect(() => {
    if (authed && resultsUrl) void fetchRemote()
  }, [authed, resultsUrl, fetchRemote])

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError(null)
    const ok = await verifyPassword(password)
    setChecking(false)
    if (ok) {
      rememberSession()
      setAuthed(true)
      setPassword('')
    } else {
      setError('Пароль не підійшов. Організатор, це точно ти?')
    }
  }

  const applyPasted = () => {
    const decoded = decodeResult(extractCode(pasted))
    if (decoded) {
      setLoaded({ state: decoded, source: 'вставлений код' })
      setPasted('')
      setError(null)
    } else {
      setError('Не вдалося розпізнати код результату')
    }
  }

  return (
    <div className="app-bg relative min-h-dvh">
      <FloatingHearts count={8} />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 safe-top safe-bottom">
        <header className="flex items-center justify-between py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blush/80">
            <Heart size={14} fill="currentColor" /> До гри
          </Link>
          {authed && (
            <button
              onClick={() => {
                forgetSession()
                setAuthed(false)
                setLoaded(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 text-xs text-cream/80"
            >
              <LogOut size={14} /> Вийти
            </button>
          )}
        </header>

        <div className="mb-6">
          <Chip>
            <ShieldCheck size={11} /> режим організатора
          </Chip>
          <h1 className="font-display mt-3 text-3xl font-bold text-cream">Штаб операції</h1>
        </div>

        {!authed ? (
          <motion.form
            onSubmit={login}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-sm rounded-3xl bg-cream p-6 text-bordeaux shadow-card"
          >
            <div className="mb-4 flex items-center gap-2 text-cherry">
              <Lock size={18} />
              <span className="text-sm font-semibold">Доступ лише для організатора</span>
            </div>
            {!hashConfigured ? (
              <p className="rounded-2xl bg-blush/30 p-3 text-sm leading-relaxed">
                Пароль не налаштовано. Задай змінну <code className="font-mono text-xs">VITE_ADMIN_PASSWORD_HASH</code> (SHA-256 пароля) під час збірки.
              </p>
            ) : (
              <>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-blush/60 bg-blush/15 px-4 py-3 text-[16px] focus:border-cherry focus:outline-none"
                />
                {error && <p className="mt-2 text-sm text-cherry">{error}</p>}
                <Button type="submit" className="mt-4" disabled={checking || !password}>
                  {checking ? 'Перевіряємо…' : 'Увійти'}
                </Button>
              </>
            )}
          </motion.form>
        ) : (
          <div className="space-y-6">
            <section className="rounded-3xl border border-cream/15 bg-cream/8 p-4 text-cream">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Завантажити результат</p>
              <p className="mb-3 text-sm text-blush/80">
                Встав посилання або код, яким поділилася Дарина з фінального екрану. Результати з цього пристрою підтягуються автоматично.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  rows={2}
                  placeholder="https://…/admin?r=…"
                  className="flex-1 resize-none rounded-2xl border border-cream/20 bg-bordeaux-deep/50 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
                />
                <Button full={false} variant="secondary" onClick={applyPasted} disabled={!pasted.trim()} className="sm:w-auto">
                  <ClipboardPaste size={16} /> Розпізнати
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-gold">{error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={loadFromSources} className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 text-xs">
                  <RefreshCw size={12} /> Перечитати з пристрою / посилання
                </button>
                {resultsUrl && (
                  <button onClick={fetchRemote} className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 text-xs">
                    <RefreshCw size={12} /> Оновити з сервера
                  </button>
                )}
              </div>
            </section>

            {remote && (
              <section className="rounded-3xl border border-cream/15 bg-cream/8 p-4 text-cream">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Результати з сервера</p>
                {remote.error && <p className="text-sm text-gold">{remote.error}</p>}
                {!remote.error && remote.items.length === 0 && <p className="text-sm text-blush/70">Поки порожньо.</p>}
                <div className="flex flex-col gap-2">
                  {remote.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setLoaded(item)}
                      className="flex items-center justify-between rounded-2xl border border-cream/15 px-3 py-2 text-left text-sm"
                    >
                      <span>{item.source}</span>
                      <span className="text-xs text-blush/70">{item.state.kisses ?? '—'} 💋</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {loaded ? (
              <Results loaded={loaded} />
            ) : (
              <p className="rounded-3xl border border-dashed border-cream/20 p-6 text-center text-sm text-blush/70">
                Результатів ще немає. Коли Дарина пройде гру і поділиться посиланням — відкрий його тут.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function isState(v: unknown): v is GameState {
  return Boolean(v && typeof v === 'object' && (v as { version?: unknown }).version === 1 && typeof (v as { step?: unknown }).step === 'number')
}
