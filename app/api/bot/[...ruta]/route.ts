/* Entrada del chatbot de WhatsApp: el bot manda aquí sus conversaciones (ver CITAS.md). */
import crypto from 'node:crypto';
import { ingest, type ChatIn } from '@/lib/citas/chats';
import { body, fail, json, route } from '@/lib/citas/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function keyOk(req: Request) {
  const want = process.env.BOT_SYNC_KEY || '';
  const got = req.headers.get('x-bot-key') || '';
  if (want.length < 16 || got.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export const POST = route(async (req, [r]) => {
  if (r !== 'sync') return fail('No encontrado', 404);
  if (!process.env.BOT_SYNC_KEY) return fail('Falta BOT_SYNC_KEY en el servidor', 503);
  if (!keyOk(req)) return fail('Clave del bot incorrecta', 401);
  const b = await body<{ chats?: ChatIn[] }>(req);
  return json({ ok: true, ...(await ingest(Array.isArray(b.chats) ? b.chats : [])) });
});

export const GET = route(async (req, [r]) => {
  if (r !== 'ping') return fail('No encontrado', 404);
  return json({ ok: keyOk(req) });
});
