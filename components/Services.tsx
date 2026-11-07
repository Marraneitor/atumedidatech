'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useId, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { DUR, EASE, Icon, Reveal, SectionHead, WhatsAppIcon, spotOff, useSpotlight } from './ui';

/* Arquitectura de marca: dos pilares bajo el mismo sistema visual */
type Key = 'web' | 'video' | 'smart' | 'pos' | 'crm';
const PILLARS: { icon: string; items: { k: Key; icon: string }[] }[] = [
  { icon: 'megaphone', items: [{ k: 'web', icon: 'globe' }, { k: 'video', icon: 'video' }, { k: 'smart', icon: 'qr' }] },
  { icon: 'chart', items: [{ k: 'pos', icon: 'receipt' }, { k: 'crm', icon: 'users' }] },
];

function ServiceCard({ k, icon }: { k: Key; icon: string }) {
  const { t, wa, f } = usePrefs();
  const s = t.services.items[k];
  const spot = useSpotlight<HTMLElement>();
  return (
    /* Borde con degradado de marca: solo en las tarjetas principales */
    <article className="rounded-[28px] bg-gradient-to-b from-accent/45 via-white/10 to-white/[.06] p-px">
      <div onPointerMove={spot} onPointerLeave={spotOff} className="spotlight flex h-full flex-col rounded-[27px] bg-bg-2 p-6 sm:p-7">
        <span className="grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <Icon name={icon} className="size-6" />
        </span>
        <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.012em] sm:text-2xl">{s.t}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted text-pretty">{s.p}</p>
        <ul className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
          {s.b.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-accent">
                <Icon name="check" className="size-3" strokeWidth={2.6} />
              </span>
              <span className="text-ink/90">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-8">
          <a
            href={wa(f(t.wa.service, { name: s.t }))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-[#03111c] transition hover:bg-sky-300"
          >
            <WhatsAppIcon className="size-4" />
            {t.services.quote}
          </a>
          <a
            href="#portafolio"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white/[.04] px-5 text-[15px] font-semibold transition hover:bg-white/10"
          >
            {t.services.how}
            <Icon name="arrow" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* Ayuda rápida contra la parálisis por decisión: giro → recomendación → WhatsApp */
function Finder() {
  const { t, wa, f } = usePrefs();
  const fd = t.finder;
  const [pick, setPick] = useState<number | null>(null);
  const g = pick !== null ? fd.giros[pick] : null;
  return (
    <div className="surface mt-6 rounded-[28px] p-6 sm:mt-8 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <div>
          <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Icon name="compass" className="size-5" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.012em] text-balance sm:text-3xl">{fd.title}</h3>
          <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-muted text-pretty">{fd.sub}</p>
        </div>
        <div>
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-ink/90">{fd.q}</legend>
            <div className="flex flex-wrap gap-2">
              {fd.giros.map((x, i) => (
                <button
                  key={x.g}
                  type="button"
                  aria-pressed={pick === i}
                  onClick={() => setPick(i)}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${
                    pick === i ? 'border-accent bg-accent/15 text-ink' : 'border-white/20 bg-white/[.03] text-muted hover:border-white/35 hover:text-ink'
                  }`}
                >
                  {pick === i && <Icon name="check" className="size-3.5 text-accent" />}
                  {x.g}
                </button>
              ))}
            </div>
          </fieldset>
          <div aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {g && (
                <motion.div
                  key={pick}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: DUR.mid, ease: EASE }}
                  className="mt-6 rounded-2xl border border-accent/30 bg-accent/[.06] p-5"
                >
                  <p className="text-xs font-medium tracking-[.08em] text-accent uppercase">{fd.rec}</p>
                  <p className="mt-2 font-display text-xl font-bold tracking-[-0.012em]">{g.r}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{g.d}</p>
                  <a
                    href={wa(f(t.wa.finder, { giro: g.g, rec: g.r }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-wa px-5 py-3 text-center text-[15px] font-semibold text-[#03200f] transition hover:brightness-105 sm:w-auto"
                  >
                    <WhatsAppIcon className="size-4 shrink-0" />
                    {fd.cta}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const { t } = usePrefs();
  const s = t.services;
  const [tab, setTab] = useState(0);
  const uid = useId();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Flechas izquierda/derecha entre pestañas (patrón ARIA de pestañas)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (tab + (e.key === 'ArrowRight' ? 1 : -1) + PILLARS.length) % PILLARS.length;
    setTab(next);
    tabsRef.current[next]?.focus();
  };

  const pillar = PILLARS[tab];
  const info = s.pillars[tab];

  return (
    <section id="soluciones" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

        <Reveal delay={0.08}>
          <div role="tablist" aria-label={s.eyebrow} onKeyDown={onKey} className="surface mt-10 grid grid-cols-2 gap-1 rounded-2xl p-1 sm:mt-14 sm:inline-grid sm:rounded-full">
            {s.pillars.map((p, i) => (
              <button
                key={p.tab}
                ref={(el) => { tabsRef.current[i] = el; }}
                id={`${uid}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={tab === i}
                aria-controls={`${uid}-panel`}
                tabIndex={tab === i ? 0 : -1}
                onClick={() => setTab(i)}
                className={`relative isolate flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-center text-sm font-semibold transition-colors sm:rounded-full sm:px-6 sm:text-[15px] ${
                  tab === i ? 'text-[#03111c]' : 'text-muted hover:text-ink'
                }`}
              >
                {tab === i && (
                  <motion.span layoutId="pillar-pill" className="absolute inset-0 -z-10 rounded-xl bg-accent sm:rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <Icon name={PILLARS[i].icon} className="hidden size-4 shrink-0 sm:block" />
                <span className="relative">{p.tab}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${tab}`} className="mt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: DUR.slow, ease: EASE }}
            >
              <p className="text-xs font-medium tracking-[.08em] text-accent uppercase">{info.label}</p>
              <p className="mt-2 max-w-[58ch] text-lg leading-relaxed text-ink/90 text-pretty">{info.desc}</p>
              <div className={`mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 ${pillar.items.length === 3 ? 'lg:grid-cols-3' : ''}`}>
                {pillar.items.map((it) => (
                  <ServiceCard key={it.k} k={it.k} icon={it.icon} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal>
          <Finder />
        </Reveal>
      </div>
    </section>
  );
}
