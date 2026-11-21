/* Conversaciones del chatbot de WhatsApp (atumedida-bot). El bot las manda a /api/bot/sync
   y el panel las muestra en "Conversaciones". Solo lectura: el bot sigue contestando desde la PC o la Mac. */
import { db } from './db';
import { digits } from './agenda';

export type ChatIn = {
  jid: string;
  name?: string;
  phone?: string;
  stage?: string;
  data?: Record<string, unknown>;
  paused_until?: number;
  created_ts?: number;
  messages: { from: string; text: string; ts: number }[];
};

const SENDERS = new Set(['cliente', 'bot', 'humano', 'sistema']);
const s = (v: unknown, max: number) => String(v ?? '').slice(0, max);

export async function ingest(chats: ChatIn[]) {
  let mensajes = 0;
  for (const c of chats.slice(0, 50)) {
    const jid = s(c.jid, 120);
    if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') continue;
    const msgs = (Array.isArray(c.messages) ? c.messages : [])
      .filter((m) => m && SENDERS.has(m.from) && Number(m.ts) > 0)
      .slice(-500);
    const phone = digits(c.phone || (jid.endsWith('@s.whatsapp.net') ? jid.split('@')[0] : '')).slice(0, 15);
    await db.batch([
      [
        `INSERT INTO atm_chats(jid,name,phone,stage,data,paused_until,created_ts) VALUES(?,?,?,?,?,?,?)
         ON CONFLICT(jid) DO UPDATE SET name=CASE WHEN excluded.name<>'' THEN excluded.name ELSE atm_chats.name END,
           phone=CASE WHEN excluded.phone<>'' THEN excluded.phone ELSE atm_chats.phone END,
           stage=excluded.stage, data=excluded.data, paused_until=excluded.paused_until,
           created_ts=CASE WHEN atm_chats.created_ts>0 THEN atm_chats.created_ts ELSE excluded.created_ts END`,
        jid, s(c.name, 80), phone, s(c.stage, 40), JSON.stringify(c.data || {}).slice(0, 4000), Number(c.paused_until) || 0, Number(c.created_ts) || Date.now(),
      ],
      ...msgs.map((m) => ['INSERT OR IGNORE INTO atm_chat_messages(jid,sender,body,ts) VALUES(?,?,?,?)', jid, m.from, s(m.text, 4000), Math.floor(Number(m.ts))] as [string, ...unknown[]]),
      [
        `UPDATE atm_chats SET msgs=(SELECT COUNT(*) FROM atm_chat_messages WHERE jid=?),
           last_ts=COALESCE((SELECT MAX(ts) FROM atm_chat_messages WHERE jid=?),0),
           last_text=COALESCE((SELECT body FROM atm_chat_messages WHERE jid=? ORDER BY ts DESC, id DESC LIMIT 1),''),
           last_from=COALESCE((SELECT sender FROM atm_chat_messages WHERE jid=? ORDER BY ts DESC, id DESC LIMIT 1),'') WHERE jid=?`,
        jid, jid, jid, jid, jid,
      ],
    ]);
    mensajes += msgs.length;
  }
  await db.run(
    "INSERT INTO atm_settings(key,value) VALUES('bot_last_sync',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    JSON.stringify(Date.now()),
  );
  return { chats: chats.length, mensajes };
}
