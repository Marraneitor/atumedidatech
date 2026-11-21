/* API privada del panel (/panel). Todo pide sesión, salvo el inicio de sesión. */
import { addDays, APPT_SELECT, book, digits, findOrCreateLead, getAppointment, isDate, isTime, logActivity, MEDIUM_LABEL, nowMx, prettyDate, UserError, type Appointment } from '@/lib/citas/agenda';
import { checkPassword, db, DEMO, getConfig, getSetting, hashPassword, newToken, setSetting, type Config } from '@/lib/citas/db';
import { body, COOKIE, fail, isAuthed, json, route, str, tokenOf } from '@/lib/citas/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STAGES = ['nuevo', 'contactado', 'agendado', 'propuesta', 'ganado', 'perdido'];
const STATUSES = ['pendiente', 'confirmada', 'realizada', 'no asistió', 'cancelada'];

// Intentos de inicio de sesión por IP (en memoria; basta para frenar adivinanzas).
const tries = new Map<string, { n: number; t: number }>();

const LEAD_FIELDS = ['name', 'phone', 'email', 'business', 'industry', 'city', 'interests', 'stage', 'value', 'source', 'notes', 'next_follow'] as const;

async function handle(req: Request, parts: string[]): Promise<Response> {
  const [r, id, sub] = parts;
  const m = req.method;

  if (r === 'login' && m === 'POST') {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
    const tr = tries.get(ip);
    if (tr && tr.n >= 8 && Date.now() - tr.t < 15 * 60_000) return fail('Demasiados intentos. Espera 15 minutos.', 429);
    const b = await body(req);
    const stored = await getSetting<string>('password');
    if (!stored) return fail('Falta definir la contraseña del panel: agrega PANEL_PASSWORD en Vercel (ver CITAS.md).', 503);
    if (!checkPassword(str(b.password, 200), stored)) {
      tries.set(ip, { n: (tr && Date.now() - tr.t < 15 * 60_000 ? tr.n : 0) + 1, t: Date.now() });
      return fail('Contraseña incorrecta.', 401);
    }
    tries.delete(ip);
    const token = newToken();
    await db.run('INSERT INTO atm_sessions(token) VALUES(?)', token);
    const res = json({ ok: true });
    res.headers.set('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}${process.env.VERCEL ? '; Secure' : ''}`);
    return res;
  }
  if (r === 'sesion') {
    const ok = await isAuthed(req);
    return json({ ok, demo: DEMO, hasPassword: !!(await getSetting('password')) });
  }

  if (!(await isAuthed(req))) return fail('Tu sesión terminó. Vuelve a entrar.', 401);

  if (r === 'logout') {
    await db.run('DELETE FROM atm_sessions WHERE token=?', tokenOf(req));
    const res = json({ ok: true });
    res.headers.set('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
    return res;
  }

  if (r === 'password' && m === 'PUT') {
    const b = await body(req);
    const stored = (await getSetting<string>('password')) || '';
    if (!checkPassword(str(b.current, 200), stored)) throw new UserError('La contraseña actual no coincide.');
    const pw = str(b.next, 200);
    if (pw.length < 8) throw new UserError('La nueva contraseña necesita al menos 8 caracteres.');
    await setSetting('password', hashPassword(pw));
    await db.run('DELETE FROM atm_sessions WHERE token<>?', tokenOf(req));
    return json({ ok: true });
  }

  /* ---------- Resumen ---------- */
  if (r === 'resumen') {
    const today = nowMx().date;
    const wkEnd = addDays(today, 6);
    const from30 = addDays(today, -29);
    const n = async (sql: string, ...p: unknown[]) => Number((await db.get<{ n: number }>(sql, ...p))?.n || 0);
    const [hoy, semana, pendientes, nuevos30, realizadas30, noShow30, ganados30, pipeline, ganadoMonto, visitas30, visitasCitas30, citasWeb30] = await Promise.all([
      n("SELECT COUNT(*) n FROM atm_appointments WHERE date=? AND status IN ('pendiente','confirmada')", today),
      n("SELECT COUNT(*) n FROM atm_appointments WHERE date>=? AND date<=? AND status IN ('pendiente','confirmada')", today, wkEnd),
      n("SELECT COUNT(*) n FROM atm_appointments WHERE date>=? AND status='pendiente'", today),
      n('SELECT COUNT(*) n FROM atm_leads WHERE substr(created_at,1,10)>=?', from30),
      n("SELECT COUNT(*) n FROM atm_appointments WHERE date>=? AND date<=? AND status='realizada'", from30, today),
      n("SELECT COUNT(*) n FROM atm_appointments WHERE date>=? AND date<=? AND status='no asistió'", from30, today),
      n("SELECT COUNT(*) n FROM atm_leads WHERE stage='ganado' AND substr(updated_at,1,10)>=?", from30),
      n("SELECT COALESCE(SUM(value),0) n FROM atm_leads WHERE stage IN ('agendado','propuesta')"),
      n("SELECT COALESCE(SUM(value),0) n FROM atm_leads WHERE stage='ganado' AND substr(updated_at,1,10)>=?", from30),
      n('SELECT COUNT(DISTINCT session) n FROM atm_visits WHERE substr(created_at,1,10)>=?', from30),
      n("SELECT COUNT(DISTINCT session) n FROM atm_visits WHERE path='/citas' AND substr(created_at,1,10)>=?", from30),
      n("SELECT COUNT(*) n FROM atm_appointments WHERE source='web' AND substr(created_at,1,10)>=?", from30),
    ]);
    const serie = [];
    const v14 = await db.all<{ d: string; n: number }>(
      'SELECT substr(created_at,1,10) d, COUNT(DISTINCT session) n FROM atm_visits WHERE substr(created_at,1,10)>=? GROUP BY d', addDays(today, -13));
    const c14 = await db.all<{ d: string; n: number }>(
      'SELECT substr(created_at,1,10) d, COUNT(*) n FROM atm_appointments WHERE substr(created_at,1,10)>=? GROUP BY d', addDays(today, -13));
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      serie.push({ date: d, visitas: Number(v14.find((x) => x.d === d)?.n || 0), citas: Number(c14.find((x) => x.d === d)?.n || 0) });
    }
    const stages = await db.all<{ stage: string; n: number; v: number }>('SELECT stage, COUNT(*) n, COALESCE(SUM(value),0) v FROM atm_leads GROUP BY stage');
    const proximas = await db.all<Appointment>(`${APPT_SELECT} WHERE a.date>=? AND a.status IN ('pendiente','confirmada') ORDER BY a.date,a.time LIMIT 6`, today);
    const seguimiento = await db.all(
      "SELECT id,name,business,phone,stage,next_follow FROM atm_leads WHERE next_follow<>'' AND next_follow<=? AND stage NOT IN ('ganado','perdido') ORDER BY next_follow LIMIT 8", addDays(today, 1));
    const asistencia = realizadas30 + noShow30 ? Math.round((realizadas30 / (realizadas30 + noShow30)) * 100) : null;
    return json({
      today, label: prettyDate(today),
      kpis: { hoy, semana, pendientes, nuevos30, realizadas30, asistencia, ganados30, pipeline, ganadoMonto, visitas30, visitasCitas30, citasWeb30,
        conversion: visitasCitas30 ? Math.round((citasWeb30 / visitasCitas30) * 100) : null },
      serie, stages, proximas: proximas.map(withLabels), seguimiento,
    });
  }

  /* ---------- Citas ---------- */
  if (r === 'citas') {
    if (m === 'GET' && !id) {
      const u = new URL(req.url);
      const from = u.searchParams.get('desde') || nowMx().date;
      const to = u.searchParams.get('hasta') || addDays(from, 30);
      const st = u.searchParams.get('estado');
      const rows = await db.all<Appointment>(
        `${APPT_SELECT} WHERE a.date>=? AND a.date<=? ${st ? 'AND a.status=?' : ''} ORDER BY a.date,a.time`, ...(st ? [from, to, st] : [from, to]));
      return json({ items: rows.map(withLabels) });
    }
    if (m === 'POST' && !id) {
      const b = await body(req);
      if (!b.lead_id && str(b.name).length < 2) throw new UserError('Escribe el nombre del prospecto.');
      const a = await book({
        lead_id: Number(b.lead_id) || undefined, name: str(b.name, 80), phone: str(b.phone, 20), email: str(b.email, 120),
        business: str(b.business, 100), type_id: Number(b.type_id), date: str(b.date, 10), time: str(b.time, 5),
        medium: str(b.medium, 20), topic: str(b.topic, 600), notes: str(b.notes, 2000), status: 'confirmada', source: 'panel', force: true,
      });
      return json({ ok: true, item: a && withLabels(a) });
    }
    const a = await getAppointment(Number(id));
    if (!a) return fail('No encontramos esa cita.', 404);
    if (m === 'PATCH') {
      const b = await body(req);
      const set: string[] = [];
      const vals: unknown[] = [];
      if (b.status !== undefined) {
        if (!STATUSES.includes(String(b.status))) throw new UserError('Estado no válido.');
        set.push('status=?'); vals.push(b.status);
      }
      if (b.date !== undefined || b.time !== undefined) {
        const d = str(b.date ?? a.date, 10), t = str(b.time ?? a.time, 5);
        if (!isDate(d) || !isTime(t)) throw new UserError('Revisa la fecha y la hora.');
        set.push('date=?', 'time=?'); vals.push(d, t);
      }
      for (const k of ['notes', 'medium', 'meet_link', 'topic'] as const) if (b[k] !== undefined) { set.push(`${k}=?`); vals.push(str(b[k], 2000)); }
      if (set.length) await db.run(`UPDATE atm_appointments SET ${set.join(',')} WHERE id=?`, ...vals, a.id);
      if (b.status && b.status !== a.status) {
        await logActivity(a.lead_id, 'estado', `Llamada del ${prettyDate(a.date)}: ${b.status}`);
        if (b.status === 'realizada') await db.run("UPDATE atm_leads SET stage=CASE WHEN stage IN ('nuevo','contactado','agendado') THEN 'propuesta' ELSE stage END, updated_at=datetime('now','-6 hours') WHERE id=?", a.lead_id);
      }
      if (b.date && (b.date !== a.date || b.time !== a.time)) await logActivity(a.lead_id, 'cita', `Llamada movida al ${prettyDate(str(b.date))} a las ${str(b.time ?? a.time)}`);
      const upd = await getAppointment(a.id);
      return json({ ok: true, item: upd && withLabels(upd) });
    }
    if (m === 'DELETE') {
      await db.run('DELETE FROM atm_appointments WHERE id=?', a.id);
      return json({ ok: true });
    }
  }

  /* ---------- Prospectos ---------- */
  if (r === 'prospectos') {
    if (m === 'GET' && !id) {
      const u = new URL(req.url);
      const q = `%${(u.searchParams.get('q') || '').trim().toLowerCase()}%`;
      const st = u.searchParams.get('etapa');
      const rows = await db.all(
        `SELECT l.*, (SELECT MAX(date||' '||time) FROM atm_appointments WHERE lead_id=l.id AND status<>'cancelada') last_appt,
         (SELECT COUNT(*) FROM atm_appointments WHERE lead_id=l.id) appts
         FROM atm_leads l WHERE (lower(l.name) LIKE ? OR lower(l.business) LIKE ? OR l.phone LIKE ? OR lower(l.email) LIKE ?) ${st ? 'AND l.stage=?' : ''}
         ORDER BY l.updated_at DESC LIMIT 500`, ...(st ? [q, q, q, q, st] : [q, q, q, q]));
      return json({ items: rows, stages: STAGES });
    }
    if (m === 'POST' && !id) {
      const b = await body(req);
      if (str(b.name).length < 2) throw new UserError('Escribe el nombre del prospecto.');
      const lid = await findOrCreateLead({
        name: str(b.name, 80), phone: str(b.phone, 20), email: str(b.email, 120), business: str(b.business, 100),
        industry: str(b.industry, 60), city: str(b.city, 60), interests: str(b.interests, 200), source: str(b.source, 30) || 'panel',
      });
      if (b.notes) await db.run('UPDATE atm_leads SET notes=? WHERE id=?', str(b.notes, 4000), lid);
      if (b.value) await db.run('UPDATE atm_leads SET value=? WHERE id=?', Number(b.value) || 0, lid);
      return json({ ok: true, id: lid });
    }
    const lead = await db.get<{ id: number; stage: string }>('SELECT * FROM atm_leads WHERE id=?', Number(id));
    if (!lead) return fail('No encontramos ese prospecto.', 404);
    if (m === 'GET') {
      const [activity, appts] = await Promise.all([
        db.all('SELECT * FROM atm_activity WHERE lead_id=? ORDER BY id DESC LIMIT 100', lead.id),
        db.all<Appointment>(`${APPT_SELECT} WHERE a.lead_id=? ORDER BY a.date DESC, a.time DESC`, lead.id),
      ]);
      return json({ lead, activity, appointments: appts.map(withLabels), stages: STAGES });
    }
    if (m === 'POST' && sub === 'nota') {
      const b = await body(req);
      const t = str(b.body, 2000);
      if (!t) throw new UserError('Escribe la nota.');
      await logActivity(lead.id, str(b.kind, 20) || 'nota', t);
      await db.run("UPDATE atm_leads SET updated_at=datetime('now','-6 hours') WHERE id=?", lead.id);
      return json({ ok: true });
    }
    if (m === 'PATCH') {
      const b = await body(req);
      const set: string[] = [];
      const vals: unknown[] = [];
      for (const k of LEAD_FIELDS) {
        if (b[k] === undefined) continue;
        let v: unknown = k === 'value' ? Number(b[k]) || 0 : k === 'phone' ? digits(b[k]).slice(0, 15) : str(b[k], k === 'notes' ? 4000 : 200);
        if (k === 'stage' && !STAGES.includes(String(v))) throw new UserError('Etapa no válida.');
        if (k === 'next_follow' && v && !isDate(v)) v = '';
        set.push(`${k}=?`); vals.push(v);
      }
      if (set.length) await db.run(`UPDATE atm_leads SET ${set.join(',')}, updated_at=datetime('now','-6 hours') WHERE id=?`, ...vals, lead.id);
      if (b.stage && b.stage !== lead.stage) await logActivity(lead.id, 'etapa', `Etapa: ${lead.stage} → ${b.stage}`);
      return json({ ok: true });
    }
    if (m === 'DELETE') {
      await db.run('DELETE FROM atm_activity WHERE lead_id=?', lead.id);
      await db.run('DELETE FROM atm_appointments WHERE lead_id=?', lead.id);
      await db.run('DELETE FROM atm_leads WHERE id=?', lead.id);
      return json({ ok: true });
    }
  }

  if (r === 'exportar') {
    const rows = await db.all<Record<string, unknown>>('SELECT id,name,phone,email,business,industry,city,interests,stage,value,source,next_follow,created_at FROM atm_leads ORDER BY id');
    const cols = ['id', 'name', 'phone', 'email', 'business', 'industry', 'city', 'interests', 'stage', 'value', 'source', 'next_follow', 'created_at'];
    const head = ['Folio', 'Nombre', 'WhatsApp', 'Correo', 'Negocio', 'Giro', 'Ciudad', 'Intereses', 'Etapa', 'Valor', 'Origen', 'Seguimiento', 'Alta'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + [head.map(esc).join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="prospectos-${nowMx().date}.csv"`, 'Cache-Control': 'no-store' } });
  }

  /* ---------- Disponibilidad ---------- */
  if (r === 'disponibilidad') {
    if (m === 'GET') {
      const [hours, blocked, config] = await Promise.all([
        db.all('SELECT * FROM atm_hours ORDER BY weekday'),
        db.all('SELECT * FROM atm_blocked WHERE date>=? ORDER BY date', nowMx().date),
        getConfig(),
      ]);
      return json({ hours, blocked, config, demo: DEMO });
    }
    if (m === 'PUT') {
      const b = await body<{ hours?: Record<string, unknown>[]; config?: Partial<Config> }>(req);
      for (const h of b.hours || []) {
        const wd = Number(h.weekday);
        if (!(wd >= 0 && wd <= 6)) continue;
        const t = (v: unknown) => (isTime(v) ? v : '');
        const start = t(h.start), end = t(h.end);
        if (h.open && (!start || !end || start >= end)) throw new UserError('Revisa los horarios: la hora de inicio va antes que la de cierre.');
        await db.run('UPDATE atm_hours SET open=?, start=?, end=?, break_start=?, break_end=? WHERE weekday=?', h.open ? 1 : 0, start, end, t(h.break_start), t(h.break_end), wd);
      }
      if (b.config) {
        const cur = await getConfig();
        const c = b.config;
        await setSetting('config', {
          ...cur,
          owner: c.owner !== undefined ? str(c.owner, 60) : cur.owner,
          whatsapp: c.whatsapp !== undefined ? digits(c.whatsapp).slice(0, 15) : cur.whatsapp,
          slot_step: c.slot_step !== undefined ? Math.min(Math.max(Number(c.slot_step) || 30, 10), 120) : cur.slot_step,
          min_notice_hours: c.min_notice_hours !== undefined ? Math.min(Math.max(Number(c.min_notice_hours) || 0, 0), 72) : cur.min_notice_hours,
          horizon_days: c.horizon_days !== undefined ? Math.min(Math.max(Number(c.horizon_days) || 21, 1), 90) : cur.horizon_days,
          meet_link: c.meet_link !== undefined ? str(c.meet_link, 200) : cur.meet_link,
          welcome: c.welcome !== undefined ? str(c.welcome, 300) : cur.welcome,
        });
      }
      return json({ ok: true });
    }
  }
  if (r === 'bloqueos') {
    if (m === 'POST') {
      const b = await body(req);
      const from = str(b.date, 10), to = str(b.until || b.date, 10);
      if (!isDate(from) || !isDate(to) || to < from) throw new UserError('Revisa las fechas.');
      for (let d = from, i = 0; d <= to && i < 92; d = addDays(d, 1), i++)
        await db.run('INSERT INTO atm_blocked(date,reason) VALUES(?,?) ON CONFLICT(date) DO UPDATE SET reason=excluded.reason', d, str(b.reason, 100));
      return json({ ok: true });
    }
    if (m === 'DELETE' && id) {
      await db.run('DELETE FROM atm_blocked WHERE date=?', id);
      return json({ ok: true });
    }
  }

  /* ---------- Conversaciones del chatbot ---------- */
  if (r === 'chats') {
    if (m === 'GET' && !id) {
      const u = new URL(req.url);
      const q = `%${(u.searchParams.get('q') || '').trim().toLowerCase()}%`;
      const items = await db.all(
        `SELECT c.jid,c.name,c.phone,c.stage,c.data,c.paused_until,c.lead_id,c.last_ts,c.last_text,c.last_from,c.msgs,c.created_ts,
          (SELECT COUNT(*) FROM atm_chat_messages x WHERE x.jid=c.jid AND x.sender='cliente' AND x.ts>c.seen_ts) unread
         FROM atm_chats c WHERE lower(c.name) LIKE ? OR c.phone LIKE ? OR lower(c.last_text) LIKE ? OR lower(c.data) LIKE ?
         ORDER BY c.last_ts DESC LIMIT 300`, q, q, q, q);
      const last = await getSetting<number>('bot_last_sync');
      const today0 = Date.parse(`${nowMx().date}T00:00:00-06:00`);
      const n = async (sql: string, ...p: unknown[]) => Number((await db.get<{ n: number }>(sql, ...p))?.n || 0);
      const [hoyIn, hoyBot, hoyHumano, hoyChats] = await Promise.all([
        n("SELECT COUNT(*) n FROM atm_chat_messages WHERE sender='cliente' AND ts>=?", today0),
        n("SELECT COUNT(*) n FROM atm_chat_messages WHERE sender='bot' AND ts>=?", today0),
        n("SELECT COUNT(*) n FROM atm_chat_messages WHERE sender='humano' AND ts>=?", today0),
        n('SELECT COUNT(DISTINCT jid) n FROM atm_chat_messages WHERE ts>=?', today0),
      ]);
      return json({ items, lastSync: last, connected: !!process.env.BOT_SYNC_KEY, stats: { hoyIn, hoyBot, hoyHumano, hoyChats } });
    }
    const jid = decodeURIComponent(id || '');
    const chat = await db.get<{ jid: string; name: string; phone: string; lead_id: number | null; data: string }>('SELECT * FROM atm_chats WHERE jid=?', jid);
    if (!chat) return fail('No encontramos esa conversación.', 404);
    if (m === 'GET') {
      const msgs = (await db.all('SELECT id,sender,body,ts FROM atm_chat_messages WHERE jid=? ORDER BY ts DESC, id DESC LIMIT 600', jid)).reverse();
      await db.run('UPDATE atm_chats SET seen_ts=last_ts WHERE jid=?', jid);
      return json({ chat, messages: msgs });
    }
    if (m === 'POST' && sub === 'prospecto') {
      if (chat.lead_id && (await db.get('SELECT id FROM atm_leads WHERE id=?', chat.lead_id))) return json({ ok: true, id: chat.lead_id });
      let d: Record<string, string> = {};
      try { d = JSON.parse(chat.data || '{}'); } catch { /* sin datos */ }
      const lid = await findOrCreateLead({
        name: d.nombre || chat.name || (chat.phone ? `WhatsApp ${chat.phone.slice(-10)}` : 'Contacto de WhatsApp'),
        phone: chat.phone, business: d.consultorio || d.negocio || '', city: d.ciudad || '', source: 'whatsapp',
      });
      await db.run('UPDATE atm_chats SET lead_id=? WHERE jid=?', lid, jid);
      await logActivity(lid, 'nota', 'Agregado desde una conversación del chatbot de WhatsApp');
      return json({ ok: true, id: lid });
    }
  }

  /* ---------- Tipos de reunión ---------- */
  if (r === 'tipos') {
    if (m === 'GET') return json({ items: await db.all('SELECT * FROM atm_meeting_types ORDER BY sort,id'), mediums: MEDIUM_LABEL });
    const b = await body(req);
    const fields = () => {
      const name = str(b.name, 80);
      if (name.length < 2) throw new UserError('Ponle nombre a la reunión.');
      const mediums = (Array.isArray(b.mediums) ? b.mediums : String(b.mediums || '').split(','))
        .map((x) => String(x).trim()).filter((x) => x in MEDIUM_LABEL);
      if (!mediums.length) throw new UserError('Elige al menos un medio: llamada, WhatsApp, Meet…');
      return [name, str(b.description, 400), Math.min(Math.max(Number(b.duration) || 30, 10), 180), mediums.join(','), b.active === false ? 0 : 1, Number(b.sort) || 0];
    };
    if (m === 'POST') {
      const r2 = await db.run('INSERT INTO atm_meeting_types(name,description,duration,mediums,active,sort) VALUES(?,?,?,?,?,?)', ...fields());
      return json({ ok: true, id: r2.id });
    }
    if (m === 'PATCH' && id) {
      await db.run('UPDATE atm_meeting_types SET name=?,description=?,duration=?,mediums=?,active=?,sort=? WHERE id=?', ...fields(), Number(id));
      return json({ ok: true });
    }
    if (m === 'DELETE' && id) {
      const used = await db.get<{ n: number }>('SELECT COUNT(*) n FROM atm_appointments WHERE type_id=?', Number(id));
      if (used?.n) await db.run('UPDATE atm_meeting_types SET active=0 WHERE id=?', Number(id));
      else await db.run('DELETE FROM atm_meeting_types WHERE id=?', Number(id));
      return json({ ok: true, archived: !!used?.n });
    }
  }

  return fail('No encontrado', 404);
}

function withLabels(a: Appointment) {
  return { ...a, label: prettyDate(a.date), medium_label: MEDIUM_LABEL[a.medium] || a.medium };
}

const h = route(handle);
export const GET = h;
export const POST = h;
export const PUT = h;
export const PATCH = h;
export const DELETE = h;
