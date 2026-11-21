'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SITE, type Lang } from '@/lib/config';
import { usePrefs } from '@/lib/prefs';
import { TabBar, TABS, useTabs } from './Tabs';
import { EASE, Icon, Logo, WhatsAppIcon } from './ui';

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
  const { go } = useTabs();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const mq = window.matchMedia('(min-width: 1280px)');
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

          <nav className="ml-auto hidden xl:block" aria-label="Principal">
            <TabBar />
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-3">
            <div className="hidden lg:block">
              <PrefSelects compact />
            </div>
            <a
              href="/citas"
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-white/[.04] px-4 text-sm font-semibold text-ink transition hover:border-white/20 hover:bg-white/[.08] 2xl:inline-flex"
            >
              <Icon name="calendar" className="size-4 text-accent" />
              {t.nav.book}
            </a>
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
              className="grid size-11 place-items-center rounded-full border border-line bg-white/[.04] xl:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} className="size-5" />
            </button>
          </div>
        </div>
        <nav className="mx-auto mt-2 max-w-7xl xl:hidden" aria-label="Principal">
          <TabBar className="glass-float w-fit max-w-full" />
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            className="fixed inset-0 z-[55] bg-bg/90 backdrop-blur-xl xl:hidden"
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
                {TABS.map((k) => (
                  <motion.li key={k.id} variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        go(k.id);
                      }}
                      className="flex w-full items-center justify-between border-b border-line py-4 text-left font-display text-3xl font-semibold tracking-[-0.012em]"
                    >
                      {t.nav[k.nav]}
                      <Icon name="arrow" className="size-5 text-dim" />
                    </button>
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="mt-auto space-y-3">
                <PrefSelects stack />
                <a href="/citas" className="flex h-14 items-center justify-center gap-2.5 rounded-full border border-line bg-white/[.04] text-base font-semibold text-ink">
                  <Icon name="calendar" className="size-5 text-accent" />
                  {t.nav.book}
                </a>
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
