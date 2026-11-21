'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, WhatsAppIcon } from '@/components/ui';
import type { Ctx } from './Panel';
import { api, ApiError, Badge, btnGhost, Empty, inp, phonePretty, waLink } from './kit';

type Chat = {
  jid: string; name: string; phone: string; stage: string; data: string; paused_until: number; lead_id: number | null;
  last_ts: number; last_text: string; last_from: string; msgs: number; created_ts: number; unread: number;
};
type Msg = { id: number; sender: string; body: string; ts: number };
type List = { items: Chat[]; lastSync: number | null; connected: boolean; stats: { hoyIn: number; hoyBot: number; hoyHumano: number; hoyChats: number } };

const TZ = 'America/Mexico_City';
const hora = (ts: number) => new Date(ts).toLocaleTimeString('es-MX', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
const dia = (ts: number) => new Date(ts).toLocaleDateString('en-CA', { timeZone: TZ });
function cuando(ts: number) {
  if (!ts) return '';
  const hoy = dia(Date.now());
  const d = dia(ts);
  if (d === hoy) return hora(ts);
  if (d === dia(Date.now() - 86400000)) return 'Ayer';
  return new Date(ts).toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'short' });
}
function hace(ts: number | null) {
  if (!ts) return 'nunca';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} días`;
}
const datos = (c: Chat): Record<string, string> => {
  try {
    return JSON.parse(c.data || '{}');
  } catch {
    return {};
  }
};
const titulo = (c: Chat) => datos(c).nombre || c.name || (c.phone ? phonePretty(c.phone) : 'Sin nombre');
const FROM: Record<string, string> = { bot: 'Bot', humano: 'Tú', cliente: '', sistema: '' };

/* Formato de WhatsApp: *negritas* y _cursivas_ */
function Wa({ text }: { text: string }) {
  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\*[^*]+\*$/.test(p) ? <strong key={i}>{p.slice(1, -1)}</strong> : /^_[^_]+_$/.test(p) ? <em key={i}>{p.slice(1, -1)}</em> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default function Conversaciones({ ctx }: { ctx: Ctx }) {
  const [list, setList] = useState<List | null>(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);

  const load = useCallback(() => {
    api<List>(`chats?q=${encodeURIComponent(q)}`).then(setList).catch((e) => ctx.toast(e.message));
  }, [q, ctx]);
  useEffect(() => {
    const t = setTimeout(load, 200);
    const iv = setInterval(() => document.visibilityState === 'visible' && load(), 20000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [load]);

  const chat = list?.items.find((c) => c.jid === sel) || null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Conversaciones</h1>
          <p className="mt-1 text-sm text-dim">
            Lo que contesta el chatbot del WhatsApp. {list && (list.lastSync ? `Última sincronización ${hace(list.lastSync)}.` : 'El bot todavía no ha mandado conversaciones.')}
          </p>
        </div>
        {list && (
          <div className="flex gap-2 text-sm">
            <Stat n={list.stats.hoyChats} l="chats hoy" />
            <Stat n={list.stats.hoyIn} l="recibidos" />
            <Stat n={list.stats.hoyBot} l="del bot" />
            <Stat n={list.stats.hoyHumano} l="tuyos" />
          </div>
        )}
      </div>

      {list && !list.connected && (
        <p className="rounded-xl border border-amber-300/30 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100">
          Falta conectar el bot: agrega BOT_SYNC_KEY en Vercel y la misma clave en el .env del bot (ver CITAS.md).
        </p>
      )}

      <div className="grid gap-4 lg:h-[calc(100dvh-220px)] lg:min-h-[520px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={`surface flex min-h-0 flex-col overflow-hidden rounded-2xl ${sel ? 'hidden lg:flex' : 'flex'}`}>
          <label className="relative block border-b border-line p-3">
            <span className="sr-only">Buscar conversación</span>
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-dim" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, número o mensaje" className={`${inp} h-10 pl-10`} />
          </label>
          {!list && <div className="m-3 h-40 animate-pulse rounded-xl bg-white/[.03]" />}
          {list && !list.items.length && <div className="p-3"><Empty>{q ? 'Nada coincide con la búsqueda.' : 'Aún no hay conversaciones.'}</Empty></div>}
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
            {list?.items.map((c) => (
              <li key={c.jid}>
                <button type="button" onClick={() => setSel(c.jid)} aria-current={sel === c.jid} className={`flex w-full gap-3 px-4 py-3 text-left transition ${sel === c.jid ? 'bg-white/[.06]' : 'hover:bg-white/[.03]'}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent">
                    {titulo(c).replace(/^(Dra?\.|Lic\.|Ing\.)\s*/i, '').slice(0, 1).toUpperCase() || '?'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-ink">{titulo(c)}</span>
                      <span className={`shrink-0 text-xs ${c.unread ? 'text-accent' : 'text-dim'}`}>{cuando(c.last_ts)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-sm text-muted">
                        {FROM[c.last_from] ? <span className="text-dim">{FROM[c.last_from]}: </span> : null}
                        {c.last_text}
                      </span>
                      {c.unread > 0 && <span className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-[#03111c]">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={`surface min-h-0 overflow-hidden rounded-2xl ${sel ? 'flex h-[calc(100dvh-150px)] lg:h-auto' : 'hidden lg:flex'} flex-col`}>
          {chat ? <Hilo key={chat.jid} chat={chat} onBack={() => setSel(null)} onSeen={load} ctx={ctx} /> : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-dim">Elige una conversación para leerla.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <span className="rounded-xl border border-line px-3 py-1.5 text-center">
      <span className="block font-display text-lg leading-tight font-bold text-ink tabular-nums">{n}</span>
      <span className="block text-[11px] text-dim">{l}</span>
    </span>
  );
}

function Hilo({ chat, onBack, onSeen, ctx }: { chat: Chat; onBack: () => void; onSeen: () => void; ctx: Ctx }) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [lead, setLead] = useState<number | null>(chat.lead_id);
  const box = useRef<HTMLDivElement>(null);
  const lastTs = chat.last_ts;

  useEffect(() => {
    api<{ messages: Msg[] }>(`chats/${encodeURIComponent(chat.jid)}`)
      .then((d) => {
        setMsgs(d.messages);
        if (chat.unread) onSeen();
      })
      .catch((e) => ctx.toast(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.jid, lastTs]);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs]);

  const d = datos(chat);
  const paused = chat.paused_until > Date.now();
  const grupos = useMemo(() => {
    const out: { day: string; items: Msg[] }[] = [];
    for (const m of msgs || []) {
      const k = dia(m.ts);
      if (!out.length || out[out.length - 1].day !== k) out.push({ day: k, items: [] });
      out[out.length - 1].items.push(m);
    }
    return out;
  }, [msgs]);

  async function toLead() {
    try {
      const r = await api<{ id: number }>(`chats/${encodeURIComponent(chat.jid)}/prospecto`, { body: {} });
      setLead(r.id);
      ctx.go('prospectos', { lead: r.id });
    } catch (e) {
      ctx.toast(e instanceof ApiError ? e.message : 'No se pudo');
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <button type="button" onClick={onBack} className="grid size-9 place-items-center rounded-full border border-line lg:hidden" aria-label="Volver a la lista">
          <Icon name="arrow" className="size-4 rotate-180" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{titulo(chat)}</p>
          <p className="truncate text-xs text-dim">
            {[chat.phone ? phonePretty(chat.phone) : 'Número oculto por WhatsApp', d.consultorio || d.negocio, d.ciudad].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chat.stage && <Badge className="bg-white/[.06] text-muted capitalize">{chat.stage}</Badge>}
          {paused && <Badge className="bg-amber-300/15 text-amber-100">Bot en pausa</Badge>}
          {chat.phone && (
            <a href={waLink(chat.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-wa px-3.5 text-sm font-semibold text-[#03200f]">
              <WhatsAppIcon className="size-4" />
              <span className="hidden sm:inline">Abrir</span>
            </a>
          )}
          <button type="button" onClick={lead ? () => ctx.go('prospectos', { lead }) : toLead} className={`${btnGhost} h-9 min-h-9`}>
            <Icon name="users" className="size-4" />
            {lead ? 'Ver prospecto' : 'Agregar a prospectos'}
          </button>
        </div>
      </div>
      <div ref={box} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-black/20 px-3 py-4 sm:px-5">
        {!msgs && <div className="h-40 animate-pulse rounded-xl bg-white/[.03]" />}
        {grupos.map((g) => (
          <div key={g.day} className="space-y-1.5">
            <p className="py-2 text-center text-xs text-dim">
              {new Date(g.items[0].ts).toLocaleDateString('es-MX', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {g.items.map((m) =>
              m.sender === 'sistema' ? (
                <p key={m.id} className="mx-auto w-fit max-w-[90%] rounded-full bg-white/[.04] px-3 py-1 text-center text-xs text-dim">{m.body}</p>
              ) : (
                <div key={m.id} className={`flex ${m.sender === 'cliente' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-wrap sm:max-w-[70%] ${
                      m.sender === 'cliente' ? 'rounded-bl-md bg-white/[.07] text-ink' : m.sender === 'humano' ? 'rounded-br-md bg-emerald-500/20 text-ink' : 'rounded-br-md bg-accent/[.18] text-ink'
                    }`}
                  >
                    {m.sender !== 'cliente' && <p className={`mb-0.5 text-[11px] font-semibold ${m.sender === 'humano' ? 'text-emerald-200' : 'text-sky-200'}`}>{m.sender === 'humano' ? 'Tú' : 'Bot'}</p>}
                    <Wa text={m.body} />
                    <p className="mt-1 text-right text-[11px] text-dim">{hora(m.ts)}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
      <p className="border-t border-line px-4 py-2.5 text-xs text-dim">
        Para contestar tú, abre el chat en WhatsApp. El bot se pausa solo en ese chat cuando escribes desde tu celular.
      </p>
    </>
  );
}
