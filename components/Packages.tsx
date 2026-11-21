'use client';

import { SITE } from '@/lib/config';
import { usePrefs } from '@/lib/prefs';
import { Icon, Reveal, SectionHead, WhatsAppIcon } from './ui';

const P = SITE.prices;
const sum = (keys: string[]) => keys.reduce((a, k) => a + (P[k] ?? 0), 0);

/* Paquetes para empezar: el precio es la suma de cada servicio (lib/config.ts). Nombres y textos en lib/i18n.ts. */
const BUNDLES = [
  { up: ['landing', 'chatbot'], mo: ['chatbot_month'] },
  { up: ['landing', 'chatbot'], mo: ['chatbot_month', 'social'] },
  { up: ['web_db', 'chatbot'], mo: ['chatbot_month', 'social', 'social_extra'] },
];
const BLOCK_ICONS = ['globe', 'users', 'chat', 'video', 'life'];

export default function Packages() {
  const { t, price, money, wa, f } = usePrefs();
  const p = t.plus;
  const month1 = P.plus + P.plus_month;
  const month1Ref = P.plus_ref + P.plus_month_ref;
  const yearSave = P.plus_ref + 12 * P.plus_month_ref - (P.plus + 12 * P.plus_month);

  return (
    <section id="paquetes" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

        {/* Tarjeta principal */}
        <Reveal className="mt-14">
          <article className="relative rounded-[28px] border border-accent/40 bg-accent/[.06] p-6 sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gradient-to-r from-sky-300 to-accent-2 px-3 py-1 text-xs font-bold tracking-[.08em] text-[#03111c] uppercase">{p.badge}</span>
              <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold tracking-[.08em] text-accent uppercase">{p.badge2}</span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.022em] sm:text-4xl">{p.name}</h3>
            <p className="mt-1 text-lg text-muted">{p.tagline}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <PriceBox label={p.setup} value={price('plus')} unit={p.setupUnit} refLabel={p.agency} refValue={price('plus_ref')} incl={p.setupIncl} />
              <PriceBox label={p.month} value={price('plus_month')} unit={p.monthUnit} refLabel={p.agency} refValue={`${price('plus_month_ref')} ${p.monthUnit}`} incl={p.monthIncl} />
            </div>

            <div className="mt-4 grid gap-4 rounded-2xl border border-line bg-bg/60 p-5 sm:p-6 lg:grid-cols-[1fr_1fr_1.3fr] lg:items-center">
              <div>
                <p className="text-sm text-dim">{p.compare} · {p.agency}</p>
                <p className="mt-1 font-display text-2xl font-bold text-muted tabular-nums line-through decoration-white/30">{money(month1Ref)}</p>
              </div>
              <div>
                <p className="text-sm text-dim">{p.compare} · {p.us}</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink tabular-nums">{money(month1)}</p>
              </div>
              <div className="border-t border-line pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                <p className="font-display text-xl font-bold tracking-[-0.012em] text-accent">{f(p.saving, { amount: money(yearSave) })}</p>
                <p className="mt-1 text-sm text-dim">{p.savingNote}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={wa(t.wa.plus)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold whitespace-nowrap text-bg transition hover:bg-white sm:gap-2.5 sm:px-7 sm:text-base"
              >
                <WhatsAppIcon className="size-5" />
                {p.cta}
                <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="/citas" className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-line bg-white/[.04] px-7 text-base font-semibold text-ink transition hover:bg-white/10">
                <Icon name="calendar" className="size-5 text-accent" />
                {p.book}
              </a>
            </div>
          </article>
        </Reveal>

        {/* Por qué cuesta menos */}
        <Reveal className="mt-16">
          <h3 className="max-w-[30ch] font-display text-2xl font-bold tracking-[-0.012em] text-balance sm:text-3xl">{p.whyTitle}</h3>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {p.why.map((w, i) => (
              <li key={w.t} className="bg-bg p-6">
                <span className="font-display text-sm font-bold text-accent tabular-nums">0{i + 1}</span>
                <p className="mt-3 font-display text-lg font-semibold tracking-[-0.012em]">{w.t}</p>
                <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-pretty text-muted">{w.d}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Qué incluye */}
        <div className="mt-16">
          <Reveal>
            <h3 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{p.incTitle}</h3>
          </Reveal>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {p.blocks.map((b, i) => (
              <Reveal key={b.t}>
                <div className="grid gap-5 py-8 lg:grid-cols-12 lg:gap-8">
                  <div className="flex items-start gap-4 lg:col-span-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[.04] text-accent">
                      <Icon name={BLOCK_ICONS[i] ?? 'check'} className="size-5" />
                    </span>
                    <h4 className="pt-2 font-display text-lg font-semibold tracking-[-0.012em] text-balance">{b.t}</h4>
                  </div>
                  <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
                    {b.items.map(([name, desc]) => (
                      <li key={name} className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-accent">
                          <Icon name="check" className="size-3" strokeWidth={2.6} />
                        </span>
                        <span>
                          <span className="block font-medium text-ink">{name}</span>
                          <span className="mt-1 block text-[15px] leading-relaxed text-pretty text-muted">{desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <ul className="mt-6 max-w-[80ch] space-y-1.5 text-sm text-dim">
              {p.fine.map((x) => (
                <li key={x}>* {x}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Paquetes para empezar */}
        <div className="mt-20">
          <Reveal>
            <h3 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{p.bundlesTitle}</h3>
            <p className="mt-3 max-w-[58ch] text-pretty text-muted">{p.bundlesSub}</p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {BUNDLES.map((b, i) => {
              const txt = p.bundles[i];
              if (!txt) return null;
              const up = money(sum(b.up));
              const mo = money(sum(b.mo));
              return (
                <Reveal key={txt.name} delay={i * 0.08}>
                  <div className="surface flex h-full flex-col rounded-[24px] p-6 sm:p-7">
                    <h4 className="font-display text-xl font-bold tracking-[-0.012em]">{txt.name}</h4>
                    <ul className="mt-4 space-y-2 text-[15px] text-ink/85">
                      {txt.items.map((x) => (
                        <li key={x} className="flex items-start gap-2.5">
                          <Icon name="check" className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.6} />
                          {x}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      <p className="text-sm text-dim">{p.upfront}</p>
                      <p className="font-display text-3xl font-extrabold tracking-[-0.012em] tabular-nums">{up}</p>
                      <p className="mt-1 text-sm font-medium text-accent">+ {mo} {p.monthly}</p>
                      <a
                        href={wa(f(t.wa.bundle, { name: txt.name, price: `${up} + ${mo} ${p.monthly}` }))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-white/[.04] text-[15px] font-semibold transition hover:bg-white/10"
                      >
                        {p.bundleCta}
                        <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceBox({ label, value, unit, refLabel, refValue, incl }: { label: string; value: string; unit: string; refLabel: string; refValue: string; incl: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-5 sm:p-6">
      <p className="text-sm font-medium tracking-[.08em] text-dim uppercase">{label}</p>
      <p className="mt-3 text-sm text-dim">
        {refLabel}: <span className="line-through decoration-white/30">{refValue}</span>
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-gradient font-display text-4xl font-extrabold tracking-[-0.012em] tabular-nums sm:text-5xl">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </p>
      <p className="mt-3 text-[15px] text-pretty text-muted">{incl}</p>
    </div>
  );
}
