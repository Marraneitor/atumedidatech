'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { PROJECTS, type Project } from '@/lib/projects';
import { EASE, Icon, Laptop, Phone, Reveal, SectionHead, spotOff, useSpotlight } from './ui';

const SHOWCASE = ['srsburger', 'denti7', 'hotelmadrid', 'gestia'];
const PAGE = 6;
type Filter = 'all' | Project['cat'];

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function Showcase({ p, wide, delay }: { p: Project; wide: boolean; delay: number }) {
  const { t, lang } = usePrefs();
  const spot = useSpotlight<HTMLElement>();
  return (
    <Reveal as="article" delay={delay} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={spot}
        onPointerLeave={spotOff}
        className="spotlight surface group flex h-full flex-col overflow-hidden rounded-[28px]"
      >
        <div className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,rgba(56,189,248,.16),transparent_60%)] px-[9%] pt-10 pb-8 sm:pt-14">
          <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full border border-wa/25 bg-wa/10 px-2.5 py-1 font-mono text-[10px] tracking-[.08em] text-wa uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-wa" />
            {t.work.live}
          </span>
          <div className="relative transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:scale-[1.02]">
            <Laptop src={`/assets/img/projects/${p.id}.webp`} alt={p.name} className={wide ? 'mr-[14%]' : 'mr-[18%]'} />
            {p.mobile && (
              <div className={`absolute right-[-2%] bottom-[-4%] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-3 group-hover:rotate-[-2deg] ${wide ? 'w-[22%]' : 'w-[26%]'}`}>
                <Phone src={`/assets/img/mobile/${p.id}.webp`} alt="" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 border-t border-line p-6 sm:p-7">
          <span className="font-mono text-[11px] tracking-[.08em] text-accent uppercase">{p.type[lang]}</span>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl font-bold tracking-tight">{p.name}</h3>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
              <Icon name="arrowUpRight" className="size-4" />
            </span>
          </div>
          <p className="leading-relaxed text-muted">{p.desc[lang]}</p>
          <span className="mt-auto pt-3 font-mono text-xs text-dim">{host(p.url)}</span>
        </div>
      </a>
    </Reveal>
  );
}

function Tile({ p }: { p: Project }) {
  const { lang, t } = usePrefs();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <a href={p.url} target="_blank" rel="noopener noreferrer" className="group surface flex h-full flex-col overflow-hidden rounded-3xl transition-colors hover:border-white/20">
        <div className="relative overflow-hidden">
          <div className="flex h-7 items-center gap-1.5 border-b border-line bg-[#0e121c] px-3.5">
            <span className="size-2 rounded-full bg-white/15" /><span className="size-2 rounded-full bg-white/15" /><span className="size-2 rounded-full bg-white/15" />
            <span className="ml-2 truncate font-mono text-[10px] text-dim">{host(p.url)}</span>
          </div>
          <div className="aspect-[16/10] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/img/projects/${p.id}.webp`}
              alt={p.name}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
            />
          </div>
          <span className="absolute right-3 bottom-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-bg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {t.work.visit}
            <Icon name="arrowUpRight" className="size-3.5" />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <span className="font-mono text-[10.5px] tracking-[.08em] text-accent uppercase">{p.type[lang]}</span>
          <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight">{p.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{p.desc[lang]}</p>
        </div>
      </a>
    </motion.li>
  );
}

export default function Portfolio() {
  const { t, f } = usePrefs();
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState(false);

  const showcase = SHOWCASE.map((id) => PROJECTS.find((p) => p.id === id)!).filter(Boolean);
  const rest = useMemo(() => PROJECTS.filter((p) => !SHOWCASE.includes(p.id)), []);
  const list = rest.filter((p) => filter === 'all' || p.cat === filter);
  const visible = expanded ? list : list.slice(0, PAGE);
  const count = (c: Filter) => rest.filter((p) => c === 'all' || p.cat === c).length;
  const filters: Filter[] = ['all', 'web', 'system', 'ai'];

  return (
    <section id="portafolio" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={t.work.eyebrow} title={t.work.title} sub={t.work.sub} />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {showcase.map((p, i) => (
            <Showcase key={p.id} p={p} wide={i === 0 || i === 3} delay={(i % 2) * 0.08} />
          ))}
        </div>

        <Reveal className="mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t.work.others}</h3>
          <div role="group" aria-label={t.work.eyebrow} className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="surface flex gap-1 rounded-full p-1">
              {filters.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  onClick={() => { setFilter(c); setExpanded(false); }}
                  className={`relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'text-bg' : 'text-muted hover:text-ink'}`}
                >
                  {filter === c && <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  {t.work[c]}
                  <span className={`text-xs tabular-nums ${filter === c ? 'text-bg/60' : 'text-dim'}`}>{count(c)}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <motion.ul layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <Tile key={p.id} p={p} />
            ))}
          </AnimatePresence>
        </motion.ul>

        {list.length > PAGE && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="surface inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition hover:bg-white/10"
            >
              {expanded ? t.work.less : f(t.work.more, { n: list.length })}
              <Icon name="arrow" className={`size-4 transition-transform duration-300 ${expanded ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
