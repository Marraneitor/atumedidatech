'use client';

import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { SITE } from '@/lib/config';
import { DUR, EASE, Icon, Logo, WhatsAppIcon } from '@/components/ui';

type MType = { id: number; name: string; description: string; duration: number; mediums: string[] };
type Info = { demo: boolean; owner: string; welcome: string; timezone: string; whatsapp: string; mediums: Record<string, string>; types: MType[] };
type Day = { date: string; label: string; slots: string[] };
type Done = { id: number; date: string; label: string; time: string; duration: number; medium: string; medium_label: string; type_name: string; name: string };

const INDUSTRIES = ['Consultorio o salud', 'Restaurante o comida', 'Tienda o comercio', 'Servicios profesionales', 'Belleza y estética', 'Hotel o turismo', 'Escuela o cursos', 'Otro giro'];
const INTERESTS = ['Página web', 'CRM con citas', 'Chatbot de WhatsApp', 'Sistema POS', 'Comerciales en video', 'Menú QR o tarjeta NFC', 'Tienda online', 'Todavía no sé'];
const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function MediumIcon({ m, className = 'size-4' }: { m: string; className?: string }) {
  if (m === 'whatsapp') return <WhatsAppIcon className={className} />;
  return <Icon name={m === 'llamada' ? 'phone' : m === 'presencial' ? 'users' : 'video'} className={className} />;
}

const fmt12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};
const dayParts = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { wd: WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], d, mo: MO[m - 1] };
};

/* Enlace para Google Calendar. México centro = UTC-6 todo el año. */
function gcalLink(a: Done) {
  const [y, m, d] = a.date.split('-').map(Number);
  const [hh, mm] = a.time.split(':').map(Number);
  const s = new Date(Date.UTC(y, m - 1, d, hh + 6, mm));
  const e = new Date(s.getTime() + a.duration * 60000);
  const f = (x: Date) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${a.type_name} · A TU MEDIDA TECH`,
    dates: `${f(s)}/${f(e)}`,
    details: `${a.medium_label}. Si necesitas moverla, escríbenos por WhatsApp: ${SITE.contact.waDisplay}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default function Booking() {
  const [info, setInfo] = useState<Info | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [step, setStep] = useState(0);
  const [type, setType] = useState<MType | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [medium, setMedium] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', business: '', industry: '', city: '', topic: '', website: '' });
  const [interests, setInterests] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    fetch('/api/citas/info')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Info) => {
        setInfo(d);
        const pre = new URLSearchParams(location.search).get('tema');
        const t = pre ? d.types.find((x) => x.name.toLowerCase().includes(pre.toLowerCase())) : null;
        if (t) pick(t);
      })
      .catch(() => setLoadErr('No pudimos cargar la agenda. Revisa tu conexión y vuelve a intentar, o escríbenos por WhatsApp.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(t: MType) {
    setType(t);
    setMedium(t.mediums[0] || 'llamada');
    setDays(null);
    setDate('');
    setTime('');
    setStep(1);
    loadDays(t);
  }
  function loadDays(t: MType) {
    fetch(`/api/citas/dias?tipo=${t.id}`)
      .then((r) => r.json())
      .then((d: { days: Day[] }) => {
        setDays(d.days);
        const first = d.days.find((x) => x.slots.length);
        if (first) setDate(first.date);
      })
      .catch(() => setDays([]));
  }

  const day = useMemo(() => days?.find((d) => d.date === date), [days, date]);
  const groups = useMemo(() => {
    const s = day?.slots || [];
    return [
      { label: 'Mañana', items: s.filter((t) => t < '12:00') },
      { label: 'Tarde', items: s.filter((t) => t >= '12:00' && t < '19:00') },
      { label: 'Noche', items: s.filter((t) => t >= '19:00') },
    ].filter((g) => g.items.length);
  }, [day]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (form.name.trim().length < 2) return setErr('Escribe tu nombre para saber con quién hablamos.');
    if (form.phone.replace(/\D/g, '').length < 10) return setErr('Revisa tu WhatsApp: necesita 10 dígitos, con lada.');
    setSending(true);
    try {
      const r = await fetch('/api/citas/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interests, type_id: type?.id, date, time, medium }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || 'No se pudo agendar. Intenta de nuevo.');
        if (/horario/.test(d.error || '') && type) {
          setTime('');
          loadDays(type);
          setStep(1);
        }
        return;
      }
      if (!d.appointment) {
        setErr('No se pudo agendar. Intenta de nuevo.');
        return;
      }
      setDone(d.appointment);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErr('Sin conexión. Revisa tu internet y vuelve a intentar.');
    } finally {
      setSending(false);
    }
  }

  const waNumber = info?.whatsapp || SITE.contact.whatsapp;
  const waConfirm = done
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Hola, soy ${done.name}. Acabo de agendar «${done.type_name}» para el ${done.label} a las ${fmt12(done.time)} (${done.medium_label}). Folio ${done.id}.`,
      )}`
    : '';

  const steps = ['Tema', 'Día y hora', 'Tus datos'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-x-clip">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_20%_0%,rgba(56,189,248,.16),transparent_70%)]" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pt-5 sm:px-6">
          <a href="/" aria-label="Ir al inicio de A TU MEDIDA TECH">
            <Logo />
          </a>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/[.04] px-4 text-sm font-medium text-ink transition hover:bg-white/[.08]">
            <WhatsAppIcon className="size-4 text-wa" />
            <span className="hidden sm:inline">{SITE.contact.waDisplay}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </header>

        <main className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:pt-16">
          <section className="min-w-0 lg:col-span-5">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[.08em] text-accent uppercase">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-accent" />
              Agenda en línea
            </span>
            <h1 className="mt-4 font-display text-[2.1rem] leading-[1.06] font-bold tracking-[-0.022em] text-balance sm:text-5xl">
              Agenda una llamada para hablar de tu negocio
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-pretty text-muted sm:text-lg">
              {info?.welcome || 'Elige el tema, el día y la hora. Te confirmamos por WhatsApp y platicamos sin compromiso.'}
            </p>
            <ul className="mt-8 space-y-4 text-[15px]">
              {[
                ['check', 'Sin costo y sin compromiso', 'Te decimos qué te conviene aunque al final no trabajemos juntos.'],
                ['monitor', 'Ejemplos reales de tu giro', 'Te mostramos páginas, CRMs y chatbots que ya funcionan.'],
                ['bolt', 'Precio claro desde la primera llamada', 'Páginas web desde $999 MXN. Sistemas a la medida con cotización por escrito.'],
              ].map(([ic, t, d]) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-white/[.03] text-accent">
                    <Icon name={ic} className="size-[18px]" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t}</span>
                    <span className="block text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-dim">Horarios en {(info?.timezone || "Hora del centro de México").replace(/^H/, "h")}.</p>
          </section>

          <section className="min-w-0 lg:col-span-7" aria-live="polite">
            <div className="surface rounded-3xl p-4 sm:p-7">
              {step < 3 && (
                <ol className="mb-6 flex items-center gap-2 text-[13px]" aria-label="Pasos">
                  {steps.map((s, i) => (
                    <li key={s} className="flex flex-1 items-center gap-2">
                      <button
                        type="button"
                        disabled={i > step || (i === 1 && !type) || (i === 2 && !time)}
                        onClick={() => setStep(i)}
                        aria-current={i === step ? 'step' : undefined}
                        className={`flex items-center gap-2 font-medium whitespace-nowrap transition ${i === step ? 'text-ink' : i < step ? 'text-muted hover:text-ink' : 'text-dim'}`}
                      >
                        <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${i < step ? 'bg-accent text-[#03111c]' : i === step ? 'border border-accent text-accent' : 'border border-white/20 text-dim'}`}>
                          {i < step ? <Icon name="check" className="size-3.5" /> : i + 1}
                        </span>
                        <span className={i === step ? '' : 'hidden sm:inline'}>{s}</span>
                      </button>
                      {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
                    </li>
                  ))}
                </ol>
              )}

              {info?.demo && step < 3 && (
                <p className="mb-5 rounded-xl border border-amber-300/30 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100">
                  Agenda en modo de prueba: las citas no se guardan todavía. Para asegurar tu lugar, escríbenos por WhatsApp.
                </p>
              )}

              {loadErr && <p className="rounded-xl border border-red-400/30 bg-red-400/[.06] px-4 py-3 text-sm text-red-100">{loadErr}</p>}
              {!info && !loadErr && <Skeleton />}

              <AnimatePresence mode="wait" initial={false}>
                {info && step === 0 && (
                  <Pane key="s0">
                    <h2 className="font-display text-xl font-bold tracking-[-0.012em]">¿De qué quieres hablar?</h2>
                    <div className="mt-4 grid gap-3">
                      {info.types.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => pick(t)}
                          className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${type?.id === t.id ? 'border-accent bg-accent/[.06]' : 'border-line bg-white/[.02] hover:border-white/25 hover:bg-white/[.05]'}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-semibold text-ink">{t.name}</span>
                              <span className="text-[13px] text-dim">{t.duration} min</span>
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted">{t.description}</span>
                            <span className="mt-3 flex flex-wrap gap-2 text-dim">
                              {t.mediums.map((m) => (
                                <span key={m} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs">
                                  <MediumIcon m={m} className="size-3.5" />
                                  {info.mediums[m] || m}
                                </span>
                              ))}
                            </span>
                          </span>
                          <Icon name="arrow" className="mt-1 size-5 shrink-0 text-dim transition group-hover:translate-x-0.5 group-hover:text-accent" />
                        </button>
                      ))}
                      {!info.types.length && <p className="text-muted">Por ahora no hay horarios abiertos. Escríbenos por WhatsApp y te atendemos.</p>}
                    </div>
                  </Pane>
                )}

                {info && step === 1 && type && (
                  <Pane key="s1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-xl font-bold tracking-[-0.012em]">Elige día y hora</h2>
                      <button type="button" onClick={() => setStep(0)} className="text-sm text-accent hover:underline">
                        {type.name} · {type.duration} min · Cambiar
                      </button>
                    </div>

                    {type.mediums.length > 1 && (
                      <fieldset className="mt-5">
                        <legend className="text-sm font-medium text-muted">¿Cómo prefieres platicar?</legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {type.mediums.map((m) => (
                            <label key={m} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${medium === m ? 'border-accent bg-accent/[.08] text-ink' : 'border-line text-muted hover:border-white/25'}`}>
                              <input type="radio" name="medium" value={m} checked={medium === m} onChange={() => setMedium(m)} className="sr-only" />
                              <MediumIcon m={m} />
                              {info.mediums[m] || m}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}

                    {!days && <Skeleton />}
                    {days && (
                      <>
                        <div className="-mx-4 mt-6 sm:-mx-7">
                          <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:px-7" role="listbox" aria-label="Días disponibles">
                            {days.map((d) => {
                              const p = dayParts(d.date);
                              const off = !d.slots.length;
                              const on = d.date === date;
                              return (
                                <button
                                  key={d.date}
                                  type="button"
                                  role="option"
                                  aria-selected={on}
                                  aria-label={`${d.label}${off ? ', sin horarios' : `, ${d.slots.length} horarios`}`}
                                  disabled={off}
                                  onClick={() => { setDate(d.date); setTime(''); }}
                                  className={`flex w-[68px] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition ${on ? 'border-accent bg-accent text-[#03111c]' : off ? 'border-transparent text-white/25' : 'border-line bg-white/[.02] text-ink hover:border-white/25'}`}
                                >
                                  <span className={`text-xs font-medium ${on ? '' : off ? '' : 'text-muted'}`}>{p.wd}</span>
                                  <span className="font-display text-xl font-bold">{p.d}</span>
                                  <span className={`text-xs ${on ? '' : off ? '' : 'text-dim'}`}>{p.mo}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {!days.some((d) => d.slots.length) ? (
                          <p className="mt-6 text-muted">No quedan horarios libres en estas semanas. Escríbenos por WhatsApp y buscamos un espacio.</p>
                        ) : (
                          <div className="mt-6 space-y-5">
                            <p className="text-sm font-medium text-ink">{day?.label}</p>
                            {groups.map((g) => (
                              <div key={g.label}>
                                <p className="text-xs font-medium tracking-[.08em] text-dim uppercase">{g.label}</p>
                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                  {g.items.map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      aria-pressed={time === t}
                                      onClick={() => setTime(t)}
                                      className={`h-11 rounded-xl border text-sm font-semibold tabular-nums transition ${time === t ? 'border-accent bg-accent text-[#03111c]' : 'border-line bg-white/[.02] text-ink hover:border-accent/60'}`}
                                    >
                                      {fmt12(t)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-7 flex justify-end">
                          <button
                            type="button"
                            disabled={!time}
                            onClick={() => setStep(2)}
                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-accent to-accent-2 px-6 text-[15px] font-semibold text-[#03111c] transition disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Continuar
                            <Icon name="arrow" className="size-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </Pane>
                )}

                {info && step === 2 && type && (
                  <Pane key="s2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-xl font-bold tracking-[-0.012em]">Tus datos</h2>
                      <button type="button" onClick={() => setStep(1)} className="text-sm text-accent hover:underline">
                        {day?.label} · {fmt12(time)} · Cambiar
                      </button>
                    </div>
                    <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
                      <Field label="Nombre" required>
                        <input value={form.name} onChange={set('name')} autoComplete="name" required maxLength={80} className={inp} />
                      </Field>
                      <Field label="WhatsApp" required hint="10 dígitos, con lada">
                        <input value={form.phone} onChange={set('phone')} type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} placeholder="922 123 4567" className={inp} />
                      </Field>
                      <Field label="Nombre de tu negocio">
                        <input value={form.business} onChange={set('business')} autoComplete="organization" maxLength={100} className={inp} />
                      </Field>
                      <Field label="Giro">
                        <select value={form.industry} onChange={set('industry')} className={inp}>
                          <option value="">Elige uno</option>
                          {INDUSTRIES.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </Field>
                      <Field label="Ciudad">
                        <input value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={60} className={inp} />
                      </Field>
                      <Field label="Correo" hint="Opcional">
                        <input value={form.email} onChange={set('email')} type="email" autoComplete="email" maxLength={120} className={inp} />
                      </Field>
                      <fieldset className="sm:col-span-2">
                        <legend className="text-sm font-medium text-muted">¿Qué te interesa?</legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {INTERESTS.map((x) => {
                            const on = interests.includes(x);
                            return (
                              <label key={x} className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${on ? 'border-accent bg-accent/[.08] text-ink' : 'border-line text-muted hover:border-white/25'}`}>
                                <input type="checkbox" className="sr-only" checked={on} onChange={() => setInterests((s) => (on ? s.filter((y) => y !== x) : [...s, x]))} />
                                {on && <Icon name="check" className="size-3.5 text-accent" />}
                                {x}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                      <Field label="¿Qué te gustaría resolver?" hint="Opcional" className="sm:col-span-2">
                        <textarea value={form.topic} onChange={set('topic')} rows={3} maxLength={600} placeholder="Ej. Quiero que mis pacientes agenden solos y que el WhatsApp conteste de noche." className={`${inp} h-auto py-3`} />
                      </Field>
                      <label className="absolute -left-[9999px]" aria-hidden>
                        Sitio web
                        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                      </label>
                      {err && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/[.06] px-4 py-3 text-sm text-red-100 sm:col-span-2">{err}</p>}
                      <div className="flex flex-col-reverse items-stretch gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-dim">Usamos tus datos solo para esta llamada. No enviamos publicidad.</p>
                        <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-accent to-accent-2 px-6 text-[15px] font-semibold text-[#03111c] transition disabled:opacity-60">
                          {sending ? 'Agendando…' : 'Confirmar mi llamada'}
                          {!sending && <Icon name="check" className="size-4" />}
                        </button>
                      </div>
                    </form>
                  </Pane>
                )}

                {step === 3 && done && (
                  <Pane key="s3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
                      <Icon name="calendar" className="size-6" />
                    </span>
                    <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">Listo, {done.name.split(' ')[0]}. Tu llamada quedó agendada.</h2>
                    <dl className="mt-6 grid gap-3 rounded-2xl border border-line bg-white/[.02] p-4 text-[15px] sm:grid-cols-2">
                      <Row k="Tema" v={done.type_name} />
                      <Row k="Cuándo" v={`${done.label}, ${fmt12(done.time)}`} />
                      <Row k="Cómo" v={done.medium_label} />
                      <Row k="Folio" v={String(done.id)} />
                    </dl>
                    <p className="mt-5 max-w-[58ch] text-muted">
                      Te escribimos por WhatsApp para confirmar{done.medium === 'meet' ? ' y mandarte el enlace de Google Meet' : ''}. Si avisas desde ahora, tu lugar queda confirmado más rápido.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a href={waConfirm} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-wa px-6 text-[15px] font-semibold text-[#03200f]">
                        <WhatsAppIcon />
                        Confirmar por WhatsApp
                      </a>
                      <a href={gcalLink(done)} target="_blank" rel="noopener noreferrer" className="surface inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-ink hover:bg-white/10">
                        <Icon name="calendar" className="size-4" />
                        Agregar a mi calendario
                      </a>
                    </div>
                    <a href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                      Ver proyectos mientras tanto
                      <Icon name="arrowUpRight" className="size-4" />
                    </a>
                  </Pane>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
        <footer className="relative mx-auto max-w-6xl border-t border-line px-4 py-6 text-sm text-dim sm:px-6">
          © {new Date().getFullYear()} A TU MEDIDA TECH · <a href="/" className="hover:text-ink">atumedidatech.online</a>
        </footer>
      </div>
    </MotionConfig>
  );
}

const inp = 'h-12 w-full rounded-xl border border-white/20 bg-white/[.03] px-4 text-[15px] text-ink placeholder:text-dim transition focus:border-accent focus:bg-white/[.05] focus:outline-none';

function Field({ label, hint, required, className = '', children }: { label: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-muted">
        <span>
          {label}
          {required && <span className="text-accent"> *</span>}
        </span>
        {hint && <span className="text-xs font-normal text-dim">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-[.08em] text-dim uppercase">{k}</dt>
      <dd className="mt-0.5 font-medium text-ink">{v}</dd>
    </div>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: DUR.slow, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="mt-4 space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[.04]" />)}
    </div>
  );
}
