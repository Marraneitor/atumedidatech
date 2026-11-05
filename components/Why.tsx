'use client';

import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { PROJECTS } from '@/lib/projects';
import { EASE, Icon, Reveal, SectionHead, spotOff, useSpotlight } from './ui';

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
      <p className="mb-6 text-center font-mono text-[11px] tracking-[.22em] text-dim uppercase">{t.clients}</p>
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
          {row.map((n, i) => (
            <span key={i} aria-hidden={i >= names.length} className="flex items-center gap-12 font-display text-xl font-semibold whitespace-nowrap text-white/35 transition-colors hover:text-white/80 sm:text-2xl">
              {n}
              <span className="size-1.5 rounded-full bg-accent/50" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Why() {
  const { t } = usePrefs();
  const w = t.why;
  const spot = useSpotlight<HTMLElement>();
  const items = [
    { k: 'fast', icon: 'bolt', ...w.fast },
    { k: 'ux', icon: 'cursor', ...w.ux },
    { k: 'ai', icon: 'spark', ...w.ai },
    { k: 'support', icon: 'life', ...w.support },
  ];
  return (
    <section id="nosotros" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent-2/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={w.eyebrow} title={w.title} sub={w.sub} center />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.k} delay={i * 0.08}>
              <div onPointerMove={spot} onPointerLeave={spotOff} className="spotlight glass group h-full rounded-3xl p-7">
                <div className="relative grid size-14 place-items-center">
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/25 to-accent-2/10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6" />
                  <span className="absolute inset-0 rounded-2xl border border-accent/25" />
                  <Icon name={it.icon} className="relative size-6 text-accent" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight">{it.t}</h3>
                <p className="mt-2.5 leading-relaxed text-muted">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4"
        >
          {w.stats.map((s, i) => (
            <div key={i} className="bg-[#0a0e18] p-6 text-center sm:p-8">
              <dt className="sr-only">{s.l}</dt>
              <dd className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-gradient">
                  <Counter to={s.v} suffix={s.s} />
                </span>
              </dd>
              <dd className="mt-2 text-sm text-muted">{s.l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
