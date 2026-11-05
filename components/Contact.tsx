'use client';

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { SITE } from '@/lib/config';
import { usePrefs } from '@/lib/prefs';
import { PrefSelects } from './Header';
import { EASE, FacebookIcon, Icon, Logo, MagneticButton, Reveal, WhatsAppIcon } from './ui';

type Status = { kind: 'idle' | 'sending' | 'ok' | 'err' | 'invalid' };

function ContactForm() {
  const { t, wa, f, lang, currency } = usePrefs();
  const fm = t.form;
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [data, setData] = useState({ name: '', phone: '', type: 0, msg: '' });

  const valid = () => data.name.trim().length > 1 && data.phone.replace(/\D/g, '').length >= 8;
  const text = () => f(t.wa.form, { name: data.name.trim(), type: fm.types[data.type], msg: data.msg.trim(), phone: data.phone.trim() }).replace(/\n\n/g, '\n');

  const sendWa = () => {
    if (!valid()) return setStatus({ kind: 'invalid' });
    setStatus({ kind: 'idle' });
    window.open(wa(text()), '_blank', 'noopener');
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid()) return setStatus({ kind: 'invalid' });
    setStatus({ kind: 'sending' });
    try {
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        SITE.emailjs.serviceId,
        SITE.emailjs.templateId,
        {
          title: fm.types[data.type],
          name: data.name.trim(),
          phone: data.phone.trim(),
          message: `${data.msg.trim()}\n\n[${lang.toUpperCase()} · ${currency}]`,
        },
        { publicKey: SITE.emailjs.publicKey },
      );
      setStatus({ kind: 'ok' });
      setData({ name: '', phone: '', type: 0, msg: '' });
    } catch {
      setStatus({ kind: 'err' });
    }
  };

  const field =
    'w-full rounded-2xl border border-line bg-white/[.03] px-4 py-3.5 text-[15px] text-ink placeholder:text-dim transition focus:border-accent focus:bg-white/[.05] focus:outline-none focus:ring-4 focus:ring-accent/15';
  const msg = { ok: fm.ok, err: fm.err, invalid: fm.invalid, sending: fm.sending, idle: '' }[status.kind];

  return (
    <form onSubmit={sendEmail} noValidate className="glass rounded-[28px] p-6 sm:p-8">
      <h3 className="font-display text-xl font-bold tracking-tight">{fm.title}</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">{fm.name}</span>
          <input className={field} autoComplete="name" placeholder={fm.namePh} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">{fm.phone}</span>
          <input className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder={fm.phonePh} value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required />
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="mb-2.5 text-sm font-medium text-muted">{fm.type}</legend>
        <div className="flex flex-wrap gap-2">
          {fm.types.map((ty, i) => (
            <button
              key={ty}
              type="button"
              aria-pressed={data.type === i}
              onClick={() => setData({ ...data, type: i })}
              className={`h-10 rounded-full border px-4 text-sm font-medium transition ${
                data.type === i ? 'border-accent bg-accent/15 text-ink' : 'border-line bg-white/[.03] text-muted hover:border-white/20 hover:text-ink'
              }`}
            >
              {ty}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-muted">{fm.msg}</span>
        <textarea rows={3} className={`${field} resize-none`} placeholder={fm.msgPh} value={data.msg} onChange={(e) => setData({ ...data, msg: e.target.value })} />
      </label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={sendWa} className="inline-flex h-12 items-center sm:flex-1 justify-center gap-2.5 rounded-full bg-wa px-6 text-[15px] font-semibold text-[#03200f] transition hover:brightness-110">
          <WhatsAppIcon className="size-[18px]" />
          {fm.wa}
        </button>
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="inline-flex h-12 items-center sm:flex-1 justify-center gap-2.5 rounded-full border border-line bg-white/[.04] px-6 text-[15px] font-semibold transition hover:bg-white/10 disabled:opacity-60"
        >
          <Icon name="mail" className="size-[18px]" />
          {status.kind === 'sending' ? fm.sending : fm.email}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {msg && status.kind !== 'sending' && (
          <motion.p
            key={status.kind}
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 text-sm ${status.kind === 'ok' ? 'text-wa' : 'text-amber-300'}`}
          >
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function Contact() {
  const { t, wa } = usePrefs();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.contact.phoneDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* sin portapapeles */ }
  };

  return (
    <section id="contacto" className="relative px-3 py-16 sm:px-5 sm:py-24">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-white/10 bg-[#070b16]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-1/3 -left-1/4 size-[70vmax] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,.28),transparent)] blur-3xl" />
          <div className="absolute -right-1/4 -bottom-1/3 size-[60vmax] animate-aurora-slow rounded-full bg-[radial-gradient(closest-side,rgba(109,124,255,.32),transparent)] blur-3xl" />
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)] opacity-60" />
        </div>

        <div className="relative grid gap-12 px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-16 lg:py-24">
          <div className="flex flex-col">
            <Reveal>
              <h2 className="font-display text-[2.4rem] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl">
                {t.cta.t1} <span className="text-gradient">{t.cta.t2}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{t.cta.sub}</p>
            </Reveal>
            <Reveal delay={0.14} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MagneticButton href={wa(t.wa.general)} variant="wa" external>
                <WhatsAppIcon />
                {t.cta.wa}
              </MagneticButton>
              <MagneticButton href={`tel:${SITE.contact.phoneLink}`} variant="ghost">
                <Icon name="phone" className="size-[18px]" />
                {t.cta.call}
              </MagneticButton>
            </Reveal>
            <Reveal delay={0.2} className="mt-auto pt-12">
              <div className="glass flex items-center gap-4 rounded-2xl p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-wa/15 text-wa">
                  <WhatsAppIcon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] tracking-[.16em] text-dim uppercase">WhatsApp</p>
                  <a href={`tel:${SITE.contact.phoneLink}`} className="font-display text-lg font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-2xl">
                    {SITE.contact.phoneDisplay}
                  </a>
                </div>
                <button type="button" onClick={copy} aria-label={t.cta.copy} className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line transition hover:bg-white/10">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={copied ? 'ok' : 'copy'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Icon name={copied ? 'check' : 'copy'} className={`size-[18px] ${copied ? 'text-wa' : ''}`} />
                    </motion.span>
                  </AnimatePresence>
                  <span className="sr-only" role="status">{copied ? t.cta.copied : ''}</span>
                </button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = usePrefs();
  const year = new Date().getFullYear();
  const links: [string, string][] = [
    [t.nav.services, '#servicios'],
    [t.nav.work, '#portafolio'],
    [t.nav.why, '#nosotros'],
    [t.nav.pricing, '#precios'],
    [t.nav.contact, '#contacto'],
  ];
  return (
    <footer className="border-t border-line pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[.18em] text-dim uppercase">{t.footer.explore}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map(([l, h]) => (
              <li key={h}>
                <a href={h} className="text-muted transition hover:text-ink">{l}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[.18em] text-dim uppercase">{t.footer.contact}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`https://wa.me/${SITE.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-ink">
                {SITE.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={SITE.url} className="text-muted transition hover:text-ink">atumedidatech.online</a>
            </li>
          </ul>
          <p className="mt-6 font-mono text-[11px] tracking-[.18em] text-dim uppercase">{t.footer.social}</p>
          <div className="mt-3 flex gap-2">
            <a href={SITE.contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-10 place-items-center rounded-full border border-line text-muted transition hover:border-white/25 hover:text-ink">
              <FacebookIcon />
            </a>
            <a href={`https://wa.me/${SITE.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full border border-line text-muted transition hover:border-white/25 hover:text-ink">
              <WhatsAppIcon className="size-[18px]" />
            </a>
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[.18em] text-dim uppercase">
            {t.prefs.lang} · {t.prefs.currency}
          </p>
          <div className="mt-4 max-w-xs">
            <PrefSelects stack />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-2 border-t border-line px-5 pt-8 text-xs text-dim sm:flex-row sm:justify-between sm:px-8">
        <p>© {year} A TU MEDIDA TECH. {t.footer.rights}</p>
        <p>{t.footer.made}</p>
      </div>
    </footer>
  );
}

export function WaFloat() {
  const { t, wa } = usePrefs();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > 700));
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={wa(t.wa.general)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.float}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.5, ease: EASE }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 grid size-14 place-items-center rounded-full bg-wa text-[#03200f] shadow-[0_12px_40px_-8px_rgba(37,211,102,.7)] sm:right-6 sm:bottom-6"
        >
          <span className="absolute inset-0 animate-ping-slow rounded-full bg-wa/40" />
          <WhatsAppIcon className="relative size-7" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
