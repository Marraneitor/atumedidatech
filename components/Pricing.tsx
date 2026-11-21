'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePrefs } from '@/lib/prefs';
import { DUR, EASE, Icon, Reveal, SectionHead, spotOff, useSpotlight } from './ui';

export default function Pricing() {
  const { t, price, wa, f, currency } = usePrefs();
  const p = t.pricing;
  const spot = useSpotlight<HTMLElement>();

  return (
    <section id="precios" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
        <div className="mt-16 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.plans.map((plan, i) => {
            const featured = i === 0;
            const priceText = plan.key ? price(plan.key) : p.quote;
            const extra = plan.extraKey ? f(plan.extra, { price: price(plan.extraKey) }) : '';
            return (
              <Reveal key={plan.name} delay={(i % 3) * 0.08} className={i === p.plans.length - 1 && p.plans.length % 3 === 1 ? 'md:col-span-2 lg:col-span-3' : ''}>
                <div
                  onPointerMove={spot}
                  onPointerLeave={spotOff}
                  className={`spotlight relative flex h-full flex-col rounded-[28px] p-7 sm:p-8 ${
                    featured
                      ? 'border border-accent/40 bg-accent/[.06] '
                      : 'surface'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-sky-300 to-accent-2 px-3 py-1 text-xs font-bold text-[#03111c]">{p.popular}</span>
                  )}
                  <h3 className="font-display text-xl font-bold tracking-[-0.012em]">{plan.name}</h3>
                  <p className="mt-2 min-h-[3rem] text-[15px] leading-relaxed text-muted">{plan.desc}</p>
                  <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {plan.from && <span className="text-sm text-muted">{p.from}</span>}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={currency + priceText}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: DUR.mid, ease: EASE }}
                        className={`font-display font-extrabold tracking-[-0.012em] tabular-nums ${featured ? 'text-gradient text-5xl' : plan.key ? 'text-4xl' : 'text-3xl'}`}
                      >
                        {priceText}
                      </motion.span>
                    </AnimatePresence>
                    {plan.unit && <span className="text-sm text-muted">{plan.unit}</span>}
                  </div>
                  {extra && <p className="mt-2 text-sm font-medium text-accent">{extra}</p>}
                  <ul className="mt-7 space-y-3 border-t border-line pt-7 text-[15px]">
                    {plan.f.map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${featured ? 'bg-accent text-bg' : 'bg-white/10 text-accent'}`}>
                          <Icon name="check" className="size-3" strokeWidth={2.6} />
                        </span>
                        <span className="text-ink/85">{x}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={wa(f(t.wa.plan, { name: plan.name, price: [priceText, plan.unit].filter(Boolean).join(' ') }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition ${
                      featured ? 'bg-ink text-bg hover:bg-white' : 'border border-line bg-white/[.04] hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                    <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <p className="mt-10 max-w-[65ch] text-[15px] text-muted">{p.pref}</p>
          <p className="mt-3 max-w-[65ch] text-sm text-dim">{p.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
