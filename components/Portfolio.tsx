'use client';

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { AI_MODELS, PROJECTS, SECTIONS, type AiModel, type Project, type SectionId } from '@/lib/projects';
import { DUR, EASE, Icon, Laptop, Phone, Reveal, SectionHead } from './ui';

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
      draggable={false}
      className="group surface flex h-full flex-col overflow-hidden rounded-3xl transition-colors duration-300 hover:border-white/20 focus-visible:outline-offset-[-2px]"
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
        draggable={false}
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

/* ---------- Carrusel infinito: se arrastra con el mouse o con el dedo ----------
   Las tarjetas se repiten en copias y la posición se "envuelve", así nunca hay final.
   Solo la copia 1 recibe foco con Tab; las demás son repeticiones (aria-hidden). */
const FRICTION = 0.94; // por frame de 16 ms: cuánto sigue deslizando al soltar

function Carousel({ label, items, wide, alignId }: { label: string; items: React.ReactNode[]; wide: boolean; alignId: string }) {
  const reduce = useReducedMotion();
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const S = useRef(0); // ancho de una copia
  const pad = useRef(0); // margen izquierdo, alineado con el título
  const [copies, setCopies] = useState(3);
  const x = useMotionValue(0);
  const tx = useTransform(x, (v) => {
    const s = S.current;
    if (!s) return v;
    const lo = pad.current - 2 * s;
    return lo + ((((v - lo) % s) + s) % s);
  });
  const n = items.length;

  // medir el ancho de una copia, cuántas copias llenan la pantalla y el margen
  useEffect(() => {
    const el = view.current;
    const tr = track.current;
    if (!el || !tr) return;
    const measure = () => {
      const lis = tr.children;
      if (lis.length < n * 2) return;
      const s = (lis[n] as HTMLElement).offsetLeft - (lis[0] as HTMLElement).offsetLeft;
      if (!s) return;
      const title = document.getElementById(alignId);
      pad.current = title ? title.getBoundingClientRect().left - el.getBoundingClientRect().left : 20;
      const changed = s !== S.current;
      S.current = s;
      setCopies(Math.max(3, Math.ceil(el.clientWidth / s) + 2));
      if (changed) x.set(pad.current - s);
      else x.set(x.get() + 0.001); // recalcula con el margen nuevo
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n, alignId, x]);

  // las copias se pueden tocar (abren el proyecto) pero no reciben foco con Tab
  useEffect(() => {
    track.current?.querySelectorAll<HTMLElement>('[data-copy] a, [data-copy] button').forEach((el) => (el.tabIndex = -1));
  }, [copies, n]);

  // arrastre con inercia, rueda horizontal del trackpad y clic bloqueado tras arrastrar
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    let pid: number | null = null;
    let sx = 0;
    let sy = 0;
    let x0 = 0;
    let dragging = false;
    let moved = false;
    let samples: { t: number; x: number }[] = [];
    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);

    const glide = (v: number) => {
      if (reduce) return;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(now - last, 40);
        last = now;
        x.set(x.get() + v * dt);
        v *= Math.pow(FRICTION, dt / 16.67);
        if (Math.abs(v) > 0.01) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      stop();
      pid = e.pointerId;
      sx = e.clientX;
      sy = e.clientY;
      x0 = x.get();
      dragging = false;
      moved = false;
      samples = [{ t: e.timeStamp, x: e.clientX }];
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      const dx = e.clientX - sx;
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
        dragging = true;
        moved = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = '';
      }
      x.set(x0 + dx);
      samples.push({ t: e.timeStamp, x: e.clientX });
      if (samples.length > 6) samples.shift();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      pid = null;
      delete el.dataset.dragging;
      if (!dragging) return;
      dragging = false;
      const a = samples[0];
      const b = samples[samples.length - 1];
      const dt = b.t - a.t;
      if (e.type === 'pointerup' && dt > 0 && e.timeStamp - b.t < 80) glide((b.x - a.x) / dt);
    };
    const click = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      stop();
      x.set(x.get() - e.deltaX);
    };
    const noDrag = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('dragstart', noDrag);
    return () => {
      stop();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('dragstart', noDrag);
    };
  }, [reduce, x]);

  // con teclado: la tarjeta enfocada se acomoda en la vista
  const onFocus = (e: React.FocusEvent) => {
    const li = (e.target as HTMLElement).closest('li');
    if (!li || !S.current) return;
    const delta = pad.current - li.offsetLeft - tx.get();
    if (Math.abs(delta) < 1) return;
    if (reduce) x.set(x.get() + delta);
    else animate(x, x.get() + delta, { duration: DUR.slow, ease: EASE });
  };

  const itemW = wide ? 'w-[min(84vw,300px)] sm:w-[360px] lg:w-[400px]' : 'w-[min(64vw,240px)] sm:w-[280px]';

  return (
    <div
      ref={view}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      onFocus={onFocus}
      className="cursor-grab [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] touch-pan-y overflow-hidden py-1 select-none [contain:paint] data-[dragging]:cursor-grabbing [&_a]:cursor-[inherit]"
    >
      <motion.ul ref={track} style={{ x: tx }} className="flex w-max gap-5 will-change-transform">
        {Array.from({ length: copies }, (_, c) =>
          items.map((it, i) => (
            <li key={`${c}-${i}`} className={`shrink-0 ${itemW}`} aria-hidden={c !== 1 || undefined} data-copy={c !== 1 ? '' : undefined}>
              {it}
            </li>
          )),
        )}
      </motion.ul>
    </div>
  );
}

/* ---------- Fila por sección ---------- */
function SectionRow({ id, n }: { id: SectionId; n: number }) {
  const { t } = usePrefs();
  const s = t.work.sections[id];
  const isAi = id === 'ai';
  const items = isAi ? [] : (SECTIONS.find((x) => x.id === id)?.ids ?? []).map(byId).filter((p): p is Project => !!p);

  return (
    <Reveal as="article" id={`work-${id}`} className="scroll-mt-24" aria-labelledby={`work-${id}-title`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-7 grid gap-3 border-t border-line pt-10 sm:pt-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="text-xs font-medium text-accent tabular-nums">{String(n).padStart(2, '0')}</span>
            <h3 id={`work-${id}-title`} className="mt-2 font-display text-2xl font-bold tracking-[-0.012em] sm:text-[2rem]">
              {s.t}
            </h3>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-5">
            <p className="max-w-[58ch] leading-relaxed text-pretty text-muted">{s.d}</p>
            <span aria-hidden className="inline-flex items-center gap-2 text-xs text-dim">
              <Icon name="arrow" className="size-3.5 rotate-180" />
              {t.work.drag}
              <Icon name="arrow" className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
      <Carousel
        label={s.t}
        wide={!isAi}
        alignId={`work-${id}-title`}
        items={isAi ? AI_MODELS.map((m) => <ModelCard key={m.id} m={m} />) : items.map((p) => <ProjectCard key={p.id} p={p} />)}
      />
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
      </div>

      <div className="mt-14 flex flex-col gap-16 sm:gap-20">
        {rows.map((r, i) => (
          <SectionRow key={r.id} id={r.id} n={i + 1} />
        ))}
      </div>
    </section>
  );
}
