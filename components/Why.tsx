'use client';

import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { PROJECTS } from '@/lib/projects';
import { EASE, Icon, Reveal, SectionHead } from './ui';

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setV(to); return; }
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

export function Marquee() {
  const { t } = usePrefs();
  const names = PROJECTS.map((p) => p.name.split(' · ')[0]);
  const row = [...names, ...names];
  return (
    <section aria-label={t.clients} className="relative border-y border-line bg-bg-2/60 py-9">
      <p className="mb-6 text-center font-mono text-[11px] tracking-[.08em] text-dim uppercase">{t.clients}</p>
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
          {row.map((n, i) => (
            <span key={i} aria-hidden={i >= names.length} className="flex items-center gap-12 font-display text-xl font-semibold whitespace-nowrap text-white/55 transition-colors hover:text-white sm:text-2xl">
              {n}
              <span className="size-1.5 rounded-full bg-accent/50" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const GUARANTEE_ICONS = ['bolt', 'phone', 'cog', 'shield'] as const;

export default function Why() {
  const { t } = usePrefs();
  const w = t.why;
  const items = [
    { k: 'fast', icon: 'bolt', ...w.fast },
    { k: 'ux', icon: 'cursor', ...w.ux },
    { k: 'ai', icon: 'spark', ...w.ai },
    { k: 'support', icon: 'life', ...w.support },
  ];
  return (
    <section id="nosotros" className="relative py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        {/* Columna fija: la idea y las cifras */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHead eyebrow={w.eyebrow} title={w.title} sub={w.sub} />
            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line"
            >
              {w.stats.map((s, i) => (
                <div key={i} className="flex flex-col gap-1 bg-bg-2 p-5 sm:p-6">
                  <dt className="text-sm leading-snug text-muted">{s.l}</dt>
                  <dd className="order-first font-display text-4xl font-extrabold tracking-[-0.012em] text-ink">
                    <Counter to={s.v} suffix={s.s} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>

        {/* Lista numerada: cuatro razones, sin tarjetas repetidas */}
        <ol className="lg:col-span-7 lg:pt-2">
          {items.map((it, i) => (
            <Reveal as="li" key={it.k} delay={i * 0.05} className="group grid grid-cols-[auto_1fr] gap-x-6 border-t border-line py-8 first:border-t-0 first:pt-0 sm:gap-x-10 sm:py-10 lg:first:pt-0">
              <span className="font-display text-sm font-semibold text-dim tabular-nums transition-colors duration-200 group-hover:text-accent">
                0{i + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-3 font-display text-2xl font-bold tracking-[-0.012em] sm:text-[1.75rem]">
                  <Icon name={it.icon} className="size-5 shrink-0 text-accent" />
                  {it.t}
                </h3>
                <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Barra de garantías: promesas concretas, sin frases corporativas */}
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:mt-20 sm:px-8">
        <Reveal>
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-accent/25 bg-accent/15 sm:grid-cols-2 lg:grid-cols-4">
            {w.guarantees.map((g, i) => (
              <li key={g} className="flex items-center gap-3 bg-bg-2 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name={GUARANTEE_ICONS[i]} className="size-5" />
                </span>
                <span className="font-display text-base font-semibold tracking-[-0.012em] text-ink">{g}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
