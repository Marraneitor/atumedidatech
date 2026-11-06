'use client';

import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { AI_MODELS, PROJECTS, SECTIONS, type AiModel, type Project, type SectionId } from '@/lib/projects';
import { Icon, Laptop, Phone, Reveal, SectionHead } from './ui';

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const byId = (id: string) => PROJECTS.find((p) => p.id === id);

/* ---------- Tarjetas ---------- */
function ProjectCard({ p }: { p: Project }) {
  const { lang, t } = usePrefs();
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group surface flex h-full flex-col overflow-hidden rounded-3xl focus-visible:outline-offset-[-2px] transition-colors duration-300 hover:border-white/20"
    >
      <div className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,rgba(56,189,248,.14),transparent_62%)] px-[8%] pt-8 pb-6">
        <div className="relative transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1.5">
          <Laptop src={`/assets/img/projects/${p.id}.webp`} alt={p.name} className={p.mobile ? 'mr-[16%]' : 'mx-[4%]'} />
          {p.mobile && (
            <div className="absolute right-[-3%] bottom-[-6%] w-[25%] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2.5">
              <Phone src={`/assets/img/mobile/${p.id}.webp`} alt="" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-5 sm:p-6">
        <span className="text-[11px] font-medium tracking-[.08em] text-accent uppercase">{p.type[lang]}</span>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-xl font-bold tracking-[-0.012em]">{p.name}</h4>
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
            <Icon name="arrowUpRight" className="size-4" />
            <span className="sr-only">{t.work.visit}</span>
          </span>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{p.desc[lang]}</p>
        <span className="mt-auto truncate pt-3 text-xs text-dim">{host(p.url)}</span>
      </div>
    </a>
  );
}

function ModelCard({ m }: { m: AiModel }) {
  const { lang, t } = usePrefs();
  return (
    <figure className="group surface relative aspect-[3/4] overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/assets/img/modelos/${m.id}.webp`}
        alt={`${t.work.aiTag}: ${m.name}`}
        width={900}
        height={1200}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-16">
        <span className="text-[11px] font-medium tracking-[.08em] text-accent uppercase">{t.work.aiTag}</span>
        <span className="font-display text-lg font-bold">{m.name}</span>
        <span className="text-sm text-white/75">{m.use[lang]}</span>
      </figcaption>
    </figure>
  );
}

/* ---------- Carrusel: scroll nativo con imán (táctil y trackpad), flechas y progreso ---------- */
function Carousel({ id, label, children, count, wide }: { id: string; label: string; children: React.ReactNode[]; count: string; wide: boolean }) {
  const { t } = usePrefs();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = max > 0 ? el.scrollLeft / max : 1;
    const shown = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    if (bar.current) {
      // la barra mide lo visible y avanza con el scroll (solo transform)
      bar.current.style.transform = `translateX(${pos * (1 / shown - 1) * 100}%)`;
      bar.current.style.width = `${Math.min(shown, 1) * 100}%`;
    }
    const start = el.scrollLeft < 8;
    const end = el.scrollLeft > max - 8;
    setEdge((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [sync]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const step = item ? item.offsetWidth + gap : el.clientWidth;
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / step));
    el.scrollBy({ left: dir * step * perView, behavior: reduce ? 'auto' : 'smooth' });
  };

  const fits = edge.start && edge.end;
  const itemW = wide
    ? 'w-[84%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]'
    : 'w-[66%] sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]';

  return (
    <div>
      <ul
        id={id}
        ref={ref}
        aria-label={label}
        className="no-scrollbar -mx-5 flex [contain:paint] snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto overscroll-x-contain px-5 pt-1 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {children.map((c, i) => (
          <li key={i} className={`shrink-0 snap-start ${itemW}`}>
            {c}
          </li>
        ))}
      </ul>

      <div className={`mt-5 flex items-center gap-4 ${fits ? 'lg:hidden' : ''}`}>
        <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <span ref={bar} className="absolute inset-y-0 left-0 rounded-full bg-accent transition-transform duration-150 ease-out" />
        </div>
        <span className="text-xs whitespace-nowrap text-dim tabular-nums">{count}</span>
        <div className="flex gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              disabled={d === -1 ? edge.start : edge.end}
              aria-controls={id}
              aria-label={d === -1 ? t.work.prev : t.work.next}
              className="grid size-11 place-items-center rounded-full border border-white/15 text-ink transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-bg disabled:pointer-events-none disabled:opacity-35"
            >
              <Icon name="arrow" className={`size-4 ${d === -1 ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Fila por sección ---------- */
function SectionRow({ id, n }: { id: SectionId; n: number }) {
  const { t, f } = usePrefs();
  const s = t.work.sections[id];
  const isAi = id === 'ai';
  const items = isAi ? [] : (SECTIONS.find((x) => x.id === id)?.ids ?? []).map(byId).filter((p): p is Project => !!p);
  const total = isAi ? AI_MODELS.length : items.length;

  return (
    <Reveal as="article" id={`work-${id}`} className="scroll-mt-24 border-t border-line pt-10 sm:pt-12" aria-labelledby={`work-${id}-title`}>
      <div className="mb-7 grid gap-3 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="text-xs font-medium text-accent tabular-nums">{String(n).padStart(2, '0')}</span>
          <h3 id={`work-${id}-title`} className="mt-2 font-display text-2xl font-bold tracking-[-0.012em] sm:text-[2rem]">
            {s.t}
          </h3>
        </div>
        <p className="max-w-[58ch] text-pretty leading-relaxed text-muted lg:col-span-5">{s.d}</p>
      </div>
      <Carousel
        id={`work-${id}-list`}
        label={s.t}
        wide={!isAi}
        count={f(isAi ? t.work.modelsCount : t.work.count, { n: total })}
      >
        {isAi ? AI_MODELS.map((m) => <ModelCard key={m.id} m={m} />) : items.map((p) => <ProjectCard key={p.id} p={p} />)}
      </Carousel>
    </Reveal>
  );
}

export default function Portfolio() {
  const { t } = usePrefs();
  // la sección de modelos IA va primero y solo aparece cuando tiene fotos
  const rows = SECTIONS.filter((s) => (s.id === 'ai' ? AI_MODELS.length > 0 : s.ids.length > 0));

  return (
    <section id="portafolio" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={t.work.eyebrow} title={t.work.title} sub={t.work.sub} />

        <Reveal delay={0.1}>
          <nav aria-label={t.work.eyebrow} className="no-scrollbar -mx-5 mt-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ol className="flex gap-2 sm:flex-wrap">
              {rows.map((r, i) => (
                <li key={r.id}>
                  <a
                    href={`#work-${r.id}`}
                    className="surface inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-200 hover:border-white/20 hover:text-ink"
                  >
                    <span className="text-xs text-accent tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    {t.work.sections[r.id].t}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        <div className="mt-14 flex flex-col gap-16 sm:gap-20">
          {rows.map((r, i) => (
            <SectionRow key={r.id} id={r.id} n={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
