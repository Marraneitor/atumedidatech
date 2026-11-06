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

/* Entrada del titular con CSS (no espera a JavaScript: el texto pinta en cuanto llega el HTML) */
function Words({ text, gradient = false, offset = 0 }: { text: string; gradient?: boolean; offset?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-top">
          <span
            className={`inline-block animate-rise ${gradient ? 'text-gradient pr-[0.04em]' : ''}`}
            style={{ animationDelay: `${0.05 + (offset + i) * 0.05}s` }}
          >
            {w}
          </span>
          {' '}
        </span>
      ))}
    </>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-[35%] left-[-10%] h-[90vh] w-[90vw] animate-aurora bg-[radial-gradient(closest-side,rgba(56,189,248,.22),transparent)]" />
      <div className="absolute top-[5%] right-[-20%] h-[80vh] w-[70vw] animate-aurora-slow bg-[radial-gradient(closest-side,rgba(59,130,246,.2),transparent)]" />
      {/* Malla en perspectiva, estática */}
      <div className="absolute inset-x-[-50%] top-[22%] h-[55%] [perspective:700px]">
        <div className="bg-grid absolute inset-0 origin-bottom [mask-image:linear-gradient(to_top,#000_10%,transparent_80%)] [transform:rotateX(62deg)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

function Chip({ icon, title, sub, tone }: { icon: React.ReactNode; title: string; sub: string; tone: string }) {
  return (
    <div className="glass-float flex items-center gap-3 rounded-2xl py-2 pr-4 pl-2 sm:py-2.5 sm:pl-2.5">
      <span className={`grid size-8 place-items-center rounded-xl sm:size-9 ${tone}`}>{icon}</span>
      <span className="text-left leading-tight">
        <span className="block text-[11px] font-semibold whitespace-nowrap sm:text-[13px]">{title}</span>
        <span className="text-[10px] text-muted sm:text-xs">{sub}</span>
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
    const id = setInterval(() => setI((n) => (n + 1) % SCREENS.length), 4500);
    return () => clearInterval(id);
  }, [reduce]);

  // Inclinación 3D sutil con el mouse
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [3, -3]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 90, damping: 18 });
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce) return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  // Al hacer scroll los dispositivos se enderezan: continuidad entre el titular y la prueba real
  const { scrollYProgress: inP } = useScroll({ target: stage, offset: ['start end', 'center center'] });
  const tilt = useTransform(inP, [0, 1], [reduce ? 0 : 22, 0]);
  const scale = useTransform(inP, [0, 1], [reduce ? 1 : 0.92, 1]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yPhone = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);

  const s = SCREENS[i];
  const words1 = t.hero.t1.split(' ').length;

  return (
    <section id="inicio" ref={ref} onPointerMove={onMove} className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <Background />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <span className="surface inline-flex animate-fade-up items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-[13px] text-muted">
          <span className="size-2 rounded-full bg-wa shadow-[0_0_0_4px_rgba(37,211,102,.15)]" />
          {t.hero.badge}
        </span>

        <h1
          key={lang}
          aria-label={`${t.hero.t1} ${t.hero.t2}`}
          className="mt-7 max-w-6xl font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem]"
        >
          <Words text={t.hero.t1} />
          <br />
          <Words text={t.hero.t2} gradient offset={words1} />
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <p className="max-w-[58ch] animate-fade-up text-lg leading-relaxed text-muted text-pretty [animation-delay:.25s] sm:text-xl">
              {t.hero.sub}
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:.35s] sm:flex-row sm:items-center">
              <MagneticButton href={wa(t.wa.general)} external className="sm:min-h-14 sm:px-8 sm:text-base">
                <WhatsAppIcon className="size-[18px]" />
                {t.hero.cta1}
              </MagneticButton>
              <MagneticButton href="#servicios" variant="ghost" className="sm:min-h-14 sm:px-8 sm:text-base">
                {t.hero.cta2}
                <Icon name="arrow" className="size-4 rotate-90" />
              </MagneticButton>
            </div>
          </div>

          <dl className="grid animate-fade-up grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-left [animation-delay:.45s] lg:w-[440px]">
            {[
              { v: price('landing'), l: t.hero.priceL },
              { v: '20+', l: t.hero.projL },
              { v: '< 24 h', l: t.hero.replyL },
            ].map((x) => (
              <div key={x.l} className="flex flex-col gap-1 bg-bg-2 p-3 sm:p-4">
                <dt className="text-xs leading-snug text-dim">{x.l}</dt>
                <dd className="order-first font-display text-base font-bold whitespace-nowrap tabular-nums sm:text-xl">{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Escenario de dispositivos: trabajos reales, no ilustraciones */}
      <div ref={stage} className="relative mx-auto mt-16 w-full max-w-[1080px] animate-fade-up px-5 [animation-delay:.4s] [perspective:1600px] sm:mt-20 sm:px-8">
        <motion.div style={{ rotateX: tilt, scale, transformOrigin: '50% 100%' }}>
          <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative mx-auto w-[90%] sm:w-[80%]">
            <div className="absolute inset-x-[10%] top-[10%] bottom-0 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,.35),transparent)]" />
            <div className="relative">
              <Laptop src={`/assets/img/projects/${SCREENS[0].desk}.webp`} alt="" priority className="opacity-0" />
              <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={s.desk}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <Laptop src={`/assets/img/projects/${s.desk}.webp`} alt="" priority={s.desk === SCREENS[0].desk} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute inset-x-0 -top-5 flex justify-center sm:-top-6">
                <div className="glass-float flex max-w-[80%] items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-muted sm:text-xs">
                  <Icon name="globe" className="size-3.5 shrink-0 text-accent" />
                  <span className="truncate" aria-live="off">
                    {s.url}
                  </span>
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
                    width={585}
                    height={1266}
                    className="absolute inset-0 size-full object-cover object-top"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                  />
                </AnimatePresence>
              </Phone>
            </motion.div>

            <div className="absolute top-[12%] -right-[4%] animate-fade-up [animation-delay:1s] sm:-right-[12%]" style={{ transform: 'translateZ(90px)' }}>
              <Chip icon={<WhatsAppIcon className="size-4 sm:size-[18px]" />} title={t.hero.chip1} sub={t.hero.chip1b} tone="bg-wa/15 text-wa" />
            </div>
            <div className="absolute bottom-[20%] -right-[8%] hidden animate-fade-up [animation-delay:1.2s] sm:block" style={{ transform: 'translateZ(70px)' }}>
              <Chip icon={<Icon name="check" className="size-[18px]" />} title={t.hero.chip2} sub={t.hero.chip2b} tone="bg-accent/15 text-accent" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
