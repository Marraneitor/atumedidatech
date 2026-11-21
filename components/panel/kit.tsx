'use client';

/* Piezas compartidas del panel: llamadas a la API, formatos y controles. */
import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui';

export class ApiError extends Error {
  constructor(msg: string, public status: number) {
    super(msg);
  }
}

export async function api<T = Record<string, unknown>>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch('/api/panel/' + path, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== 'login') window.dispatchEvent(new Event('atm-logout'));
  if (!r.ok) throw new ApiError(d.error || 'Algo falló. Intenta de nuevo.', r.status);
  return d as T;
}

export type Appt = {
  id: number; lead_id: number; type_id: number; date: string; time: string; duration: number; medium: string; medium_label: string;
  status: string; topic: string; notes: string; meet_link: string; source: string; created_at: string; label: string;
  lead_name: string; lead_phone: string; lead_email: string; lead_business: string; lead_stage: string; type_name: string;
};
export type Lead = {
  id: number; name: string; phone: string; email: string; business: string; industry: string; city: string; interests: string;
  stage: string; value: number; source: string; notes: string; next_follow: string; created_at: string; updated_at: string;
  last_appt?: string; appts?: number;
};

export const STAGE_LABEL: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', agendado: 'Llamada agendada', propuesta: 'Propuesta enviada', ganado: 'Ganado', perdido: 'Perdido',
};
export const STAGE_COLOR: Record<string, string> = {
  nuevo: 'bg-sky-400/15 text-sky-200', contactado: 'bg-white/10 text-ink', agendado: 'bg-accent/20 text-sky-100',
  propuesta: 'bg-amber-300/15 text-amber-100', ganado: 'bg-emerald-400/15 text-emerald-200', perdido: 'bg-white/[.06] text-dim',
};
export const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Por confirmar', confirmada: 'Confirmada', realizada: 'Realizada', 'no asistió': 'No asistió', cancelada: 'Cancelada',
};
export const STATUS_COLOR: Record<string, string> = {
  pendiente: 'bg-amber-300/15 text-amber-100', confirmada: 'bg-accent/20 text-sky-100', realizada: 'bg-emerald-400/15 text-emerald-200',
  'no asistió': 'bg-red-400/15 text-red-200', cancelada: 'bg-white/[.06] text-dim',
};
export const SOURCE_LABEL: Record<string, string> = { web: 'Página de citas', whatsapp: 'WhatsApp', panel: 'Panel', referido: 'Referido', facebook: 'Facebook', instagram: 'Instagram' };

export const fmt12 = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};
export const money = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0);
export const phonePretty = (p: string) => {
  const d = (p || '').replace(/\D/g, '');
  const l = d.slice(-10);
  return l.length === 10 ? `${l.slice(0, 3)} ${l.slice(3, 6)} ${l.slice(6)}` : p;
};
/** Número para wa.me: si son 10 dígitos se asume México (52). */
export const waNum = (p: string) => {
  const d = (p || '').replace(/\D/g, '');
  return d.length === 10 ? '52' + d : d;
};
export const waLink = (p: string, text = '') => `https://wa.me/${waNum(p)}${text ? '?text=' + encodeURIComponent(text) : ''}`;

export const todayMx = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>{children}</span>;
}

export const inp = 'h-11 w-full rounded-xl border border-white/20 bg-white/[.03] px-3.5 text-sm text-ink placeholder:text-dim transition focus:border-accent focus:bg-white/[.05] focus:outline-none disabled:opacity-50';
export const btn = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50';
export const btnPrimary = `${btn} bg-accent text-[#03111c] hover:bg-sky-300`;
export const btnGhost = `${btn} border border-line bg-white/[.03] text-ink hover:bg-white/[.08]`;

export function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-muted">
        {label}
        {hint && <span className="text-xs font-normal text-dim">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Card({ title, action, className = '', children }: { title?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`surface rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-base font-bold tracking-[-0.012em]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Panel lateral (en celular ocupa la pantalla). Cierra con Esc o tocando fuera. */
export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="relative flex h-full w-full max-w-xl flex-col border-l border-line bg-bg-2 outline-none">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="truncate font-display text-lg font-bold tracking-[-0.012em]">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-line hover:bg-white/[.06]" aria-label="Cerrar">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-dim">{children}</p>;
}

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div role="status" className="glass-float fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] left-1/2 z-[90] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium text-ink lg:bottom-6">
      {msg}
    </div>
  );
}
