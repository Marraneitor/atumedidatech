'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SITE, type Lang } from '@/lib/config';
import { usePrefs } from '@/lib/prefs';
import { EASE, Icon, Logo, WhatsAppIcon } from './ui';

const LINKS = ['services', 'work', 'why', 'pricing', 'contact'] as const;
const HREF: Record<(typeof LINKS)[number], string> = {
  services: '#soluciones',
  work: '#portafolio',
  why: '#nosotros',
  pricing: '#precios',
  contact: '#contacto',
};

export function PrefSelects({ compact = false, stack = false }: { compact?: boolean; stack?: boolean }) {
  const { lang, setLang, currency, setCurrency, t } = usePrefs();
  const base =
    'h-10 cursor-pointer appearance-none rounded-full border border-line bg-white/[.04] pr-8 pl-3.5 text-[13px] font-medium text-ink transition hover:border-white/20 hover:bg-white/[.07] focus:border-accent focus:outline-none';
  const chevron = (
    <svg viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
  return (
    <div className={`flex gap-2 ${stack ? 'flex-col' : 'items-center'} ${compact ? '' : 'w-full'}`}>
      <label className={`relative ${compact ? '' : 'flex-1'}`}>
        <span className="sr-only">{t.prefs.lang}</span>
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className={`${base} ${compact ? '' : 'w-full'}`}>
          {SITE.languages.map((l) => (
            <option key={l.code} value={l.code}>
              {compact ? l.code.toUpperCase() : l.label}
            </option>
          ))}
        </select>
        {chevron}
      </label>
      <label className={`relative ${compact ? '' : 'flex-1'}`}>
        <span className="sr-only">{t.prefs.currency}</span>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${base} ${compact ? '' : 'w-full'}`}>
          {Object.entries(SITE.currencies).map(([code, c]) => (
            <option key={code} value={code}>
              {compact ? code : `${code} · ${c.label}`}
            </option>
          ))}
        </select>
        {chevron}
      </label>
    </div>
  );
}

export default function Header() {
  const { t, wa } = usePrefs();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (open || y < 640) setHidden(false);
    else if (y > prev + 1) setHidden(true);
    else if (y < prev - 1) setHidden(false);
  });

  // Sección activa en el menú
  useEffect(() => {
    const ids = ['inicio', ...Object.values(HREF).map((h) => h.slice(1))];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'inicio' ? '' : '#' + e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onMq);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      mq.removeEventListener('change', onMq);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <motion.div aria-hidden style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-sky-300 via-accent to-accent-2" />
      <motion.header
        initial={false}
        animate={{ y: hidden ? -90 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-5"
      >
        <div
          className={`mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-2xl px-3 transition-all duration-500 sm:px-4 ${
            scrolled || open ? 'glass-float' : 'border border-transparent'
          }`}
        >
          <a href="#inicio" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav className="ml-auto hidden lg:block" aria-label="Principal">
            <ul className="flex items-center gap-1">
              {LINKS.map((k) => (
                <li key={k}>
                  <a
                    href={HREF[k]}
                    className={`relative rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors xl:px-4 ${active === HREF[k] ? 'text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    {active === HREF[k] && (
                      <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[.07]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    {t.nav[k]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <div className="hidden lg:block">
              <PrefSelects compact />
            </div>
            <a
              href={wa(t.wa.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg transition hover:bg-white sm:inline-flex"
            >
              <WhatsAppIcon className="size-4" />
              {t.nav.cta}
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
              className="grid size-11 place-items-center rounded-full border border-line bg-white/[.04] lg:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} className="size-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            className="fixed inset-0 z-[55] bg-bg/90 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              initial="hide"
              animate="show"
              exit="hide"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
              className="flex h-full flex-col px-6 pt-28 pb-[max(2rem,env(safe-area-inset-bottom))]"
              aria-label="Móvil"
            >
              <ul className="space-y-1">
                {LINKS.map((k) => (
                  <motion.li key={k} variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                    <a href={HREF[k]} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-line py-4 font-display text-3xl font-semibold tracking-[-0.012em]">
                      {t.nav[k]}
                      <Icon name="arrow" className="size-5 text-dim" />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="mt-auto space-y-3">
                <PrefSelects stack />
                <a
                  href={wa(t.wa.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-wa text-base font-semibold text-[#03200f]"
                >
                  <WhatsAppIcon />
                  {SITE.contact.waDisplay}
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
