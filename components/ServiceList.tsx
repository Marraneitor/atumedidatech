'use client';

import { usePrefs } from '@/lib/prefs';
import { Icon, Reveal } from './ui';
import { Was } from './Promo';

/* Servicios: una línea por servicio con su precio de entrada, y el proceso en tres pasos. */
export default function ServiceList() {
  const { t, price } = usePrefs();
  const s = t.site.services;

  return (
    <section id="soluciones" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <PageHead eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

        <ul className="mt-12 border-t border-line">
          {s.items.map((x, i) => (
            <Reveal as="li" key={x.t} delay={i * 0.03} className="grid gap-2 border-b border-line py-6 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-7">
              <h3 className="font-display text-xl font-semibold tracking-[-0.012em] sm:col-span-4">{x.t}</h3>
              <p className="text-[15px] leading-relaxed text-pretty text-muted sm:col-span-5">{x.d}</p>
              <p className="text-sm text-dim sm:col-span-3 sm:text-right">
                {x.key ? (
                  <>
                    {s.from} <Was k={x.key} className="mr-1" /> <span className="font-semibold text-ink tabular-nums">{price(x.key)}</span> {x.unit}
                  </>
                ) : (
                  s.quote
                )}
              </p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{s.stepsTitle}</h2>
          </Reveal>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {s.steps.map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 0.06}>
                <span className="grid size-9 place-items-center rounded-full border border-line text-sm font-semibold text-accent tabular-nums">{i + 1}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.012em]">{x.t}</h3>
                <p className="mt-1.5 max-w-[38ch] text-[15px] leading-relaxed text-pretty text-muted">{x.d}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-10">
            <a href="#precios" className="group inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 font-semibold text-ink transition hover:bg-white/[.06]">
              {s.prices}
              <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="max-w-3xl">
      <p className="text-sm font-medium text-accent">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.06] font-bold tracking-[-0.022em] text-balance sm:text-5xl">{title}</h1>
      {sub && <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-pretty text-muted">{sub}</p>}
    </Reveal>
  );
}
