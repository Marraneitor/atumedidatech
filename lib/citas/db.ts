/* =========================================================
   AGENDA Y CRM DE A TU MEDIDA TECH — base de datos
   Basado en el CRM dental (misma forma, adaptado a llamadas de venta).

   La base vive en Turso. En Vercel conecta la base en Storage (crea
   TURSO_DATABASE_URL y TURSO_AUTH_TOKEN) o pon CITAS_DB_URL y CITAS_DB_TOKEN.
   Sin ellas corre en MODO DEMOSTRACIÓN: base temporal en /tmp con datos de ejemplo,
   que se borra sola. Ver CITAS.md.
   ========================================================= */
import { createClient, type Client, type InValue } from '@libsql/client';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const REMOTE_URL = process.env.CITAS_DB_URL || process.env.TURSO_DATABASE_URL || '';
const TOKEN = process.env.CITAS_DB_TOKEN || process.env.TURSO_AUTH_TOKEN;
export const DEMO = !REMOTE_URL;
const URL = REMOTE_URL || 'file:' + path.join(os.tmpdir(), 'atm-citas-demo.db');

type G = typeof globalThis & { __atmDb?: Client; __atmReady?: Promise<void> };
const g = globalThis as G;
const client: Client = (g.__atmDb ??= createClient({ url: URL, authToken: TOKEN }));

type Row = Record<string, unknown>;
const toArgs = (p: unknown[]): InValue[] =>
  p.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : (v as InValue)));

export const db = {
  async all<T = Row>(sql: string, ...p: unknown[]): Promise<T[]> {
    const rs = await client.execute({ sql, args: toArgs(p) });
    return rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, r[i]]))) as T[];
  },
  async get<T = Row>(sql: string, ...p: unknown[]): Promise<T | undefined> {
    return (await db.all<T>(sql, ...p))[0];
  },
  /** Varias sentencias en una sola transacción (y un solo viaje a Turso). */
  async batch(stmts: [string, ...unknown[]][]) {
    if (!stmts.length) return;
    await client.batch(stmts.map(([sql, ...p]) => ({ sql, args: toArgs(p) })), 'write');
  },
  async run(sql: string, ...p: unknown[]) {
    const rs = await client.execute({ sql, args: toArgs(p) });
    return { id: rs.lastInsertRowid == null ? 0 : Number(rs.lastInsertRowid), changes: rs.rowsAffected };
  },
};

/* Las fechas se guardan en hora del centro de México (UTC-6, sin horario de verano). */
const NOW = "datetime('now','-6 hours')";
const SCHEMA = `
CREATE TABLE IF NOT EXISTS atm_settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS atm_meeting_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '',
  duration INTEGER DEFAULT 30, mediums TEXT DEFAULT 'llamada,whatsapp,meet', active INTEGER DEFAULT 1, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS atm_hours (
  weekday INTEGER PRIMARY KEY, open INTEGER DEFAULT 1, start TEXT, end TEXT, break_start TEXT, break_end TEXT);
CREATE TABLE IF NOT EXISTS atm_blocked (date TEXT PRIMARY KEY, reason TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS atm_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT DEFAULT '', email TEXT DEFAULT '',
  business TEXT DEFAULT '', industry TEXT DEFAULT '', city TEXT DEFAULT '', interests TEXT DEFAULT '',
  stage TEXT DEFAULT 'nuevo', value REAL DEFAULT 0, source TEXT DEFAULT 'web', notes TEXT DEFAULT '',
  next_follow TEXT DEFAULT '', created_at TEXT DEFAULT (${NOW}), updated_at TEXT DEFAULT (${NOW}));
CREATE TABLE IF NOT EXISTS atm_appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER REFERENCES atm_leads(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES atm_meeting_types(id) ON DELETE SET NULL,
  date TEXT NOT NULL, time TEXT NOT NULL, duration INTEGER DEFAULT 30, medium TEXT DEFAULT 'llamada',
  status TEXT DEFAULT 'pendiente', topic TEXT DEFAULT '', notes TEXT DEFAULT '', meet_link TEXT DEFAULT '',
  source TEXT DEFAULT 'web', token TEXT, created_at TEXT DEFAULT (${NOW}));
CREATE TABLE IF NOT EXISTS atm_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER REFERENCES atm_leads(id) ON DELETE CASCADE,
  kind TEXT DEFAULT 'nota', body TEXT DEFAULT '', created_at TEXT DEFAULT (${NOW}));
CREATE TABLE IF NOT EXISTS atm_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT, session TEXT, path TEXT, referrer TEXT, device TEXT,
  created_at TEXT DEFAULT (${NOW}));
CREATE TABLE IF NOT EXISTS atm_chats (
  jid TEXT PRIMARY KEY, name TEXT DEFAULT '', phone TEXT DEFAULT '', stage TEXT DEFAULT '', data TEXT DEFAULT '{}',
  paused_until INTEGER DEFAULT 0, lead_id INTEGER, last_ts INTEGER DEFAULT 0, last_text TEXT DEFAULT '', last_from TEXT DEFAULT '',
  msgs INTEGER DEFAULT 0, created_ts INTEGER DEFAULT 0, seen_ts INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS atm_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, jid TEXT NOT NULL, sender TEXT NOT NULL, body TEXT DEFAULT '', ts INTEGER NOT NULL,
  UNIQUE(jid, ts, sender, body));
CREATE INDEX IF NOT EXISTS atm_idx_chatmsg ON atm_chat_messages(jid, ts);
CREATE INDEX IF NOT EXISTS atm_idx_chats_last ON atm_chats(last_ts);
CREATE TABLE IF NOT EXISTS atm_sessions (token TEXT PRIMARY KEY, created_at TEXT DEFAULT (${NOW}));
CREATE INDEX IF NOT EXISTS atm_idx_appt_date ON atm_appointments(date);
CREATE INDEX IF NOT EXISTS atm_idx_visits_date ON atm_visits(created_at);
CREATE INDEX IF NOT EXISTS atm_idx_activity_lead ON atm_activity(lead_id);
`;

export type Config = {
  owner: string;
  whatsapp: string;
  timezone: string;
  slot_step: number;
  min_notice_hours: number;
  horizon_days: number;
  meet_link: string;
  welcome: string;
};

export const DEFAULT_CONFIG: Config = {
  owner: 'Joel',
  whatsapp: '529223220389',
  timezone: 'Hora del centro de México',
  slot_step: 30,
  min_notice_hours: 2,
  horizon_days: 21,
  meet_link: '',
  welcome: 'Elige el tema, el día y la hora. Te confirmamos por WhatsApp y platicamos sin compromiso.',
};

async function seed() {
  await setSetting('config', DEFAULT_CONFIG);
  const types: [string, string, number, string][] = [
    ['Diagnóstico gratis', 'Platicamos 20 minutos sobre tu negocio y te decimos qué te conviene: página, CRM, chatbot o POS.', 20, 'llamada,whatsapp,meet'],
    ['Demo del CRM con chatbot', 'Te mostramos en vivo el panel de citas, el chatbot de WhatsApp y los reportes, con ejemplos de tu giro.', 30, 'meet,whatsapp'],
    ['Página web y comerciales', 'Revisamos tu presencia en internet y te mostramos ejemplos de páginas y videos que venden.', 30, 'meet,whatsapp,llamada'],
    ['Sistema POS para tu negocio', 'Caja, inventario y reportes: vemos cómo trabajas hoy y cómo quedaría con el sistema.', 30, 'meet,llamada'],
  ];
  for (const [i, [name, description, duration, mediums]] of types.entries())
    await db.run('INSERT INTO atm_meeting_types(name,description,duration,mediums,sort) VALUES(?,?,?,?,?)', name, description, duration, mediums, i);
  // Lunes a viernes 10:00–19:00 con comida 14:00–16:00; sábado 10:00–14:00; domingo cerrado.
  for (let d = 0; d < 7; d++) {
    const open = d !== 0;
    const sat = d === 6;
    await db.run(
      'INSERT INTO atm_hours(weekday,open,start,end,break_start,break_end) VALUES(?,?,?,?,?,?)',
      d, open ? 1 : 0, '10:00', sat ? '14:00' : '19:00', sat ? '' : '14:00', sat ? '' : '16:00',
    );
  }
  const pw = process.env.PANEL_PASSWORD || (DEMO ? 'demo' : '');
  if (pw) await setSetting('password', hashPassword(pw));
}

async function init() {
  await client.executeMultiple(SCHEMA);
  const has = await db.get<{ n: number }>("SELECT COUNT(*) n FROM atm_settings WHERE key='config'");
  if (!has?.n) {
    await seed();
    if (DEMO) await (await import('./demo')).seedDemo();
  } else if (process.env.PANEL_PASSWORD && !(await getSetting('password'))) {
    await setSetting('password', hashPassword(process.env.PANEL_PASSWORD));
  }
}

/** Espera a que la base esté lista (crea tablas y datos iniciales la primera vez). */
export function ready() {
  g.__atmReady ??= init().catch((e) => {
    g.__atmReady = undefined;
    throw e;
  });
  return g.__atmReady;
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const r = await db.get<{ value: string }>('SELECT value FROM atm_settings WHERE key=?', key);
  return r ? (JSON.parse(r.value) as T) : null;
}
export async function setSetting(key: string, value: unknown) {
  await db.run(
    'INSERT INTO atm_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    key, JSON.stringify(value),
  );
}
export async function getConfig(): Promise<Config> {
  return { ...DEFAULT_CONFIG, ...((await getSetting<Partial<Config>>('config')) || {}) };
}

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
}
export function checkPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const h = crypto.scryptSync(pw, salt, 64);
  const b = Buffer.from(hash, 'hex');
  return b.length === h.length && crypto.timingSafeEqual(h, b);
}
export const newToken = (bytes = 24) => crypto.randomBytes(bytes).toString('hex');
