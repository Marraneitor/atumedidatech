'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon, Logo } from '@/components/ui';
import { api, ApiError, btnPrimary, inp, Toast } from './kit';
import Resumen from './Resumen';
import Agenda from './Agenda';
import Prospectos from './Prospectos';
import Ajustes from './Ajustes';
import Conversaciones from './Conversaciones';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'chart' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'prospectos', label: 'Prospectos', icon: 'users' },
  { id: 'chats', label: 'Conversaciones', short: 'Chats', icon: 'chat' },
  { id: 'ajustes', label: 'Horarios y ajustes', short: 'Ajustes', icon: 'cog' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export type Ctx = { toast: (m: string) => void; go: (t: Tab, extra?: { lead?: number }) => void; openLead: number | null; clearLead: () => void };

export default function Panel() {
  const [state, setState] = useState<'cargando' | 'login' | 'dentro'>('cargando');
  const [demo, setDemo] = useState(false);
  const [noPassword, setNoPassword] = useState(false);
  const [tab, setTab] = useState<Tab>('resumen');
  const [msg, setMsg] = useState('');
  const [openLead, setOpenLead] = useState<number | null>(null);

  useEffect(() => {
    api<{ ok: boolean; demo: boolean; hasPassword: boolean }>('sesion')
      .then((s) => {
        setDemo(s.demo);
        setNoPassword(!s.hasPassword);
        setState(s.ok ? 'dentro' : 'login');
      })
      .catch(() => setState('login'));
    const h = location.hash.slice(1) as Tab;
    if (TABS.some((t) => t.id === h)) setTab(h);
    const out = () => setState('login');
    window.addEventListener('atm-logout', out);
    return () => window.removeEventListener('atm-logout', out);
  }, []);

  const go = useCallback((t: Tab, extra?: { lead?: number }) => {
    setTab(t);
    history.replaceState(null, '', '#' + t);
    if (extra?.lead) setOpenLead(extra.lead);
    window.scrollTo({ top: 0 });
  }, []);
  const ctx: Ctx = { toast: setMsg, go, openLead, clearLead: () => setOpenLead(null) };

  if (state === 'cargando') return <div className="grid min-h-dvh place-items-center text-dim">Cargando…</div>;
  if (state === 'login') return <Login demo={demo} noPassword={noPassword} onIn={() => setState('dentro')} />;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-bg-2/60 px-4 py-5 lg:flex">
        <a href="/" className="px-2"><Logo /></a>
        <p className="mt-2 px-2 text-xs font-medium tracking-[.08em] text-dim uppercase">Panel de ventas</p>
        <nav className="mt-8 space-y-1" aria-label="Secciones">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${tab === t.id ? 'bg-white/[.07] text-ink' : 'text-muted hover:bg-white/[.04] hover:text-ink'}`}
            >
              <Icon name={t.icon} className={`size-[18px] ${tab === t.id ? 'text-accent' : ''}`} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <a href="/citas" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-white/[.04] hover:text-ink">
            <Icon name="arrowUpRight" className="size-[18px]" />
            Ver página de citas
          </a>
          <button type="button" onClick={() => api('logout', { body: {} }).finally(() => setState('login'))} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-white/[.04] hover:text-ink">
            <Icon name="close" className="size-[18px]" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-10">
        <header className="glass-float sticky top-0 z-40 flex items-center justify-between gap-3 border-x-0 border-t-0 px-4 py-3 lg:hidden">
          <a href="/"><Logo /></a>
          <div className="flex items-center gap-2">
            <a href="/citas" target="_blank" className="grid size-10 place-items-center rounded-full border border-line" aria-label="Ver página de citas">
              <Icon name="arrowUpRight" className="size-[18px]" />
            </a>
            <button type="button" onClick={() => api('logout', { body: {} }).finally(() => setState('login'))} className="h-10 rounded-full border border-line px-3.5 text-sm text-muted">
              Salir
            </button>
          </div>
        </header>
        {demo && (
          <p className="mx-4 mt-4 rounded-xl border border-amber-300/30 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100 sm:mx-6 lg:mx-8">
            Modo demostración: los datos son de ejemplo y se borran solos. Para guardar citas reales conecta la base de Turso en Vercel (instrucciones en CITAS.md).
          </p>
        )}
        <main className="px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          {tab === 'resumen' && <Resumen ctx={ctx} />}
          {tab === 'agenda' && <Agenda ctx={ctx} />}
          {tab === 'prospectos' && <Prospectos ctx={ctx} />}
          {tab === 'chats' && <Conversaciones ctx={ctx} />}
          {tab === 'ajustes' && <Ajustes ctx={ctx} />}
        </main>
      </div>

      <nav className="glass-float fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${tab === t.id ? 'text-accent' : 'text-muted'}`}>
            <Icon name={t.icon} className="size-5" />
            {'short' in t ? t.short : t.label}
          </button>
        ))}
      </nav>
      <Toast msg={msg} onDone={() => setMsg('')} />
    </div>
  );
}

function Login({ demo, noPassword, onIn }: { demo: boolean; noPassword: boolean; onIn: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('login', { body: { password: pw } });
      onIn();
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : 'Sin conexión. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="surface w-full max-w-sm rounded-3xl p-6 sm:p-8">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-bold tracking-[-0.012em]">Panel de ventas</h1>
        <p className="mt-2 text-sm text-muted">Tu agenda de llamadas, prospectos y horarios.</p>
        {noPassword && !demo && (
          <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100">
            Falta la contraseña del panel. Agrégala en Vercel como PANEL_PASSWORD y vuelve a publicar.
          </p>
        )}
        <label className="mt-6 block">
          <span className="mb-1.5 block text-[13px] font-medium text-muted">Contraseña</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus className={inp} />
        </label>
        {demo && <p className="mt-2 text-xs text-dim">Modo demostración: la contraseña es «demo».</p>}
        {err && <p role="alert" className="mt-4 text-sm text-red-200">{err}</p>}
        <button type="submit" disabled={busy || !pw} className={`${btnPrimary} mt-6 h-12 w-full`}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
