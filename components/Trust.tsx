'use client';

import { usePrefs } from '@/lib/prefs';
import { Icon, Reveal, SectionHead } from './ui';

/* Confianza: por qué el precio es bajo, garantías por escrito y preguntas frecuentes */
const REASON_ICONS = ['spark', 'code', 'users'] as const;
const GUARANTEE_ICONS = ['receipt', 'shield', 'calendar', 'mail', 'globe'] as const;

export default function Trust() {
  const { t } = usePrefs();
  const tr = t.trust;
  return (
    <section id="garantias" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={tr.eyebrow} title={tr.title} sub={tr.sub} />

        <ol className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-5">
          {tr.reasons.map((r, i) => (
            <Reveal as="li" key={r.t} delay={i * 0.06} className="surface rounded-[28px] p-6 sm:p-7">
              <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <Icon name={REASON_ICONS[i]} className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.012em]">{r.t}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{r.d}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{tr.gTitle}</h3>
            </Reveal>
            <ul className="mt-6 overflow-hidden rounded-[28px] border border-accent/25">
              {tr.guarantees.map((g, i) => (
                <Reveal as="li" key={g.t} delay={i * 0.04} className="flex gap-4 border-t border-line bg-bg-2 p-5 first:border-t-0 sm:p-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name={GUARANTEE_ICONS[i]} className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-base font-semibold tracking-[-0.012em] text-ink sm:text-lg">{g.t}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{g.d}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <h3 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{tr.faqTitle}</h3>
            </Reveal>
            <div className="mt-6 space-y-3">
              {tr.faq.map((x, i) => (
                <Reveal key={x.q} delay={i * 0.04}>
                  <details className="group surface rounded-2xl">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {x.q}
                      <Icon name="arrow" className="size-4 shrink-0 rotate-90 text-dim transition-transform duration-200 group-open:-rotate-90" />
                    </summary>
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted">{x.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
