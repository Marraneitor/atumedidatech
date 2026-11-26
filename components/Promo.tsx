'use client';

import { promoOn, SITE } from '@/lib/config';
import { usePrefs } from '@/lib/prefs';

const LOCALES = { es: 'es-MX', en: 'en-US', pt: 'pt-BR' } as const;

/* Promoción de Fin de año (lib/config.ts → SITE.promo). Etiqueta y precio anterior tachado. */
export function PromoBadge({ withDate = false, className = '' }: { withDate?: boolean; className?: string }) {
  const { t, f, lang } = usePrefs();
  if (!promoOn()) return null;
  const date = new Date(`${SITE.promo.until}T12:00:00-06:00`).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long' });
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-[.08em] whitespace-nowrap text-[#03111c] uppercase">{t.promo.badge}</span>
      {withDate && <span className="text-xs font-medium text-accent">{f(t.promo.until, { date })}</span>}
    </span>
  );
}

export function Was({ k, className = '' }: { k: string; className?: string }) {
  const { t, oldPrice } = usePrefs();
  const old = oldPrice(k);
  if (!old) return null;
  return (
    <s className={`text-dim tabular-nums decoration-1 ${className}`}>
      <span className="sr-only">{t.promo.before} </span>
      {old}
    </s>
  );
}
