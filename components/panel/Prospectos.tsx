'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon, WhatsAppIcon } from '@/components/ui';
import type { Ctx } from './Panel';
import { ApptDrawer, NewAppt } from './Agenda';
import { api, ApiError, type Appt, Badge, btnGhost, btnPrimary, Drawer, Empty, Field, fmt12, inp, type Lead, money, phonePretty, SOURCE_LABEL, STAGE_COLOR, STAGE_LABEL, STATUS_COLOR, STATUS_LABEL, waLink } from './kit';

const STAGES = Object.keys(STAGE_LABEL);
const INDUSTRIES = ['Consultorio o salud', 'Restaurante o comida', 'Tienda o comercio', 'Servicios profesionales', 'Belleza y estética', 'Hotel o turismo', 'Escuela o cursos', 'Otro giro'];

export default function Prospectos({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [items, setItems] = useState<Lead[] | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api<{ items: Lead[] }>(`prospectos?q=${encodeURIComponent(q)}${stage ? `&etapa=${stage}` : ''}`)
      .then((d) => setItems(d.items))
      .catch((e) => ctx.toast(e.message));
  }, [q, stage, ctx]);
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);
  useEffect(() => {
    if (ctx.openLead) {
      setSel(ctx.openLead);
      ctx.clearLead();
    }
  }, [ctx]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Prospectos</h1>
        <div className="flex gap-2">
          <a href="/api/panel/exportar" className={btnGhost}>Exportar a Excel</a>
          <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
            <Icon name="users" className="size-4" />
            Nuevo prospecto
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Buscar</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, negocio, teléfono o correo" className={`${inp} pl-10`} />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {['', ...STAGES].map((s) => (
            <button key={s || 'todos'} type="button" onClick={() => setStage(s)} aria-pressed={stage === s} className={`h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition ${stage === s ? 'bg-ink text-bg' : 'border border-line text-muted hover:text-ink'}`}>
              {s ? STAGE_LABEL[s] : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {!items && <div className="h-48 animate-pulse rounded-2xl bg-white/[.03]" />}
      {items && !items.length && <Empty>{q || stage ? 'Nadie coincide con la búsqueda.' : 'Aún no hay prospectos. Llegan solos cuando alguien agenda en /citas.'}</Empty>}
      {items && !!items.length && (
        <div className="surface overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-line text-xs tracking-[.08em] text-dim uppercase md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Prospecto</th>
                <th className="px-4 py-3 font-medium">Interés</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Seguimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((l) => (
                <tr key={l.id} onClick={() => setSel(l.id)} className="cursor-pointer transition hover:bg-white/[.03]">
                  <td className="px-4 py-3.5">
                    <button type="button" className="text-left" onClick={(e) => { e.stopPropagation(); setSel(l.id); }}>
                      <span className="block font-medium text-ink">{l.name}</span>
                      <span className="block text-muted">{[l.business, l.city].filter(Boolean).join(' · ') || phonePretty(l.phone)}</span>
                    </button>
                    <span className="mt-2 flex flex-wrap gap-2 md:hidden">
                      <Badge className={STAGE_COLOR[l.stage]}>{STAGE_LABEL[l.stage]}</Badge>
                      {!!l.value && <Badge className="bg-white/[.06] text-muted">{money(l.value)}</Badge>}
                    </span>
                  </td>
                  <td className="hidden max-w-[220px] truncate px-4 py-3.5 text-muted md:table-cell">{l.interests.split(',').filter(Boolean).join(', ') || '—'}</td>
                  <td className="hidden px-4 py-3.5 md:table-cell"><Badge className={STAGE_COLOR[l.stage]}>{STAGE_LABEL[l.stage]}</Badge></td>
                  <td className="hidden px-4 py-3.5 text-right text-ink tabular-nums md:table-cell">{l.value ? money(l.value) : '—'}</td>
                  <td className="hidden px-4 py-3.5 text-muted md:table-cell">{l.next_follow || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LeadDrawer id={sel} onClose={() => setSel(null)} onChanged={load} ctx={ctx} />
      <NewLead open={creating} onClose={() => setCreating(false)} onDone={(id) => { setCreating(false); load(); setSel(id); ctx.toast('Prospecto guardado'); }} />
    </div>
  );
}

type Activity = { id: number; kind: string; body: string; created_at: string };

function LeadDrawer({ id, onClose, onChanged, ctx }: { id: number | null; onClose: () => void; onChanged: () => void; ctx: Ctx }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [f, setF] = useState<Lead | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(false);
  const [appt, setAppt] = useState<Appt | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    api<{ lead: Lead; activity: Activity[]; appointments: Appt[] }>(`prospectos/${id}`).then((d) => {
      setLead(d.lead);
      setF(d.lead);
      setActivity(d.activity);
      setAppts(d.appointments);
    }).catch((e) => ctx.toast(e.message));
  }, [id, ctx]);
  useEffect(() => {
    setLead(null);
    load();
  }, [load]);

  if (!id) return null;
  const set = (k: keyof Lead) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => f && setF({ ...f, [k]: e.target.value });

  async function save(extra?: Partial<Lead>) {
    if (!f) return;
    setBusy(true);
    try {
      const b = { ...f, ...extra };
      await api(`prospectos/${id}`, { method: 'PATCH', body: { name: b.name, phone: b.phone, email: b.email, business: b.business, industry: b.industry, city: b.city, interests: b.interests, stage: b.stage, value: b.value, source: b.source, notes: b.notes, next_follow: b.next_follow } });
      ctx.toast('Cambios guardados');
      load();
      onChanged();
    } catch (e) {
      ctx.toast(e instanceof ApiError ? e.message : 'No se guardó');
    } finally {
      setBusy(false);
    }
  }
  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await api(`prospectos/${id}/nota`, { body: { body: note } });
    setNote('');
    load();
  }
  async function remove() {
    if (!lead || !confirm(`¿Borrar a ${lead.name} con sus llamadas y notas? No se puede deshacer.`)) return;
    await api(`prospectos/${id}`, { method: 'DELETE' });
    onChanged();
    onClose();
    ctx.toast('Prospecto borrado');
  }

  return (
    <Drawer open onClose={onClose} title={lead?.name || 'Prospecto'}>
      {!f || !lead ? (
        <div className="h-48 animate-pulse rounded-2xl bg-white/[.03]" />
      ) : (
        <div className="space-y-7">
          <div className="flex flex-wrap gap-2">
            {lead.phone && (
              <a href={waLink(lead.phone, `Hola ${lead.name.split(' ')[0]}, te escribe Joel de A TU MEDIDA TECH.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-wa px-4 text-sm font-semibold text-[#03200f]">
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            )}
            <button type="button" onClick={() => setBooking(true)} className={btnGhost}>
              <Icon name="calendar" className="size-4" />
              Agendar llamada
            </button>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-muted">Etapa</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button key={s} type="button" disabled={busy} aria-pressed={lead.stage === s} onClick={() => save({ stage: s })} className={`h-9 rounded-full px-3.5 text-sm font-medium transition ${lead.stage === s ? STAGE_COLOR[s] + ' ring-1 ring-white/20' : 'border border-line text-muted hover:text-ink'}`}>
                  {STAGE_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid grid-cols-2 gap-3">
            <Field label="Nombre" className="col-span-2"><input value={f.name} onChange={set('name')} className={inp} /></Field>
            <Field label="WhatsApp"><input value={f.phone} onChange={set('phone')} inputMode="tel" className={inp} /></Field>
            <Field label="Correo"><input value={f.email} onChange={set('email')} type="email" className={inp} /></Field>
            <Field label="Negocio"><input value={f.business} onChange={set('business')} className={inp} /></Field>
            <Field label="Giro">
              <select value={f.industry} onChange={set('industry')} className={inp}>
                <option value="">—</option>
                {[...new Set([...INDUSTRIES, f.industry].filter(Boolean))].map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Ciudad"><input value={f.city} onChange={set('city')} className={inp} /></Field>
            <Field label="Origen">
              <select value={f.source} onChange={set('source')} className={inp}>
                {[...new Set([...Object.keys(SOURCE_LABEL), f.source])].map((x) => <option key={x} value={x}>{SOURCE_LABEL[x] || x}</option>)}
              </select>
            </Field>
            <Field label="Valor estimado" hint="MXN"><input value={f.value || ''} onChange={set('value')} inputMode="numeric" className={inp} /></Field>
            <Field label="Próximo seguimiento"><input type="date" value={f.next_follow} onChange={set('next_follow')} className={inp} /></Field>
            <Field label="Le interesa" hint="Separado por comas" className="col-span-2"><input value={f.interests} onChange={set('interests')} className={inp} /></Field>
            <Field label="Notas" className="col-span-2"><textarea rows={3} value={f.notes} onChange={set('notes')} className={`${inp} h-auto py-2.5`} /></Field>
            <div className="col-span-2 flex justify-end"><button disabled={busy} className={btnPrimary}>Guardar cambios</button></div>
          </form>

          <section>
            <h3 className="mb-2 text-[13px] font-medium text-muted">Llamadas</h3>
            {appts.length ? (
              <ul className="surface divide-y divide-line rounded-xl">
                {appts.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => setAppt(a)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left text-sm hover:bg-white/[.03]">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{a.label}, {fmt12(a.time)}</span>
                        <span className="block truncate text-muted">{a.type_name} · {a.medium_label}</span>
                      </span>
                      <Badge className={STATUS_COLOR[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Empty>Sin llamadas todavía.</Empty>}
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-medium text-muted">Historial</h3>
            <form onSubmit={addNote} className="flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Agregar nota: le mandé la propuesta, pidió descuento…" className={inp} />
              <button disabled={!note.trim()} className={btnGhost}>Agregar</button>
            </form>
            <ol className="mt-4 space-y-3 border-l border-line pl-4">
              {activity.map((x) => (
                <li key={x.id} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-accent/70" />
                  <p className="text-ink">{x.body}</p>
                  <p className="text-xs text-dim">{x.created_at.slice(0, 16).replace(' ', ' · ')}</p>
                </li>
              ))}
            </ol>
          </section>

          <p className="text-xs text-dim">Alta: {lead.created_at.slice(0, 10)} · Origen: {SOURCE_LABEL[lead.source] || lead.source} · Folio {lead.id}</p>
          <button type="button" onClick={remove} className="text-sm text-red-200 hover:underline">Borrar prospecto</button>
        </div>
      )}
      <NewAppt open={booking} lead={lead ? { id: lead.id, name: lead.name } : undefined} onClose={() => setBooking(false)} onDone={() => { setBooking(false); load(); onChanged(); ctx.toast('Llamada agendada'); }} />
      <ApptDrawer appt={appt} onClose={() => setAppt(null)} onChanged={load} ctx={ctx} />
    </Drawer>
  );
}

function NewLead({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (id: number) => void }) {
  const empty = { name: '', phone: '', email: '', business: '', industry: '', city: '', interests: '', source: 'whatsapp', value: '', notes: '' };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const d = await api<{ id: number }>('prospectos', { body: f });
      setF(empty);
      onDone(d.id);
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : 'No se guardó');
    }
  }
  return (
    <Drawer open={open} onClose={onClose} title="Nuevo prospecto">
      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        <Field label="Nombre" className="col-span-2"><input required value={f.name} onChange={set('name')} className={inp} /></Field>
        <Field label="WhatsApp"><input value={f.phone} onChange={set('phone')} inputMode="tel" className={inp} /></Field>
        <Field label="Correo"><input value={f.email} onChange={set('email')} type="email" className={inp} /></Field>
        <Field label="Negocio"><input value={f.business} onChange={set('business')} className={inp} /></Field>
        <Field label="Giro">
          <select value={f.industry} onChange={set('industry')} className={inp}>
            <option value="">—</option>
            {INDUSTRIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Ciudad"><input value={f.city} onChange={set('city')} className={inp} /></Field>
        <Field label="Origen">
          <select value={f.source} onChange={set('source')} className={inp}>
            {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Le interesa" hint="Separado por comas" className="col-span-2"><input value={f.interests} onChange={set('interests')} placeholder="Página web, CRM" className={inp} /></Field>
        <Field label="Valor estimado" hint="MXN"><input value={f.value} onChange={set('value')} inputMode="numeric" className={inp} /></Field>
        <Field label="Notas" className="col-span-2"><textarea rows={3} value={f.notes} onChange={set('notes')} className={`${inp} h-auto py-2.5`} /></Field>
        {err && <p role="alert" className="col-span-2 text-sm text-red-200">{err}</p>}
        <div className="col-span-2 flex justify-end"><button className={btnPrimary}>Guardar</button></div>
      </form>
    </Drawer>
  );
}
