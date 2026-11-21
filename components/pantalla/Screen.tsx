'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/lib/projects';
import { LogoMark } from '@/components/ui';

/* Protector de pantalla: muro inclinado de proyectos reales que fluye lento, marca abajo a la izquierda
   y una terminal que "publica" cada proyecto. Pensado para fondo de video (podcast): sin cursor, sin
   botones visibles y solo animaciones de transform/opacity. Doble clic o tecla F: pantalla completa. */

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
/** Dominio propio si lo tiene; si es una vista de Vercel, un nombre corto del proyecto. */
const label = (p: { id: string; url: string }) => (host(p.url).includes('vercel.app') ? `${p.id}.app` : host(p.url));

const desk = PROJECTS.map((p) => ({ id: p.id, name: p.name, url: label(p), src: `/assets/img/projects/${p.id}.webp` }));
const phones = PROJECTS.filter((p) => p.mobile).map((p) => ({ id: p.id, name: p.name, url: label(p), src: `/assets/img/mobile/${p.id}.webp` }));

type Item = (typeof desk)[number];

/** Reparte la lista en n columnas empezando en puntos distintos, para que no se vean iguales. */
function columns(list: Item[], n: number, per: number) {
  return Array.from({ length: n }, (_, c) => Array.from({ length: per }, (_, i) => list[(c * 3 + i * n + c) % list.length]));
}

const COLS: { kind: 'desk' | 'phone'; items: Item[]; dur: number; reverse: boolean }[] = (() => {
  const d = columns(desk, 4, 6);
  const m = columns(phones, 2, 5);
  return [
    { kind: 'desk', items: d[0], dur: 150, reverse: false },
    { kind: 'phone', items: m[0], dur: 120, reverse: true },
    { kind: 'desk', items: d[1], dur: 170, reverse: false },
    { kind: 'desk', items: d[2], dur: 140, reverse: true },
    { kind: 'phone', items: m[1], dur: 130, reverse: false },
    { kind: 'desk', items: d[3], dur: 160, reverse: true },
  ];
})();

export default function Screen() {
  const root = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);

  // Oculta el cursor tras 2.5 s sin moverlo.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), 2500);
    };
    wake();
    const full = () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else root.current?.requestFullscreen?.().catch(() => {});
    };
    const onKey = (e: KeyboardEvent) => e.key.toLowerCase() === 'f' && full();
    window.addEventListener('pointermove', wake);
    window.addEventListener('dblclick', full);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('dblclick', full);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={root} className={`fixed inset-0 overflow-hidden bg-bg select-none ${idle ? 'cursor-none' : ''}`}>
      {/* Muro de proyectos */}
      <div aria-hidden className="absolute top-1/2 left-1/2 h-[220vh] w-[170vw] -translate-x-1/2 -translate-y-1/2 [perspective:2000px]">
        <div className="flex h-full justify-center gap-[1.6vw] [transform:rotateX(24deg)_rotateZ(-14deg)] [transform-style:preserve-3d]">
          {COLS.map((col, i) => (
            <div key={i} className={`h-full shrink-0 overflow-hidden ${col.kind === 'phone' ? 'w-[11vw]' : 'w-[24vw]'}`}>
              <div
                className="flex flex-col gap-[1.6vw] will-change-transform"
                style={{ animation: `wall-up ${col.dur}s linear infinite ${col.reverse ? 'reverse' : 'normal'}`, animationDelay: `-${i * 17}s` }}
              >
                {[...col.items, ...col.items].map((p, k) => (col.kind === 'phone' ? <Phone key={k} p={p} /> : <Browser key={k} p={p} />))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retícula y viñeta para que la marca se lea encima */}
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-[.35]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,7,13,.85)_85%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-bg via-bg/40 to-transparent" />

      {/* Marca */}
      <div className="absolute bottom-[6vh] left-[5vw] max-w-[44vw]">
        <div className="flex items-center gap-[1.4vw]">
          <LogoMark className="size-[5.2vw] min-w-14 drop-shadow-[0_10px_40px_rgba(56,189,248,.45)]" />
          <div className="leading-none">
            <p className="font-display text-[3.4vw] font-extrabold tracking-[-0.022em] text-ink">A TU MEDIDA</p>
            <p className="mt-[.5vw] text-[1.1vw] font-semibold tracking-[.6em] text-accent">TECH</p>
          </div>
        </div>
        <p className="mt-[2vw] text-[1.35vw] leading-snug text-muted">Páginas web, chatbots, CRM y sistemas a la medida de tu negocio.</p>
        <p className="mt-[.8vw] font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[1.05vw] text-accent">atumedidatech.online</p>
      </div>

      <Terminal />
    </div>
  );
}

function Browser({ p }: { p: Item }) {
  return (
    <figure className="overflow-hidden rounded-[.9vw] border border-white/10 bg-bg-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
      <div className="flex items-center gap-[.45vw] border-b border-white/[.06] px-[.8vw] py-[.55vw]">
        <span className="size-[.5vw] rounded-full bg-white/20" />
        <span className="size-[.5vw] rounded-full bg-white/20" />
        <span className="size-[.5vw] rounded-full bg-white/20" />
        <span className="ml-[.6vw] truncate font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[.7vw] text-dim">{p.url}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt="" width={960} height={600} decoding="async" className="block h-auto w-full" />
    </figure>
  );
}

function Phone({ p }: { p: Item }) {
  return (
    <figure className="overflow-hidden rounded-[1.4vw] border-[.35vw] border-[#141a26] bg-bg-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt="" width={585} height={1266} decoding="async" className="block h-auto w-full" />
    </figure>
  );
}

/* Terminal que escribe, uno por uno, el despliegue de cada proyecto. */
const SCRIPT = PROJECTS.map((p) => ({ cmd: `deploy ${label(p)}`, out: `✓ ${p.name} en línea` }));

function Terminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [typing, setTyping] = useState('');

  useEffect(() => {
    let i = 0;
    let c = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const step = SCRIPT[i % SCRIPT.length];
      const full = `$ ${step.cmd}`;
      if (c < full.length) {
        c++;
        setTyping(full.slice(0, c));
        timer = setTimeout(tick, 45 + Math.random() * 60);
        return;
      }
      setLines((l) => [...l, full, step.out].slice(-8));
      setTyping('');
      c = 0;
      i++;
      timer = setTimeout(tick, 2600);
    };
    timer = setTimeout(tick, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden
      className="absolute right-[4vw] bottom-[6vh] w-[30vw] overflow-hidden rounded-[1vw] border border-white/10 bg-bg/70 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[.95vw] leading-[1.7] backdrop-blur-md"
    >
      <div className="flex items-center gap-[.45vw] border-b border-white/[.06] px-[1vw] py-[.6vw]">
        <span className="size-[.55vw] rounded-full bg-white/20" />
        <span className="size-[.55vw] rounded-full bg-white/20" />
        <span className="size-[.55vw] rounded-full bg-white/20" />
        <span className="ml-[.6vw] text-[.8vw] text-dim">atm@studio: ~/proyectos</span>
      </div>
      <div className="h-[16vw] px-[1vw] py-[.8vw]">
        <div className="flex h-full flex-col justify-end">
          {lines.map((l, k) => (
            <p key={k} className={l.startsWith('$') ? 'text-muted' : 'text-accent'}>{l}</p>
          ))}
          <p className="text-ink">
            {typing || '$ '}
            <span className="ml-[.1vw] inline-block h-[1.1em] w-[.5em] translate-y-[.2em] animate-pulse bg-accent" />
          </p>
        </div>
      </div>
    </div>
  );
}
