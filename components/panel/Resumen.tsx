'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui';
import type { Ctx } from './Panel';
import { api, type Appt, Badge, Card, Empty, fmt12, money, STAGE_COLOR, STAGE_LABEL, STATUS_COLOR, STATUS_LABEL, waLink } from './kit';

type Data = {
  today: string; label: string;
  kpis: { hoy: number; semana: number; pendientes: number; nuevos30: number; realizadas30: number; asistencia: number | null; ganados30: number;
    pipeline: number; ganadoMonto: number; visitas30: number; visitasCitas30: number; citasWeb30: number; conversion: number | null };
  serie: { date: string; visitas: number; citas: number }[];
  stages: { stage: string; n: number; v: number }[];
  proximas: Appt[];
  seguimiento: { id: number; name: string; business: string; phone: string; stage: string; next_follow: string }[];
};

export default function Resumen({ ctx }: { ctx: Ctx }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api<Data>('resumen').then(setD).catch((e) => setErr(e.message));
  }, []);
  if (err) return <Empty>{err}</Empty>;
  if (!d) return <div className="h-64 animate-pulse rounded-2xl bg-white/[.03]" />;
  const k = d.kpis;
  const max = Math.max(1, ...d.serie.map((s) => s.visitas));
  const order = ['nuevo', 'contactado', 'agendado', 'propuesta', 'ganado', 'perdido'];
  const totalLeads = d.stages.reduce((a, s) => a + Number(s.n), 0) || 1;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-dim">{d.label}</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Resumen de ventas</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Llamadas hoy" value={k.hoy} note={`${k.semana} en los próximos 7 días`} />
        <Kpi label="Por confirmar" value={k.pendientes} note="Escríbeles por WhatsApp" accent={k.pendientes > 0} />
        <Kpi label="Prospectos nuevos" value={k.nuevos30} note="Últimos 30 días" />
        <Kpi label="Ventas cerradas" value={k.ganados30} note={`${money(k.ganadoMonto)} en 30 días`} />
        <Kpi label="Asistencia" value={k.asistencia == null ? '—' : `${k.asistencia}%`} note={`${k.realizadas30} ${k.realizadas30 === 1 ? 'llamada realizada' : 'llamadas realizadas'}`} />
        <Kpi label="En negociación" value={money(k.pipeline)} note="Agendados y con propuesta" />
        <Kpi label="Visitantes del sitio" value={k.visitas30} note="Últimos 30 días" />
        <Kpi label="Conversión de /citas" value={k.conversion == null ? '—' : `${k.conversion}%`} note={`${k.citasWeb30} citas de ${k.visitasCitas30} visitas`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card title="Próximas llamadas" className="xl:col-span-3" action={<button type="button" onClick={() => ctx.go('agenda')} className="text-sm text-accent hover:underline">Ver agenda</button>}>
          {d.proximas.length ? (
            <ul className="divide-y divide-line">
              {d.proximas.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-20 shrink-0 text-sm">
                    <p className="font-semibold text-ink tabular-nums">{fmt12(a.time)}</p>
                    <p className="text-xs text-dim">{a.date === d.today ? 'Hoy' : a.label.split(' ').slice(0, 2).join(' ')}</p>
                  </div>
                  <button type="button" onClick={() => ctx.go('prospectos', { lead: a.lead_id })} className="min-w-0 flex-1 text-left">
                    <p className="truncate font-medium text-ink">{a.lead_name}{a.lead_business ? ` · ${a.lead_business}` : ''}</p>
                    <p className="truncate text-sm text-muted">{a.type_name} · {a.medium_label}</p>
                  </button>
                  <Badge className={STATUS_COLOR[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Sin llamadas próximas. Comparte atumedidatech.online/citas en tus anuncios y estados.</Empty>
          )}
        </Card>

        <Card title="Embudo de prospectos" className="xl:col-span-2">
          <ul className="space-y-3">
            {order.map((s) => {
              const row = d.stages.find((x) => x.stage === s);
              const n = Number(row?.n || 0);
              return (
                <li key={s}>
                  <button type="button" onClick={() => ctx.go('prospectos')} className="w-full text-left">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted">{STAGE_LABEL[s]}</span>
                      <span className="font-semibold text-ink tabular-nums">{n}{row?.v ? <span className="ml-2 font-normal text-dim">{money(row.v)}</span> : null}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[.05]">
                      <div className={`h-full rounded-full ${s === 'ganado' ? 'bg-emerald-400' : s === 'perdido' ? 'bg-white/20' : 'bg-accent'}`} style={{ width: `${(n / totalLeads) * 100}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card title="Visitas y citas, últimos 14 días" className="xl:col-span-3">
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label={`Visitas por día: ${d.serie.map((s) => s.visitas).join(', ')}`}>
            {d.serie.map((s) => (
              <div key={s.date} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="w-full rounded-t-md bg-accent/70 transition group-hover:bg-accent" style={{ height: `${(s.visitas / max) * 100}%`, minHeight: s.visitas ? 3 : 0 }} />
                {s.citas > 0 && <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-emerald-400" />}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-bg px-2 py-1 text-xs whitespace-nowrap text-ink ring-1 ring-line group-hover:block">
                  {s.date.slice(8)}/{s.date.slice(5, 7)}: {s.visitas} visitas, {s.citas} citas
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-dim">
            <span>{d.serie[0]?.date.slice(8)}/{d.serie[0]?.date.slice(5, 7)}</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent/70" />Visitantes</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" />Día con citas nuevas</span>
            </span>
            <span>Hoy</span>
          </div>
        </Card>

        <Card title="Seguimientos para hoy" className="xl:col-span-2">
          {d.seguimiento.length ? (
            <ul className="divide-y divide-line">
              {d.seguimiento.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <button type="button" onClick={() => ctx.go('prospectos', { lead: l.id })} className="min-w-0 flex-1 text-left">
                    <p className="truncate font-medium text-ink">{l.name}</p>
                    <p className="truncate text-sm text-muted">
                      <Badge className={`${STAGE_COLOR[l.stage]} mr-2`}>{STAGE_LABEL[l.stage]}</Badge>
                      {l.next_follow < d.today ? 'Atrasado' : l.next_follow === d.today ? 'Hoy' : 'Mañana'}
                    </p>
                  </button>
                  {l.phone && (
                    <a href={waLink(l.phone, `Hola ${l.name.split(' ')[0]}, te escribe Joel de A TU MEDIDA TECH.`)} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full bg-wa/15 text-wa" aria-label={`Escribir a ${l.name} por WhatsApp`}>
                      <Icon name="arrowUpRight" className="size-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nada pendiente. Pon fecha de seguimiento a tus prospectos y aparecerán aquí.</Empty>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, note, accent }: { label: string; value: React.ReactNode; note?: string; accent?: boolean }) {
  return (
    <div className={`surface rounded-2xl p-4 ${accent ? 'border-amber-300/30' : ''}`}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums sm:text-[28px] ${accent ? 'text-amber-100' : 'text-ink'}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-dim">{note}</p>}
    </div>
  );
}
