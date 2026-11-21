// Manda las conversaciones del bot al panel de ventas de atumedidatech.online (sección "Conversaciones").
// Se activa solo si el .env tiene PANEL_SYNC_URL y PANEL_SYNC_KEY. Si el panel no responde, el bot sigue igual.
import { bus, getDb } from './store.js';

const URL_SYNC = (process.env.PANEL_SYNC_URL || '').replace(/\/$/, '');
const KEY = process.env.PANEL_SYNC_KEY || '';
const pendientes = new Set();
let timer = null;
let enviando = false;

const esChat = (c) => c && !c.esGrupo && c.jid && !String(c.jid).endsWith('@g.us') && c.jid !== 'status@broadcast';

function aPanel(c) {
  const d = c.datos || {};
  return {
    jid: c.jid,
    name: d.nombre || c.nombreWhatsApp || '',
    phone: c.telefono || '',
    stage: c.venta?.estado === 'ganada' ? 'venta ganada' : c.venta?.estado === 'perdida' ? 'venta perdida' : c.etapa || '',
    data: d,
    paused_until: c.pausadoHasta || 0,
    created_ts: c.creadoEn || 0,
    messages: (c.historial || []).slice(-300).map((h) => ({ from: h.de, text: String(h.texto ?? ''), ts: h.ts })),
  };
}

async function enviar(chats) {
  const r = await fetch(URL_SYNC + '/api/bot/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bot-key': KEY },
    body: JSON.stringify({ chats }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function vaciar() {
  if (enviando || !pendientes.size) return;
  enviando = true;
  const jids = [...pendientes];
  pendientes.clear();
  try {
    const db = getDb();
    const chats = jids.map((j) => db.clientes[j]).filter(esChat).map(aPanel);
    for (let i = 0; i < chats.length; i += 5) await enviar(chats.slice(i, i + 5));
  } catch (e) {
    for (const j of jids) pendientes.add(j); // se reintenta en el siguiente ciclo
    console.error('[panel] no se pudieron mandar las conversaciones:', e.message);
  } finally {
    enviando = false;
  }
}

export function iniciarSyncPanel() {
  if (!URL_SYNC || !KEY) return;
  for (const c of Object.values(getDb().clientes)) if (esChat(c)) pendientes.add(c.jid);
  bus.on('historial', (c) => {
    if (!esChat(c)) return;
    pendientes.add(c.jid);
    clearTimeout(timer);
    timer = setTimeout(vaciar, 3000);
  });
  setInterval(vaciar, 60000).unref?.();
  setTimeout(vaciar, 5000);
  console.log(`  ✓ Conversaciones al panel: ${URL_SYNC}/panel`);
}
