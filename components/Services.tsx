'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { usePrefs } from '@/lib/prefs';
import type { Lang } from '@/lib/config';
import { EASE, Icon, Phone, Reveal, SectionHead, spotOff, useSpotlight } from './ui';

const DEMO: Record<Lang, { b1: string; b2: string; b3: string; kpi: string; name: string }> = {
  es: { b1: 'Recordatorio enviado · Cita mañana 10:00', b2: 'Inventario bajo: 3 piezas', b3: 'Pago registrado · $1,250', kpi: 'ventas este mes', name: 'Tu Nombre' },
  en: { b1: 'Reminder sent · Appointment tomorrow 10:00', b2: 'Low stock: 3 units', b3: 'Payment recorded · $1,250', kpi: 'sales this month', name: 'Your Name' },
  pt: { b1: 'Lembrete enviado · Consulta amanhã 10:00', b2: 'Estoque baixo: 3 unidades', b3: 'Pagamento registrado · $1.250', kpi: 'vendas este mês', name: 'Seu Nome' },
};

function Card({
  icon,
  title,
  desc,
  bullets,
  cta,
  href,
  visual,
  className = '',
  delay = 0,
}: {
  icon: string;
  title: string;
  desc: string;
  bullets: string[];
  cta: string;
  href: string;
  visual: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const spot = useSpotlight<HTMLElement>();
  return (
    <Reveal as="article" delay={delay} className={`group ${className}`}>
      <div
        onPointerMove={spot}
        onPointerLeave={spotOff}
        className="spotlight surface flex h-full flex-col overflow-hidden rounded-[28px] transition-transform duration-500 hover:-translate-y-1"
      >
        <div className="relative h-60 overflow-hidden border-b border-line bg-gradient-to-b from-white/[.03] to-transparent sm:h-72">{visual}</div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <Icon name={icon} className="size-5" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.012em]">{title}</h3>
          <p className="mt-2 leading-relaxed text-muted">{desc}</p>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="text-ink/85">{b}</span>
              </li>
            ))}
          </ul>
          <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-accent">
            {cta}
            <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </Reveal>
  );
}

function WebVisual() {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-8 left-[6%] w-[62%] rotate-[-3deg] overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-5deg]">
        <div className="flex h-6 items-center gap-1.5 bg-[#151925] px-3">
          <span className="size-2 rounded-full bg-[#ff5f57]" /><span className="size-2 rounded-full bg-[#febc2e]" /><span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/img/projects/beautymina.webp" alt="" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
      </div>
      <div className="absolute top-20 right-[5%] w-[56%] rotate-[4deg] overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-transform duration-700 ease-out group-hover:translate-y-[-14px] group-hover:rotate-[6deg]">
        <div className="flex h-6 items-center gap-1.5 bg-[#151925] px-3">
          <span className="size-2 rounded-full bg-[#ff5f57]" /><span className="size-2 rounded-full bg-[#febc2e]" /><span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/img/projects/denti7.webp" alt="" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
      </div>
    </div>
  );
}

function QrVisual({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-5 pt-6">
      <Phone src="/assets/img/mobile/srsburger.webp" alt="" className="w-[38%] max-w-[150px] translate-y-10 transition-transform duration-700 ease-out group-hover:translate-y-4" />
      <div className="mb-10 flex flex-col items-center gap-2.5 transition-transform duration-700 ease-out group-hover:-translate-y-2">
        <div className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-[0_20px_50px_-15px_rgba(56,189,248,.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/img/qr-atumedida.svg" alt="QR atumedidatech.online" className="size-24 sm:size-28" />
          <span className="absolute inset-x-0 top-1/2 h-8 animate-scan bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
        </div>
        <span className="font-mono text-[11px] tracking-[.08em] text-muted uppercase">{label}</span>
      </div>
    </div>
  );
}

function NfcVisual({ label, name }: { label: string; name: string }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 150, damping: 15 });
  const shine = useTransform(mx, [-0.5, 0.5], ['0%', '100%']);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center [perspective:900px]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', '--shine': shine } as React.CSSProperties & Record<string, unknown>}
        className="relative aspect-[1.586] w-[72%] max-w-[300px] overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#0f172a_0%,#0b1220_50%,#0c2540_100%)] p-5 shadow-[0_24px_48px_-20px_rgba(56,189,248,.45)]"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
          style={{ background: useTransform(shine, (s) => `linear-gradient(115deg, transparent 20%, rgba(125,211,252,.35) ${s}, transparent 80%)`) }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/logo-mark.svg" alt="" className="size-9" />
            <span className="relative grid size-9 place-items-center text-accent">
              <span className="absolute inset-0 animate-ping-slow rounded-full border border-accent/60" />
              <span className="absolute inset-0 animate-ping-slow rounded-full border border-accent/40 [animation-delay:-1.2s]" />
              <Icon name="nfc" className="size-5" />
            </span>
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.012em]">{name}</p>
            <p className="font-mono text-[10px] tracking-[.08em] text-muted uppercase">{label}</p>
            <div className="mt-2 flex gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" className="size-3.5 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AutoVisual({ lang }: { lang: Lang }) {
  const d = DEMO[lang];
  const bars = [38, 52, 44, 66, 58, 80, 92];
  return (
    <div className="absolute inset-0 grid grid-cols-1 gap-4 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8">
      <div className="surface hidden flex-col rounded-2xl p-5 sm:flex">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-3xl font-bold">+38%</span>
          <span className="text-xs text-muted">{d.kpi}</span>
        </div>
        <div className="mt-auto flex h-28 items-end gap-2">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-accent-2/40 to-accent"
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.07 }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3">
        {[
          { icon: 'calendar', text: d.b1, c: 'text-accent bg-accent/10' },
          { icon: 'chart', text: d.b2, c: 'text-amber-300 bg-amber-300/10' },
          { icon: 'check', text: d.b3, c: 'text-wa bg-wa/10' },
        ].map((b, i) => (
          <motion.div
            key={b.icon}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 + i * 0.15 }}
            className="surface flex items-center gap-3 rounded-2xl bg-bg/40 p-3 pr-4"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${b.c}`}>
              <Icon name={b.icon} className="size-[18px]" />
            </span>
            <span className="text-[13px] leading-snug text-ink/90">{b.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  const { t, lang, wa, f } = usePrefs();
  const s = t.services;
  const link = (name: string) => wa(f(t.wa.service, { name }));
  return (
    <section id="servicios" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={s.eyebrow} title={s.title} sub={s.sub} />
        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-7" icon="monitor" title={s.web.title} desc={s.web.desc} bullets={s.web.b} cta={s.more} href={link(s.web.title)} visual={<WebVisual />} />
          <Card className="lg:col-span-5" delay={0.08} icon="qr" title={s.qr.title} desc={s.qr.desc} bullets={s.qr.b} cta={s.more} href={link(s.qr.title)} visual={<QrVisual label={s.qrDemo} />} />
          <Card className="lg:col-span-5" icon="nfc" title={s.nfc.title} desc={s.nfc.desc} bullets={s.nfc.b} cta={s.more} href={link(s.nfc.title)} visual={<NfcVisual label={s.nfcTap} name={DEMO[lang].name} />} />
          <Card className="lg:col-span-7" delay={0.08} icon="cog" title={s.auto.title} desc={s.auto.desc} bullets={s.auto.b} cta={s.more} href={link(s.auto.title)} visual={<AutoVisual lang={lang} />} />
        </div>
      </div>
    </section>
  );
}
