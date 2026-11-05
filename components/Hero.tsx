'use client';

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import { EASE, Icon, Laptop, MagneticButton, Phone, WhatsAppIcon } from './ui';

const SCREENS = [
  { desk: 'gestia', mob: 'srsburger', url: 'gestia.rest' },
  { desk: 'beautymina', mob: 'denti7', url: 'beautymina.lat' },
  { desk: 'hotelmadrid', mob: 'littlecakes', url: 'hotel-madrid-minatitlan.vercel.app' },
  { desk: 'denti7', mob: 'beautymina', url: 'denti7.vercel.app' },
  { desk: 'srsburger', mob: 'oxford', url: 'srsburger.com' },
];

function Words({ text, gradient = false, offset = 0 }: { text: string; gradient?: boolean; offset?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className={`inline-block ${gradient ? 'text-gradient pr-[0.04em]' : ''}`}
            initial={{ y: '110%', rotate: 4 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 + (offset + i) * 0.07 }}
          >
            {w}
          </motion.span>
          {' '}
        </span>
      ))}
    </>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-[30%] left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(56,189,248,.18),transparent)]" />
      <div className="absolute top-[-10%] left-[-10%] size-[55vmax] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,.28),transparent)] blur-3xl" />
      <div className="absolute top-[10%] right-[-15%] size-[50vmax] animate-aurora-slow rounded-full bg-[radial-gradient(closest-side,rgba(109,124,255,.30),transparent)] blur-3xl" />
      <div className="absolute bottom-[-25%] left-[25%] size-[45vmax] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,.18),transparent)] blur-3xl [animation-delay:-7s]" />
      {/* Malla 3D en perspectiva */}
      <div className="absolute inset-x-[-50%] top-[18%] h-[55%] [perspective:700px]">
        <div className="bg-grid absolute inset-0 origin-bottom animate-grid [mask-image:linear-gradient(to_top,#000_10%,transparent_80%)] [transform:rotateX(62deg)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

function Chip({ icon, title, sub, tone }: { icon: React.ReactNode; title: string; sub: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1020]/90 py-2 pr-3.5 pl-2 shadow-2xl backdrop-blur-xl sm:py-2.5 sm:pr-4 sm:pl-2.5">
      <span className={`grid size-8 place-items-center rounded-xl sm:size-9 ${tone}`}>{icon}</span>
      <span className="text-left leading-tight">
        <span className="block text-[11px] font-semibold whitespace-nowrap sm:text-[13px]">{title}</span>
        <span className="text-[10px] text-muted sm:text-[11px]">{sub}</span>
      </span>
    </div>
  );
}

export default function Hero() {
  const { t, lang, price, wa } = usePrefs();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % SCREENS.length), 4200);
    return () => clearInterval(id);
  }, [reduce]);

  // Inclinación 3D sutil con el mouse
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 90, damping: 18 });
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce) return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  // Al hacer scroll los dispositivos se enderezan (tilt-in) y el teléfono sube en parallax
  const { scrollYProgress: inP } = useScroll({ target: stage, offset: ['start end', 'center center'] });
  const tilt = useTransform(inP, [0, 1], [reduce ? 0 : 24, 0]);
  const scale = useTransform(inP, [0, 1], [reduce ? 1 : 0.9, 1]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yPhone = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const yChip = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);

  const s = SCREENS[i];
  const words1 = t.hero.t1.split(' ').length;

  return (
    <section id="inicio" ref={ref} onPointerMove={onMove} className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <Background />
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-[13px] text-muted"
        >
          <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-accent/40" />
            <span className="size-2 rounded-full bg-accent" />
          </span>
          {t.hero.badge}
        </motion.span>

        <h1
          key={lang}
          className="mx-auto mt-7 max-w-6xl font-display text-[2.75rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-6xl md:text-7xl lg:text-[5.4rem] xl:text-[5.9rem]"
        >
          <Words text={t.hero.t1} />
          <br className="hidden md:block" />
          <Words text={t.hero.t2} gradient offset={words1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.68 }}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
        >
          <MagneticButton href={wa(t.wa.general)} external className="sm:min-h-14 sm:px-8 sm:text-base">
            {t.hero.cta1}
            <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton href="#servicios" variant="ghost" className="sm:min-h-14 sm:px-8 sm:text-base">
            {t.hero.cta2}
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted"
        >
          <span className="flex items-center gap-2">
            <Icon name="spark" className="size-4 text-accent" />
            {t.hero.price} <strong className="font-semibold text-ink tabular-nums">{price('landing')}</strong>
          </span>
          <span className="flex items-center gap-2">
            <Icon name="check" className="size-4 text-accent" />
            {t.hero.trust1}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="bolt" className="size-4 text-accent" />
            {t.hero.trust2}
          </span>
        </motion.div>
      </div>

      {/* Escenario de dispositivos */}
      <motion.div
        ref={stage}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
        className="relative mx-auto mt-16 w-full max-w-[1080px] px-5 [perspective:1600px] sm:mt-20 sm:px-8"
      >
        <motion.div style={{ rotateX: tilt, scale, transformOrigin: '50% 100%' }}>
          <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative mx-auto w-[90%] sm:w-[80%]">
            <div className="absolute inset-x-[10%] top-[10%] bottom-0 -z-10 rounded-full bg-accent/30 blur-[90px]" />
            <div className="relative">
              <Laptop src={`/assets/img/projects/${s.desk}.webp`} alt="" priority className="opacity-0" />
              <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={s.desk}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <Laptop src={`/assets/img/projects/${s.desk}.webp`} alt="" priority />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute inset-x-0 -top-5 flex justify-center sm:-top-6">
                <div className="flex max-w-[80%] items-center gap-2 rounded-full border border-white/10 bg-[#0b1020]/90 px-3 py-1.5 font-mono text-[10px] text-muted shadow-xl backdrop-blur sm:text-xs">
                  <span className="size-1.5 shrink-0 rounded-full bg-wa" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={s.url}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                      className="truncate"
                    >
                      https://{s.url}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <motion.div style={{ y: yPhone, translateZ: 60 }} className="absolute -bottom-[6%] -left-[5%] w-[24%] sm:-left-[9%] sm:w-[20%]">
              <Phone className="w-full">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={s.mob}
                    src={`/assets/img/mobile/${s.mob}.webp`}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-top"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                  />
                </AnimatePresence>
              </Phone>
            </motion.div>

            {/* Notificaciones flotantes */}
            <motion.div style={{ y: yChip, translateZ: 90 }} className="absolute top-[12%] -right-[4%] sm:-right-[12%]">
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 1.3 }} className="animate-float">
                <Chip icon={<WhatsAppIcon className="size-4 sm:size-[18px]" />} title={t.hero.chip1} sub={t.hero.chip1b} tone="bg-wa/15 text-wa" />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: yChip, translateZ: 70 }} className="absolute bottom-[20%] -right-[8%] hidden sm:block">
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 1.55 }} className="animate-float [animation-delay:-3.5s]">
                <Chip icon={<Icon name="globe" className="size-[18px]" />} title={t.hero.chip2} sub={t.hero.chip2b} tone="bg-accent/15 text-accent" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
