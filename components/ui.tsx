'use client';

import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { useCallback, useRef } from 'react';

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Íconos (trazo 1.75, 24px) ---------- */
const paths: Record<string, React.ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8m-4-4v4" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>,
  nfc: <><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12" /><rect x="13" y="3" width="8" height="18" rx="2" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  cursor: <><path d="m4 4 7 17 2.5-7.5L21 11 4 4Z" /></>,
  spark: <path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8" />,
  life: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6" /></>,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4" /></>,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
};

export function Icon({ name, className = 'size-5', ...rest }: { name: keyof typeof paths | string; className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...rest}>
      {paths[name]}
    </svg>
  );
}

export function WhatsAppIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm8.4-18.2A11.8 11.8 0 0 0 1.7 17.8L0 24l6.4-1.7A11.8 11.8 0 0 0 23.8 12c0-3.2-1.2-6.2-3.4-8.4Z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

/* ---------- Logo ---------- */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/img/logo-mark.svg" alt="" width={36} height={36} className="size-9 drop-shadow-[0_6px_18px_rgba(56,189,248,.35)]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-extrabold tracking-tight text-ink">A TU MEDIDA</span>
        <span className="mt-1 font-mono text-[10px] font-medium tracking-[.42em] text-accent">TECH</span>
      </span>
    </span>
  );
}

/* ---------- Aparición al hacer scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'article' | 'span' } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function SectionHead({ eyebrow, title, sub, center = false }: { eyebrow: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal>
        <span className={`inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[.14em] text-accent uppercase ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-accent" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-4 font-display text-[2rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className="mt-5 text-base leading-relaxed text-muted text-pretty sm:text-lg">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- Botón magnético ---------- */
type MagProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'wa';
  className?: string;
  external?: boolean;
  onClick?: () => void;
};

export function MagneticButton({ href, children, variant = 'primary', className = '', external, onClick }: MagProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.36);
  };
  const leave = () => { x.set(0); y.set(0); };

  const styles = {
    primary:
      'bg-gradient-to-r from-sky-300 via-accent to-accent-2 text-[#03111c] shadow-[0_10px_40px_-8px_rgba(56,189,248,.65)] hover:shadow-[0_14px_50px_-6px_rgba(56,189,248,.85)]',
    ghost: 'glass text-ink hover:bg-white/10',
    wa: 'bg-wa text-[#03200f] shadow-[0_10px_40px_-10px_rgba(37,211,102,.7)]',
  }[variant];

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 text-[15px] font-semibold transition-[box-shadow,background-color] duration-300 select-none ${styles} ${className}`}
    >
      {variant === 'primary' && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      )}
      <span className="relative flex items-center gap-2.5">{children}</span>
    </motion.a>
  );
}

/* ---------- Luz que sigue al cursor ---------- */
export function useSpotlight<T extends HTMLElement>() {
  return useCallback((e: React.PointerEvent<T>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.style.setProperty('--spot', '1');
  }, []);
}
export const spotOff = (e: React.PointerEvent<HTMLElement>) => e.currentTarget.style.setProperty('--spot', '0');

/* ---------- Maquetas de dispositivos ---------- */
export function Laptop({ src, alt, className = '', priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-[14px] bg-gradient-to-b from-[#3a3f4b] to-[#1c1f27] p-[1.2%] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9),inset_0_0_0_1px_rgba(255,255,255,.08)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10" />
        </div>
        <span className="absolute top-[0.45%] left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/70" />
      </div>
      <div className="relative mx-[-7%] h-[clamp(8px,1.4vw,14px)] rounded-b-[14px] bg-gradient-to-b from-[#c9ced8] via-[#8a909c] to-[#4b505b] shadow-[0_20px_40px_-12px_rgba(0,0,0,.8)]">
        <span className="absolute top-0 left-1/2 h-[40%] w-[14%] -translate-x-1/2 rounded-b-md bg-[#5d626d]" />
      </div>
    </div>
  );
}

export function Phone({ src, alt, className = '', children }: { src?: string; alt?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative aspect-[9/19.2] rounded-[18%/8.5%] bg-gradient-to-b from-[#454a55] to-[#16181e] p-[3.2%] shadow-[0_40px_70px_-25px_rgba(0,0,0,.95),inset_0_0_0_1px_rgba(255,255,255,.12)] ${className}`}>
      <div className="relative size-full overflow-hidden rounded-[15%/7%] bg-black">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" className="size-full object-cover object-top" />
        ) : (
          children
        )}
        <span className="absolute top-[1.6%] left-1/2 h-[3.4%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent" />
      </div>
    </div>
  );
}
