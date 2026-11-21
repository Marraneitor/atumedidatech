'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon, WhatsAppIcon } from '@/components/ui';
import type { Ctx } from './Panel';
import { addDays, api, ApiError, type Appt, Badge, btnGhost, btnPrimary, Drawer, Empty, Field, fmt12, inp, phonePretty, STATUS_COLOR, STATUS_LABEL, todayMx, waLink } from './kit';

type MType = { id: number; name: string; duration: number; mediums: string; active: number };

const RANGES = [
  { id: 'proximas', label: 'Próximas', from: 0, days: 30 },
  { id: 'semana', label: 'Esta semana', from: 0, days: 7 },
  { id: 'pasadas', label: 'Pasadas', from: -30, days: 30 },
];

export function reminderText(a: Appt) {
  const first = a.lead_name.split(' ')[0];
  const link = a.meet_link ? `\nEnlace: ${a.meet_link}` : '';
  return `Hola ${first}, te escribe Joel de A TU MEDIDA TECH. Te confirmo nuestra llamada «${a.type_name}» el ${a.label.toLowerCase()} a las ${fmt12(a.time)} (${a.medium_label}).${link}\n¿Sigue en pie?`;
}

export default function Agenda({ ctx }: { ctx: Ctx }) {
  const [range, setRange] = useState(RANGES[0]);
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<Appt[] | null>(null);
  const [sel, setSel] = useState<Appt | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    const t = todayMx();
    const from = addDays(t, range.from);
    const to = range.from < 0 ? addDays(t, -1) : addDays(t, range.days - 1);
    api<{ items: Appt[] }>(`citas?desde=${from}&hasta=${to}${status ? `&estado=${encodeURIComponent(status)}` : ''}`)
      .then((d) => setItems(range.from < 0 ? d.items.reverse() : d.items))
      .catch((e) => ctx.toast(e.message));
  }, [range, status, ctx]);
  useEffect(load, [load]);

  const byDay = useMemo(() => {
    const m = new Map<string, Appt[]>();
    for (const a of items || []) m.set(a.date, [...(m.get(a.date) || []), a]);
    return [...m.entries()];
  }, [items]);
  const today = todayMx();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Agenda</h1>
        <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
          <Icon name="calendar" className="size-4" />
          Agendar llamada
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button key={r.id} type="button" onClick={() => setRange(r)} aria-pressed={range.id === r.id} className={`h-9 rounded-full px-3.5 text-sm font-medium transition ${range.id === r.id ? 'bg-ink text-bg' : 'border border-line text-muted hover:text-ink'}`}>
            {r.label}
          </button>
        ))}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inp} ml-auto h-9 w-auto rounded-full`} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {!items && <div className="h-48 animate-pulse rounded-2xl bg-white/[.03]" />}
      {items && !items.length && <Empty>No hay llamadas en este rango.</Empty>}
      <div className="space-y-6">
        {byDay.map(([date, list]) => (
          <section key={date}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
              {date === today && <Badge className="bg-accent text-[#03111c]">Hoy</Badge>}
              {list[0].label}
            </h2>
            <ul className="surface divide-y divide-line overflow-hidden rounded-2xl">
              {list.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => setSel(a)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[.03]">
                    <div className="w-[72px] shrink-0">
                      <p className="font-semibold text-ink tabular-nums">{fmt12(a.time)}</p>
                      <p className="text-xs text-dim">{a.duration} min</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{a.lead_name}{a.lead_business ? <span className="text-muted"> · {a.lead_business}</span> : null}</p>
                      <p className="truncate text-sm text-muted">{a.type_name} · {a.medium_label}</p>
                    </div>
                    <Badge className={STATUS_COLOR[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <ApptDrawer appt={sel} onClose={() => setSel(null)} onChanged={() => { load(); }} ctx={ctx} />
      <NewAppt open={creating} onClose={() => setCreating(false)} onDone={() => { setCreating(false); load(); ctx.toast('Llamada agendada'); }} />
    </div>
  );
}

export function ApptDrawer({ appt, onClose, onChanged, ctx }: { appt: Appt | null; onClose: () => void; onChanged: () => void; ctx: Ctx }) {
  const [a, setA] = useState<Appt | null>(appt);
  const [edit, setEdit] = useState({ date: '', time: '', notes: '', meet_link: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setA(appt);
    if (appt) setEdit({ date: appt.date, time: appt.time, notes: appt.notes || '', meet_link: appt.meet_link || '' });
  }, [appt]);
  if (!a) return null;

  async function patch(body: Record<string, unknown>, msg: string) {
    if (!a) return;
    setBusy(true);
    try {
      const d = await api<{ item: Appt }>(`citas/${a.id}`, { method: 'PATCH', body });
      setA(d.item);
      onChanged();
      ctx.toast(msg);
    } catch (e) {
      ctx.toast(e instanceof ApiError ? e.message : 'No se guardó');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!a || !confirm('¿Borrar esta llamada? No se puede deshacer. Si solo no se hará, márcala como cancelada.')) return;
    await api(`citas/${a.id}`, { method: 'DELETE' });
    onChanged();
    onClose();
    ctx.toast('Llamada borrada');
  }

  return (
    <Drawer open={!!a} onClose={onClose} title={a.lead_name}>
      <div className="space-y-6">
        <div className="space-y-1 text-[15px]">
          <p className="font-semibold text-ink">{a.label}, {fmt12(a.time)} · {a.duration} min</p>
          <p className="text-muted">{a.type_name} · {a.medium_label}</p>
          {a.lead_business && <p className="text-muted">{a.lead_business}</p>}
          <p className="text-muted">{phonePretty(a.lead_phone)}{a.lead_email ? ` · ${a.lead_email}` : ''}</p>
          {a.topic && <p className="mt-3 rounded-xl border border-line bg-white/[.02] p-3 text-sm text-ink">«{a.topic}»</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {a.lead_phone && (
            <a href={waLink(a.lead_phone, reminderText(a))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-wa px-4 text-sm font-semibold text-[#03200f]">
              <WhatsAppIcon className="size-4" />
              Confirmar por WhatsApp
            </a>
          )}
          {a.lead_phone && (
            <a href={`tel:+${a.lead_phone.length === 10 ? '52' + a.lead_phone : a.lead_phone}`} className={btnGhost}>
              <Icon name="phone" className="size-4" />
              Llamar
            </a>
          )}
          <button type="button" onClick={() => { onClose(); ctx.go('prospectos', { lead: a.lead_id }); }} className={btnGhost}>
            <Icon name="users" className="size-4" />
            Ver prospecto
          </button>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-muted">Estado</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <button key={k} type="button" disabled={busy} onClick={() => patch({ status: k }, `Marcada como ${v.toLowerCase()}`)} aria-pressed={a.status === k} className={`h-9 rounded-full px-3.5 text-sm font-medium transition ${a.status === k ? STATUS_COLOR[k] + ' ring-1 ring-white/20' : 'border border-line text-muted hover:text-ink'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha"><input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} className={inp} /></Field>
          <Field label="Hora"><input type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} className={inp} /></Field>
          <Field label="Enlace de la reunión" hint="Meet o Zoom" className="col-span-2">
            <input value={edit.meet_link} onChange={(e) => setEdit({ ...edit, meet_link: e.target.value })} placeholder="https://meet.google.com/…" className={inp} />
          </Field>
          <Field label="Notas de la llamada" className="col-span-2">
            <textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={4} className={`${inp} h-auto py-2.5`} placeholder="Qué necesita, presupuesto, siguiente paso…" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={remove} className="text-sm text-red-200 hover:underline">Borrar llamada</button>
          <button type="button" disabled={busy} onClick={() => patch(edit, 'Cambios guardados')} className={btnPrimary}>Guardar cambios</button>
        </div>
      </div>
    </Drawer>
  );
}

export function NewAppt({ open, onClose, onDone, lead }: { open: boolean; onClose: () => void; onDone: () => void; lead?: { id: number; name: string } }) {
  const [types, setTypes] = useState<MType[]>([]);
  const [mediums, setMediums] = useState<Record<string, string>>({});
  const [f, setF] = useState({ name: '', phone: '', business: '', type_id: '', date: todayMx(), time: '10:00', medium: '', topic: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setErr('');
    api<{ items: MType[]; mediums: Record<string, string> }>('tipos').then((d) => {
      const act = d.items.filter((t) => t.active);
      setTypes(act);
      setMediums(d.mediums);
      setF((x) => ({ ...x, type_id: x.type_id || String(act[0]?.id || ''), medium: x.medium || act[0]?.mediums.split(',')[0] || 'llamada' }));
    });
  }, [open]);
  const t = types.find((x) => String(x.id) === f.type_id);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('citas', { body: { ...f, lead_id: lead?.id } });
      setF((x) => ({ ...x, name: '', phone: '', business: '', topic: '' }));
      onDone();
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : 'No se guardó');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Drawer open={open} onClose={onClose} title={lead ? `Agendar con ${lead.name}` : 'Agendar llamada'}>
      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        {!lead && (
          <>
            <Field label="Nombre" className="col-span-2"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inp} /></Field>
            <Field label="WhatsApp"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" className={inp} /></Field>
            <Field label="Negocio"><input value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} className={inp} /></Field>
          </>
        )}
        <Field label="Tema" className="col-span-2">
          <select value={f.type_id} onChange={(e) => setF({ ...f, type_id: e.target.value })} className={inp}>
            {types.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.duration} min</option>)}
          </select>
        </Field>
        <Field label="Fecha"><input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inp} /></Field>
        <Field label="Hora"><input type="time" required value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} className={inp} /></Field>
        <Field label="Medio" className="col-span-2">
          <select value={f.medium} onChange={(e) => setF({ ...f, medium: e.target.value })} className={inp}>
            {(t?.mediums.split(',') || Object.keys(mediums)).map((m) => <option key={m} value={m}>{mediums[m] || m}</option>)}
          </select>
        </Field>
        <Field label="Notas" className="col-span-2"><textarea rows={3} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} className={`${inp} h-auto py-2.5`} /></Field>
        <p className="col-span-2 text-xs text-dim">Desde el panel puedes agendar fuera de tu horario o encimar llamadas.</p>
        {err && <p role="alert" className="col-span-2 text-sm text-red-200">{err}</p>}
        <div className="col-span-2 flex justify-end"><button disabled={busy} className={btnPrimary}>Agendar</button></div>
      </form>
    </Drawer>
  );
}
