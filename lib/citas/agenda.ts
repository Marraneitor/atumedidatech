/* Agenda: horarios libres, reservas y prospectos. Todo en hora del centro de México. */
import { db, getConfig, newToken } from './db';

export const TZ = 'America/Mexico_City';
export const pad = (n: number) => String(n).padStart(2, '0');
export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const toTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Fecha y minuto actuales en México, sin depender de la zona del servidor. */
export function nowMx() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, min: Number(parts.hour) * 60 + Number(parts.minute) };
}
/** Suma días a una fecha ISO (YYYY-MM-DD). */
export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}
export const weekday = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
export function prettyDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  const w = DAYS[weekday(iso)];
  return `${w[0].toUpperCase() + w.slice(1)} ${d} de ${MONTHS[m - 1]}`;
}
export const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isTime = (s: unknown): s is string => typeof s === 'string' && /^\d{2}:\d{2}$/.test(s);

type Hours = { weekday: number; open: number; start: string; end: string; break_start: string; break_end: string };
type Ctx = { hours: Hours[]; blocked: Set<string>; appts: { date: string; time: string; duration: number }[]; step: number; notice: number };

async function ctxFor(from: string, to: string): Promise<Ctx> {
  const [hours, blocked, appts, cfg] = await Promise.all([
    db.all<Hours>('SELECT * FROM atm_hours'),
    db.all<{ date: string }>('SELECT date FROM atm_blocked WHERE date>=? AND date<=?', from, to),
    db.all<{ date: string; time: string; duration: number }>(
      "SELECT date,time,duration FROM atm_appointments WHERE date>=? AND date<=? AND status NOT IN ('cancelada')", from, to),
    getConfig(),
  ]);
  return { hours, blocked: new Set(blocked.map((b) => b.date)), appts, step: Number(cfg.slot_step) || 30, notice: Number(cfg.min_notice_hours) || 0 };
}

function slotsFor(date: string, duration: number, ctx: Ctx) {
  const now = nowMx();
  if (date < now.date || ctx.blocked.has(date)) return [];
  const h = ctx.hours.find((x) => x.weekday === weekday(date));
  if (!h || !h.open || !h.start || !h.end) return [];
  const busy = ctx.appts.filter((a) => a.date === date).map((a) => [toMin(a.time), toMin(a.time) + Number(a.duration)]);
  if (h.break_start && h.break_end) busy.push([toMin(h.break_start), toMin(h.break_end)]);
  // Anticipación mínima: se cuenta en minutos desde ahora, aunque cruce de día.
  const daysAhead = Math.round((Date.parse(date) - Date.parse(now.date)) / 86400000);
  const earliest = now.min + ctx.notice * 60 - daysAhead * 1440;
  const out: string[] = [];
  for (let t = toMin(h.start); t + duration <= toMin(h.end); t += ctx.step) {
    if (t < earliest) continue;
    if (busy.some(([s, e]) => t < e && t + duration > s)) continue;
    out.push(toTime(t));
  }
  return out;
}

export async function availableSlots(date: string, duration: number) {
  if (!isDate(date)) return [];
  return slotsFor(date, duration, await ctxFor(date, date));
}

/** Días del horizonte con su disponibilidad (para el calendario público). */
export async function calendar(duration: number) {
  const cfg = await getConfig();
  const start = nowMx().date;
  const days = Math.min(Math.max(Number(cfg.horizon_days) || 21, 1), 90);
  const end = addDays(start, days - 1);
  const ctx = await ctxFor(start, end);
  const out: { date: string; label: string; slots: string[] }[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    out.push({ date: d, label: prettyDate(d), slots: slotsFor(d, duration, ctx) });
  }
  return out;
}

export const digits = (p: unknown) => String(p ?? '').replace(/\D/g, '');
const last10 = (p: unknown) => digits(p).slice(-10);

export type LeadInput = { name: string; phone?: string; email?: string; business?: string; industry?: string; city?: string; interests?: string; source?: string };

export async function findOrCreateLead(x: LeadInput) {
  const ph = last10(x.phone);
  let lead = ph.length >= 8
    ? (await db.all<{ id: number; phone: string; email: string; business: string; industry: string; city: string; interests: string }>(
        "SELECT id,phone,email,business,industry,city,interests FROM atm_leads WHERE phone<>''")).find((l) => last10(l.phone) === ph)
    : undefined;
  if (!lead && x.email) lead = await db.get('SELECT id,phone,email,business,industry,city,interests FROM atm_leads WHERE lower(email)=lower(?)', x.email);
  if (lead) {
    const merged = Array.from(new Set([...(lead.interests || '').split(','), ...(x.interests || '').split(',')].map((s) => s.trim()).filter(Boolean))).join(',');
    await db.run(
      "UPDATE atm_leads SET email=COALESCE(NULLIF(email,''),?), business=COALESCE(NULLIF(business,''),?), industry=COALESCE(NULLIF(industry,''),?), city=COALESCE(NULLIF(city,''),?), interests=?, updated_at=datetime('now','-6 hours') WHERE id=?",
      x.email || '', x.business || '', x.industry || '', x.city || '', merged, lead.id,
    );
    return lead.id;
  }
  const r = await db.run(
    'INSERT INTO atm_leads(name,phone,email,business,industry,city,interests,source) VALUES(?,?,?,?,?,?,?,?)',
    x.name || 'Sin nombre', digits(x.phone), x.email || '', x.business || '', x.industry || '', x.city || '', x.interests || '', x.source || 'web',
  );
  await logActivity(r.id, 'alta', `Prospecto nuevo desde ${x.source || 'web'}`);
  return r.id;
}

export async function logActivity(leadId: number, kind: string, body: string) {
  await db.run('INSERT INTO atm_activity(lead_id,kind,body) VALUES(?,?,?)', leadId, kind, body);
}

export type BookInput = LeadInput & { type_id: number; date: string; time: string; medium?: string; topic?: string; status?: string; notes?: string; lead_id?: number; force?: boolean };

export class UserError extends Error {}

export async function book(x: BookInput) {
  const type = await db.get<{ id: number; name: string; duration: number; mediums: string; active: number }>('SELECT * FROM atm_meeting_types WHERE id=?', Number(x.type_id));
  if (!type) throw new UserError('Elige el tema de la llamada.');
  if (!isDate(x.date) || !isTime(x.time)) throw new UserError('Elige un día y una hora.');
  const medium = (x.medium || type.mediums.split(',')[0] || 'llamada').trim();
  if (!x.force) {
    if (!type.active) throw new UserError('Ese tema ya no está disponible, elige otro.');
    if (!(await availableSlots(x.date, type.duration)).includes(x.time)) throw new UserError('Ese horario se acaba de ocupar. Elige otro, por favor.');
  }
  const leadId = x.lead_id || (await findOrCreateLead(x));
  if (!x.force) {
    const open = await db.get<{ n: number }>(
      "SELECT COUNT(*) n FROM atm_appointments WHERE lead_id=? AND status IN ('pendiente','confirmada') AND date>=?", leadId, nowMx().date);
    if ((open?.n || 0) >= 2) throw new UserError('Ya tienes dos llamadas agendadas. Si quieres cambiar una, escríbenos por WhatsApp.');
  }
  const cfg = await getConfig();
  const token = newToken(12);
  const r = await db.run(
    'INSERT INTO atm_appointments(lead_id,type_id,date,time,duration,medium,status,topic,notes,meet_link,source,token) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
    leadId, type.id, x.date, x.time, type.duration, medium, x.status || 'pendiente', x.topic || '', x.notes || '',
    medium === 'meet' ? cfg.meet_link : '', x.source || 'web', token,
  );
  await db.run(
    "UPDATE atm_leads SET stage=CASE WHEN stage IN ('nuevo','contactado') THEN 'agendado' ELSE stage END, updated_at=datetime('now','-6 hours') WHERE id=?", leadId);
  await logActivity(leadId, 'cita', `Agendó «${type.name}» para el ${prettyDate(x.date)} a las ${x.time} (${MEDIUM_LABEL[medium] || medium})`);
  return getAppointment(r.id);
}

export const MEDIUM_LABEL: Record<string, string> = {
  llamada: 'Llamada telefónica',
  whatsapp: 'Videollamada por WhatsApp',
  meet: 'Google Meet',
  zoom: 'Zoom',
  presencial: 'En persona',
};

export type Appointment = {
  id: number; lead_id: number; type_id: number; date: string; time: string; duration: number; medium: string; status: string;
  topic: string; notes: string; meet_link: string; source: string; token: string; created_at: string;
  lead_name: string; lead_phone: string; lead_email: string; lead_business: string; lead_stage: string; type_name: string;
};

export const APPT_SELECT = `SELECT a.*, l.name lead_name, l.phone lead_phone, l.email lead_email, l.business lead_business, l.stage lead_stage, t.name type_name
  FROM atm_appointments a LEFT JOIN atm_leads l ON l.id=a.lead_id LEFT JOIN atm_meeting_types t ON t.id=a.type_id`;

export async function getAppointment(id: number) {
  return db.get<Appointment>(`${APPT_SELECT} WHERE a.id=?`, id);
}
