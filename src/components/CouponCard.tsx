import { Flower2, Heart } from 'lucide-react'
import type { Ref } from 'react'
import type { Coupon } from '../game/content'
import { PLAYER_NAME } from '../game/content'

export function couponSerial(coupon: Coupon, startedAt: string): string {
  const d = new Date(startedAt)
  const idx = ['hugs', 'surprise', 'wish'].indexOf(coupon.id) + 1
  return `DR-0${idx}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function CouponCard({ coupon, serial, ref }: { coupon: Coupon; serial: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="rounded-[28px] bg-gradient-to-br from-cherry to-bordeaux p-3">
      <div className="relative overflow-hidden rounded-[20px] border-2 border-gold bg-cream px-6 pb-6 pt-7 text-bordeaux">
        <div className="pointer-events-none absolute inset-2 rounded-[14px] border border-gold/60" />
        <Flower2 className="absolute -left-2 -top-2 text-blush" size={56} strokeWidth={1.2} />
        <Flower2 className="absolute -bottom-3 -right-3 text-blush" size={64} strokeWidth={1.2} />

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-cherry">Подарунковий сертифікат</p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-bordeaux/50">Операція: Романівна</p>

        <div className="mt-5 text-center text-5xl leading-none">{coupon.emoji}</div>
        <h3 className="font-display mt-4 text-center text-[22px] leading-tight font-semibold text-balance">{coupon.title}</h3>
        <p className="mt-2 text-center text-[14px] italic leading-snug text-cherry">{coupon.subtitle}</p>

        <div className="tear-line my-5" />

        <p className="text-center text-[12px] leading-relaxed text-bordeaux/70">{coupon.terms}</p>

        <div className="mt-5 flex items-end justify-between text-[11px]">
          <div>
            <p className="uppercase tracking-[0.15em] text-bordeaux/50">Для</p>
            <p className="font-display text-base font-semibold">{PLAYER_NAME}</p>
          </div>
          <div className="text-right">
            <p className="uppercase tracking-[0.15em] text-bordeaux/50">Від</p>
            <p className="font-semibold">організатора операції</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest text-bordeaux/50">№ {serial}</p>
          <div className="-rotate-6 rounded-md border-2 border-cherry px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cherry">
            дійсний безстроково
          </div>
        </div>

        <Heart className="absolute right-5 top-5 text-cherry" size={16} fill="currentColor" strokeWidth={0} />
      </div>
    </div>
  )
}
