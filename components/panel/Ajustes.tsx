'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/ui';
import type { Ctx } from './Panel';
import { api, ApiError, btnGhost, btnPrimary, Card, Empty, Field, inp, todayMx } from './kit';

type Hours = { weekday: number; open: number; start: string; end: string; break_start: string; break_end: string };
type Config = { owner: string; whatsapp: string; slot_step: number; min_notice_hours: number; horizon_days: number; meet_link: string; welcome: string };
type MType = { id: number; name: string; description: string; duration: number; mediums: string; active: number; sort: number };
const WD = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const tinp = inp.replace('h-11 w-full', 'h-10 w-[136px]').replace('px-3.5', 'px-3');

export default function Ajustes({ ctx }: { ctx: Ctx }) {
  const [hours, setHours] = useState<Hours[]>([]);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [blocked, setBlocked] = useState<{ date: string; reason: string }[]>([]);
  const [blk, setBlk] = useState({ date: todayMx(), until: '', reason: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ hours: Hours[]; blocked: { date: string; reason: string }[]; config: Config }>('disponibilidad').then((d) => {
      setHours(d.hours);
      setBlocked(d.blocked);
      setCfg(d.config);
    }).catch((e) => ctx.toast(e.message));
  }, [ctx]);
  useEffect(load, [load]);

  const setH = (wd: number, k: keyof Hours, v: string | number) => setHours((hs) => hs.map((h) => (h.weekday === wd ? { ...h, [k]: v } : h)));

  async function saveAll() {
    setBusy(true);
    try {
      await api('disponibilidad', { method: 'PUT', body: { hours, config: cfg } });
      ctx.toast('Horario guardado');
    } catch (e) {
      ctx.toast(e instanceof ApiError ? e.message : 'No se guardó');
    } finally {
      setBusy(false);
    }
  }
  async function block(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('bloqueos', { body: blk });
      setBlk({ date: todayMx(), until: '', reason: '' });
      load();
      ctx.toast('Días bloqueados');
    } catch (x) {
      ctx.toast(x instanceof ApiError ? x.message : 'No se guardó');
    }
  }
  const link = typeof window !== 'undefined' ? `${location.origin}/citas` : '/citas';

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Horarios y ajustes</h1>

      <Card title="Tu enlace para agendar">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input readOnly value={link} className={`${inp} font-medium`} onFocus={(e) => e.target.select()} aria-label="Enlace de la página de citas" />
          <button type="button" className={btnGhost} onClick={() => navigator.clipboard?.writeText(link).then(() => ctx.toast('Enlace copiado'))}>
            <Icon name="copy" className="size-4" />
            Copiar
          </button>
        </div>
        <p className="mt-2 text-sm text-dim">Ponlo en tu bio de Instagram, en tus anuncios y en la respuesta automática de WhatsApp. Con ?tema=demo abre directo la demo del CRM.</p>
      </Card>

      <Card title="Horario de atención" action={<button type="button" disabled={busy} onClick={saveAll} className={btnPrimary}>Guardar</button>}>
        <div className="space-y-2">
          {ORDER.map((wd) => {
            const h = hours.find((x) => x.weekday === wd);
            if (!h) return null;
            return (
              <div key={wd} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 rounded-xl border border-line px-3 py-3 sm:grid-cols-[140px_1fr]">
                <label className="flex items-center gap-3 text-sm font-medium text-ink">
                  <input type="checkbox" checked={!!h.open} onChange={(e) => setH(wd, 'open', e.target.checked ? 1 : 0)} className="size-5 accent-sky-400" />
                  {WD[wd]}
                </label>
                {h.open ? (
                  <div className="col-span-2 flex flex-wrap items-center gap-2 text-sm text-muted sm:col-span-1">
                    <input type="time" value={h.start || ''} onChange={(e) => setH(wd, 'start', e.target.value)} className={tinp} aria-label={`${WD[wd]}: abre`} />
                    a
                    <input type="time" value={h.end || ''} onChange={(e) => setH(wd, 'end', e.target.value)} className={tinp} aria-label={`${WD[wd]}: cierra`} />
                    <span className="ml-1 text-dim">Descanso</span>
                    <input type="time" value={h.break_start || ''} onChange={(e) => setH(wd, 'break_start', e.target.value)} className={tinp} aria-label={`${WD[wd]}: inicio de descanso`} />
                    a
                    <input type="time" value={h.break_end || ''} onChange={(e) => setH(wd, 'break_end', e.target.value)} className={tinp} aria-label={`${WD[wd]}: fin de descanso`} />
                  </div>
                ) : (
                  <span className="text-right text-sm text-dim sm:text-left">Sin llamadas</span>
                )}
              </div>
            );
          })}
        </div>
        {cfg && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Field label="Cada cuánto empieza una llamada" hint="min">
              <select value={cfg.slot_step} onChange={(e) => setCfg({ ...cfg, slot_step: Number(e.target.value) })} className={inp}>
                {[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>Cada {n} minutos</option>)}
              </select>
            </Field>
            <Field label="Anticipación mínima" hint="horas">
              <input type="number" min={0} max={72} value={cfg.min_notice_hours} onChange={(e) => setCfg({ ...cfg, min_notice_hours: Number(e.target.value) })} className={inp} />
            </Field>
            <Field label="Se puede agendar hasta" hint="días">
              <input type="number" min={1} max={90} value={cfg.horizon_days} onChange={(e) => setCfg({ ...cfg, horizon_days: Number(e.target.value) })} className={inp} />
            </Field>
            <Field label="Enlace fijo de Google Meet" hint="Opcional" className="sm:col-span-2">
              <input value={cfg.meet_link} onChange={(e) => setCfg({ ...cfg, meet_link: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" className={inp} />
            </Field>
            <Field label="WhatsApp que recibe avisos">
              <input value={cfg.whatsapp} onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })} inputMode="tel" className={inp} />
            </Field>
            <Field label="Mensaje de bienvenida en /citas" className="sm:col-span-3">
              <textarea rows={2} value={cfg.welcome} onChange={(e) => setCfg({ ...cfg, welcome: e.target.value })} maxLength={300} className={`${inp} h-auto py-2.5`} />
            </Field>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button type="button" disabled={busy} onClick={saveAll} className={btnPrimary}>Guardar horario y ajustes</button>
        </div>
      </Card>

      <Card title="Días sin llamadas">
        <form onSubmit={block} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <Field label="Desde"><input type="date" required value={blk.date} onChange={(e) => setBlk({ ...blk, date: e.target.value })} className={inp} /></Field>
          <Field label="Hasta" hint="Opcional"><input type="date" value={blk.until} min={blk.date} onChange={(e) => setBlk({ ...blk, until: e.target.value })} className={inp} /></Field>
          <Field label="Motivo"><input value={blk.reason} onChange={(e) => setBlk({ ...blk, reason: e.target.value })} placeholder="Vacaciones, evento, grabación…" className={inp} /></Field>
          <button className={`${btnGhost} h-11`}>Bloquear</button>
        </form>
        <ul className="mt-4 flex flex-wrap gap-2">
          {blocked.map((b) => (
            <li key={b.date} className="inline-flex items-center gap-2 rounded-full border border-line py-1 pr-1 pl-3.5 text-sm">
              <span className="text-ink tabular-nums">{b.date}</span>
              {b.reason && <span className="text-dim">{b.reason}</span>}
              <button type="button" onClick={() => api(`bloqueos/${b.date}`, { method: 'DELETE' }).then(load)} className="grid size-7 place-items-center rounded-full hover:bg-white/10" aria-label={`Desbloquear ${b.date}`}>
                <Icon name="close" className="size-3.5" />
              </button>
            </li>
          ))}
          {!blocked.length && <li className="text-sm text-dim">Ningún día bloqueado.</li>}
        </ul>
      </Card>

      <Tipos ctx={ctx} />
      <Password ctx={ctx} />
    </div>
  );
}

function Tipos({ ctx }: { ctx: Ctx }) {
  const [items, setItems] = useState<MType[] | null>(null);
  const [mediums, setMediums] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<Partial<MType> | null>(null);
  const load = useCallback(() => {
    api<{ items: MType[]; mediums: Record<string, string> }>('tipos').then((d) => {
      setItems(d.items);
      setMediums(d.mediums);
    });
  }, []);
  useEffect(load, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    try {
      await api(edit.id ? `tipos/${edit.id}` : 'tipos', { method: edit.id ? 'PATCH' : 'POST', body: { ...edit, active: edit.active !== 0 } });
      setEdit(null);
      load();
      ctx.toast('Tema guardado');
    } catch (x) {
      ctx.toast(x instanceof ApiError ? x.message : 'No se guardó');
    }
  }
  async function del(t: MType) {
    if (!confirm(`¿Quitar «${t.name}»?`)) return;
    const d = await api<{ archived: boolean }>(`tipos/${t.id}`, { method: 'DELETE' });
    ctx.toast(d.archived ? 'Tenía llamadas: quedó oculto en vez de borrarse' : 'Tema borrado');
    load();
  }
  const ms = (edit?.mediums || '').split(',').filter(Boolean);

  return (
    <Card title="Temas de llamada" action={<button type="button" onClick={() => setEdit({ name: '', description: '', duration: 30, mediums: 'meet,whatsapp,llamada', active: 1, sort: (items?.length || 0) })} className={btnGhost}>Agregar tema</button>}>
      {!items ? null : !items.length ? <Empty>Agrega al menos un tema para que la gente pueda agendar.</Empty> : (
        <ul className="divide-y divide-line">
          {items.map((t) => (
            <li key={t.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${t.active ? 'text-ink' : 'text-dim line-through'}`}>{t.name} <span className="font-normal text-dim">· {t.duration} min</span></p>
                <p className="text-sm text-muted">{t.description}</p>
                <p className="mt-1 text-xs text-dim">{t.mediums.split(',').map((m) => mediums[m] || m).join(' · ')}</p>
              </div>
              <button type="button" onClick={() => setEdit(t)} className="text-sm text-accent hover:underline">Editar</button>
              <button type="button" onClick={() => del(t)} className="text-sm text-dim hover:text-red-200">Quitar</button>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <form onSubmit={save} className="mt-5 grid gap-3 rounded-xl border border-accent/40 p-4 sm:grid-cols-4">
          <Field label="Nombre" className="sm:col-span-3"><input required value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inp} /></Field>
          <Field label="Duración" hint="min"><input type="number" min={10} max={180} step={5} value={edit.duration || 30} onChange={(e) => setEdit({ ...edit, duration: Number(e.target.value) })} className={inp} /></Field>
          <Field label="Descripción" className="sm:col-span-4"><textarea rows={2} maxLength={400} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className={`${inp} h-auto py-2.5`} /></Field>
          <fieldset className="sm:col-span-4">
            <legend className="mb-1.5 text-[13px] font-medium text-muted">Medios</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mediums).map(([k, v]) => (
                <label key={k} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm ${ms.includes(k) ? 'border-accent bg-accent/[.08] text-ink' : 'border-line text-muted'}`}>
                  <input type="checkbox" className="sr-only" checked={ms.includes(k)} onChange={() => setEdit({ ...edit, mediums: (ms.includes(k) ? ms.filter((x) => x !== k) : [...ms, k]).join(',') })} />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
            <input type="checkbox" checked={edit.active !== 0} onChange={(e) => setEdit({ ...edit, active: e.target.checked ? 1 : 0 })} className="size-4 accent-sky-400" />
            Visible en la página de citas
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setEdit(null)} className={btnGhost}>Cancelar</button>
            <button className={btnPrimary}>Guardar tema</button>
          </div>
        </form>
      )}
    </Card>
  );
}

function Password({ ctx }: { ctx: Ctx }) {
  const [f, setF] = useState({ current: '', next: '' });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('password', { method: 'PUT', body: f });
      setF({ current: '', next: '' });
      ctx.toast('Contraseña cambiada. Se cerró la sesión en otros equipos.');
    } catch (x) {
      ctx.toast(x instanceof ApiError ? x.message : 'No se guardó');
    }
  }
  return (
    <Card title="Contraseña del panel">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Actual"><input type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} className={inp} /></Field>
        <Field label="Nueva" hint="8 o más caracteres"><input type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} className={inp} /></Field>
        <button disabled={!f.current || f.next.length < 8} className={`${btnPrimary} h-11`}>Cambiar</button>
      </form>
    </Card>
  );
}
