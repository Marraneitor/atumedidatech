'use client';

import { usePrefs } from '@/lib/prefs';
import { Icon, Reveal } from './ui';
import { PageHead } from './ServiceList';
import { PromoBadge, Was } from './Promo';

/* Precios: una tabla corta (servicio, precio, cotizar), cómo trabajamos y preguntas frecuentes. */
export default function PriceList() {
  const { t, price, oldPrice, wa, f } = usePrefs();
  const p = t.pricing;
  const s = t.site.prices;

  return (
    <section id="precios" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <PageHead eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

        <ul className="mt-12 border-t border-line">
          {p.plans.map((plan, i) => {
            const value = plan.key ? price(plan.key) : p.quote;
            const extra = plan.extraKey ? f(plan.extra, { price: price(plan.extraKey) }) : plan.extra;
            return (
              <Reveal as="li" key={plan.name} delay={i * 0.03} className="grid gap-3 border-b border-line py-6 sm:grid-cols-12 sm:items-center sm:gap-6">
                <div className="sm:col-span-6">
                  <h2 className="font-display text-lg font-semibold tracking-[-0.012em]">{plan.name}</h2>
                  <p className="mt-1 max-w-[56ch] text-[15px] leading-relaxed text-pretty text-muted">{plan.desc}</p>
                </div>
                <div className="sm:col-span-4">
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    {plan.from && <span className="text-sm text-dim">{p.from}</span>}
                    <span className="font-display text-2xl font-bold tracking-[-0.012em] tabular-nums">{value}</span>
                    {plan.unit && <span className="text-sm text-dim">{plan.unit}</span>}
                  </p>
                  {plan.key && oldPrice(plan.key) && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <Was k={plan.key} />
                      <PromoBadge />
                    </p>
                  )}
                  {extra && <p className="mt-1 text-sm text-accent">{extra}{plan.extraKey && oldPrice(plan.extraKey) ? <Was k={plan.extraKey} className="ml-2" /> : null}</p>}
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <a
                    href={wa(f(t.wa.plan, { name: plan.name, price: [value, plan.unit, plan.key && oldPrice(plan.key) ? `(${t.promo.badge})` : ''].filter(Boolean).join(' ') }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    {s.ask}
                    <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </ul>
        <Reveal>
          <p className="mt-6 max-w-[70ch] text-sm text-dim">{p.pref} {p.note}</p>
        </Reveal>

        <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{s.gTitle}</h2>
            </Reveal>
            <ol className="mt-8 space-y-6">
              {s.guarantees.map((g, i) => (
                <Reveal as="li" key={g.t} delay={i * 0.05} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <Icon name="check" className="size-4" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{g.t}</p>
                    <p className="mt-0.5 text-[15px] text-muted">{g.d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{t.trust.faqTitle}</h2>
            </Reveal>
            <div className="mt-6 border-t border-line">
              {t.trust.faq.map((x) => (
                <details key={x.q} className="group border-b border-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {x.q}
                    <Icon name="arrow" className="size-4 shrink-0 rotate-90 text-dim transition-transform duration-200 group-open:-rotate-90" />
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-muted">{x.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
